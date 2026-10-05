import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  GraduationCap,
  Building2,
  Stethoscope,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  IndianRupee,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../../services/dataService";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";
import Toast from "../../components/common/Toast";

/**
 * Sanitizes search input to prevent SQL Injection attempts and malicious payload evaluation.
 * Strips SQL meta-characters, SQL command keywords, and boolean injection tautologies.
 */
export function sanitizeSearchQuery(input = "") {
  if (typeof input !== "string") return "";
  let clean = input.slice(0, 60);
  // Strip dangerous SQL syntax characters: quotes, backticks, semicolons, comments, backslashes, HTML/script tags
  clean = clean.replace(/['"`\\;#<>{}]/g, "");
  clean = clean.replace(/--+/g, "");
  clean = clean.replace(/\/\*[\s\S]*?\*\//g, "");
  // Strip dangerous SQL command keywords (case-insensitive)
  const sqlKeywords =
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|TRUNCATE|DECLARE|CAST|CONVERT|WHERE|FROM|XP_)\b/gi;
  clean = clean.replace(sqlKeywords, "");
  // Strip SQL boolean bypass tautologies (e.g. OR 1=1, AND '1'='1')
  clean = clean.replace(/\b(OR|AND)\s+['"\w\d]+\s*=\s*['"\w\d]+/gi, "");
  // Only allow valid search characters: alphanumeric, spaces, hyphens, commas, ampersands, slashes, periods
  clean = clean.replace(/[^a-zA-Z0-9\s,\-&/.]/g, "");
  return clean;
}

export default function DoctorList() {
  const navigate = useNavigate();
  const { bookingHospital, bookingSpecialty, doctor, setDoctor } = useBooking();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "error",
  });
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (!bookingHospital || !bookingSpecialty) {
      navigate("/doctors/specialty");
      return;
    }

    async function fetchDocs() {
      try {
        setLoading(true);
        // Fetch docs for the selected hospital location and specialty
        const res = await getDoctors({
          pageSize: 200,
          location_key: bookingHospital.entitylocation,
          filter: bookingSpecialty,
        });
        const allDocs = Array.isArray(res) ? res : res.list || res.data || [];

        const targetSpec = (bookingSpecialty || "").toLowerCase().trim();
        const targetHospName = (bookingHospital?.name || "").toLowerCase().trim();
        const hospitalCity = (bookingHospital?.city || "").toLowerCase().trim();
        const hospitalEntityLocation = (bookingHospital?.entitylocation || bookingHospital?.location_key || "").toLowerCase().trim();

        // Create whole-word matcher to prevent substring false-positives (e.g. "Dental" matching "ENT")
        const escapedSpec = targetSpec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const specWordRegex = new RegExp(`\\b${escapedSpec}\\b`, "i");

        const checkSpecMatch = (d) => {
          if (!targetSpec) return true;

          const docFullSpec = (
            d.specialty ||
            (Array.isArray(d.speciality) ? d.speciality.join(", ") : d.speciality) ||
            ""
          ).toLowerCase().trim();

          // 1. Direct full match (e.g. "Consultant Physician, Intensivist" === "Consultant Physician, Intensivist")
          if (docFullSpec === targetSpec) return true;

          // 2. Extract doctor specialty parts (handles array or comma-separated string)
          const docParts = (
            Array.isArray(d.speciality)
              ? d.speciality
              : Array.isArray(d.specialty)
                ? d.specialty
                : (d.specialty || d.speciality || "").split(",")
          ).map((p) => String(p || "").toLowerCase().trim()).filter(Boolean);

          const targetParts = targetSpec.split(",").map((p) => p.trim()).filter(Boolean);

          // If target is composite with multiple specialties (e.g. "Consultant Physician, Intensivist")
          if (targetParts.length > 1) {
            const allTargetPartsInDoc = targetParts.every((tp) => {
              const escaped = tp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const wordRegex = new RegExp(`\\b${escaped}\\b`, "i");
              return docParts.some((dp) => dp === tp || wordRegex.test(dp));
            });
            if (allTargetPartsInDoc) return true;
          }

          // If target is a single specialty or doctor has multiple parts
          return docParts.some((dp) => {
            return dp === targetSpec || specWordRegex.test(dp);
          });
        };

        // Filter by specialty and hospital strictly matching SpecialtySelection criteria
        const specialtyDocs = allDocs.filter((d) => {
          const specialtyMatch = checkSpecMatch(d);

          const locs = Array.isArray(d.locations)
            ? d.locations
            : d.locations
              ? [d.locations]
              : [];

          const matchesHospital = locs.some((l) => {
            const locKey = (l.location_key || l.entitylocation || "").toLowerCase().trim();
            if (hospitalEntityLocation && locKey === hospitalEntityLocation) return true;

            const locName = (l.locname || l.name || l.alt_name || "").toLowerCase().trim();
            return (
              locName === targetHospName ||
              locName.replace(/s$/, "") === targetHospName.replace(/s$/, "") ||
              locName.includes(targetHospName) ||
              targetHospName.includes(locName)
            );
          });

          let matchesCity = true;
          if (hospitalCity) {
            const docCity = (d.city || "").toLowerCase().trim();
            matchesCity =
              docCity === hospitalCity ||
              locs.some(
                (l) => (l.city || "").toLowerCase().trim() === hospitalCity
              );
          }

          return specialtyMatch && matchesHospital && matchesCity;
        });

        // Resilient fallback if strict hospital locs array had different string naming
        const finalDocs =
          specialtyDocs.length > 0
            ? specialtyDocs
            : allDocs.filter((d) => {
                const specialtyMatch = checkSpecMatch(d);

                const locs = Array.isArray(d.locations)
                  ? d.locations
                  : d.locations
                    ? [d.locations]
                    : [];
                const partialHospMatch = locs.some((l) => {
                  const locKey = (l.location_key || l.entitylocation || "").toLowerCase().trim();
                  if (hospitalEntityLocation && locKey === hospitalEntityLocation) return true;
                  const locName = (l.locname || l.name || l.alt_name || "").toLowerCase().trim();
                  return locName.includes(targetHospName) || targetHospName.includes(locName);
                });

                return specialtyMatch && (locs.length === 0 || partialHospMatch);
              });

        setDoctors(finalDocs);

        // Auto-select if only 1 doctor returned and no doctor is currently selected
        if (finalDocs.length === 1 && !doctor) {
          setDoctor(finalDocs[0]);
        }
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [bookingHospital, bookingSpecialty, navigate]);

  // Clean initials helper
  const getInitials = (name) => {
    if (!name) return "DR";
    const cleanName = name.replace(/^Dr\.?\s+/i, "").trim();
    if (!cleanName) return "DR";
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2 && parts[parts.length - 1].length > 0) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  // Filtered doctors list based on search (sanitized) and pills
  const displayedDocs = useMemo(() => {
    const q = sanitizeSearchQuery(searchQ).trim().toLowerCase();
    return doctors.filter((d) => {
      const name = (d.name || "").toLowerCase();
      const qual = (d.qualification || "").toLowerCase();
      const spec = (d.specialty || "").toLowerCase();
      const city = (d.city || "").toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        qual.includes(q) ||
        spec.includes(q) ||
        city.includes(q);
      if (!matchesSearch) return false;

      if (selectedFilter === "experienced") {
        return parseInt(d.experience) >= 10;
      }
      return true;
    });
  }, [doctors, searchQ, selectedFilter]);

  // Frontend Pagination - Only 5 cards per page
  const totalPages = Math.ceil(displayedDocs.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedDocs.slice(start, start + ITEMS_PER_PAGE);
  }, [displayedDocs, currentPage, ITEMS_PER_PAGE]);

  const handleSearchChange = (e) => {
    const sanitized = sanitizeSearchQuery(e.target.value);
    setSearchQ(sanitized);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQ("");
    setSelectedFilter("all");
    setCurrentPage(1);
  };

  const handleSelect = (doc) => {
    setDoctor(doc);
  };

  const handleProceed = (doc) => {
    const targetDoc = doc || doctor;
    if (!targetDoc) {
      setToast({
        isOpen: true,
        message: "Please select a doctor to proceed.",
        type: "error",
      });
      return;
    }
    setDoctor(targetDoc);
    navigate("/doctors/visit-type");
  };

  const hospitalDisplayName = bookingHospital?.name || "Hospital";

  return (
    <>
      <BookingLayout
        currentStep={2}
        title="Select a Doctor"
        subtitle={`Find and book an appointment with our specialist physicians at ${hospitalDisplayName}.`}
      >
        <div className="hospital-selection-container">
          {/* Controls Bar: Search Input with SQL Protection & Metadata Indicators */}
          <div className="hospital-controls-bar">
            <div className="hospital-search-box">
              <Search
                size={16}
                color="var(--primary)"
                style={{ flexShrink: 0 }}
              />
              <input
                type="text"
                className="hospital-search-input"
                placeholder="Search doctors by name, qualification, or department..."
                value={searchQ}
                onChange={handleSearchChange}
                maxLength={60}
                autoComplete="off"
                aria-label="Search doctors"
              />
              {searchQ && (
                <button
                  type="button"
                  className="hospital-search-clear"
                  onClick={handleClearSearch}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="hospital-meta-indicators">
              <span className="hospital-count-badge">
                {displayedDocs.length}{" "}
                {displayedDocs.length === 1 ? "doctor" : "doctors"} available
              </span>
              <span className="hospital-location-tag">
                <Building2 size={11} /> {hospitalDisplayName}
              </span>
              {bookingSpecialty && (
                <span
                  className="hospital-location-tag"
                  style={{ background: "rgba(46, 102, 110, 0.06)" }}
                >
                  <Stethoscope size={11} /> {bookingSpecialty}
                </span>
              )}
            </div>
          </div>

          {/* Doctor Cards Content Area (5 Cards Per Page) */}
          <div
            className="styled-scrollbar"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              paddingRight: "2px",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "50px 0",
                  gap: "14px",
                }}
              >
                <div
                  className="spinner"
                  style={{
                    borderTopColor: "var(--primary)",
                    width: "36px",
                    height: "36px",
                    border: "3px solid rgba(46, 102, 110, 0.15)",
                    borderRadius: "50%",
                    animation: "spin 0.9s linear infinite",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    fontWeight: "500",
                  }}
                >
                  Loading specialists for {bookingSpecialty}...
                </span>
              </div>
            ) : doctors.length === 0 ? (
              <div className="hospital-empty-state">
                <div className="hospital-empty-icon-wrap">
                  <User size={30} />
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--text-main)",
                    margin: "4px 0 2px",
                  }}
                >
                  No Specialists Available
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    maxWidth: "380px",
                    margin: "0 auto",
                    lineHeight: 1.45,
                  }}
                >
                  There are currently no specialists registered under{" "}
                  {bookingSpecialty} at {hospitalDisplayName}.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/doctors/specialty")}
                  style={{
                    marginTop: "10px",
                    padding: "8px 18px",
                    fontSize: "13px",
                    borderRadius: "10px",
                  }}
                >
                  Choose Another Specialty
                </button>
              </div>
            ) : displayedDocs.length === 0 ? (
              <div className="hospital-empty-state">
                <div className="hospital-empty-icon-wrap">
                  <Search size={28} />
                </div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--text-main)",
                    margin: "4px 0 2px",
                  }}
                >
                  No Results for "{searchQ}"
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "12.5px",
                    maxWidth: "340px",
                    margin: "0 auto",
                  }}
                >
                  Try searching by a different spelling, name, or qualification.
                </p>
                <button
                  type="button"
                  className="hospital-filter-pill active"
                  onClick={handleClearSearch}
                  style={{ marginTop: "8px" }}
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <>
                <div className="doctor-cards-grid">
                  {paginatedDocs.map((doc) => {
                    const isSelected = Boolean(
                      doctor &&
                      ((doctor.id &&
                        doc.id &&
                        String(doctor.id) === String(doc.id)) ||
                        (doctor.drkey &&
                          doc.drkey &&
                          String(doctor.drkey) === String(doc.drkey)) ||
                        (doctor.drkey &&
                          doc.id &&
                          String(doctor.drkey) === String(doc.id)) ||
                        (doctor.id &&
                          doc.drkey &&
                          String(doctor.id) === String(doc.drkey)) ||
                        (doctor.doctor_id &&
                          doc.doctor_id &&
                          String(doctor.doctor_id) === String(doc.doctor_id)) ||
                        (doctor.name &&
                          doc.name &&
                          doctor.name.trim().toLowerCase() ===
                            doc.name.trim().toLowerCase())),
                    );
                    const hasValidImage =
                      doc.image && !doc.image.includes("ui-avatars");
                    const doctorName = doc.name
                      ? doc.name.startsWith("Dr")
                        ? doc.name
                        : `Dr. ${doc.name}`
                      : "Doctor";
                    const qualificationText =
                      doc.qualification || "M.B.B.S, Specialist";
                    const specialtyText = doc.specialty || bookingSpecialty;
                    const feeText = doc.consultationFee
                      ? doc.consultationFee.replace("₹", "")
                      : doc.fee
                        ? `${doc.fee}`
                        : null;

                    return (
                      <article
                        key={doc.doctor_id || doc.id || doc.name}
                        role="button"
                        tabIndex={0}
                        aria-selected={isSelected}
                        onClick={() => handleSelect(doc)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(doc);
                          }
                        }}
                        className={`doctor-card ${isSelected ? "is-selected" : ""}`}
                      >
                        {/* Top Header: Avatar, Name, Degree, Selection Status */}
                        <div className="doctor-card-header">
                          <div
                            className="doctor-avatar-wrap"
                            aria-hidden="true"
                          >
                            {hasValidImage ? (
                              <img
                                src={doc.image}
                                alt={doc.name}
                                className="doctor-avatar-img"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="doctor-avatar-initials">
                                {getInitials(doc.name)}
                              </span>
                            )}
                          </div>

                          <div className="doctor-header-info">
                            <h3 className="doctor-card-name" title={doctorName}>
                              {doctorName}
                            </h3>

                            <div className="doctor-card-qualification">
                              <GraduationCap size={12} color="var(--primary)" />
                            
                              <span>{qualificationText}</span>
                            </div>

                            <div
                              className="doctor-card-specialty"
                              title={specialtyText}
                            >
                              {specialtyText}
                            </div>
                          </div>

                          {/* Top Right Radio Circle matching HospitalSelection & SpecialtySelection */}
                          <div
                            className="doctor-card-select-btn"
                            aria-hidden="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(doc);
                            }}
                          >
                            <div
                              className={`doctor-radio-circle ${isSelected ? "is-selected" : ""}`}
                            >
                              {isSelected && (
                                <Check size={11} strokeWidth={3} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Meta Strip: Clinic Location & Consultation Fee (No excess whitespace) */}
                        <div className="doctor-meta-strip">
                          <span className="doctor-meta-chip">
                            <Building2 size={11} /> {hospitalDisplayName}
                          </span>

                          {feeText && (
                            <span
                              className="doctor-fee-chip"
                              title="Consultation Fee"
                            >
                              <IndianRupee size={10} strokeWidth={2.5} />
                              <span>{feeText}</span>
                              <span
                                style={{
                                  fontSize: "9.5px",
                                  color: "var(--text-muted)",
                                  fontWeight: "500",
                                  marginLeft: "1px",
                                }}
                              >
                                Fee
                              </span>
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Frontend Pagination Controls for 5 cards per page */}
                {displayedDocs.length > 0 && (
                  <div className="doctor-pagination-bar">
                    <span className="pagination-info-text">
                      Showing{" "}
                      <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–
                      <strong>
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          displayedDocs.length,
                        )}
                      </strong>{" "}
                      of <strong>{displayedDocs.length}</strong> doctors
                    </span>

                    {totalPages > 1 && (
                      <div className="pagination-controls">
                        <button
                          type="button"
                          className="pagination-btn"
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={14} /> Prev
                        </button>

                        <div className="pagination-pages-list">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              className={`pagination-num-btn ${currentPage === pageNum ? "active" : ""}`}
                              onClick={() => setCurrentPage(pageNum)}
                              aria-label={`Page ${pageNum}`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="pagination-btn"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          aria-label="Next page"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pinned Responsive Action Bar matching HospitalSelection & SpecialtySelection */}
          <div className="booking-action-bar">
            <div>
              {doctor ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "var(--text-main)",
                    minWidth: 0,
                  }}
                >
                  <CheckCircle2
                    size={17}
                    color="var(--primary)"
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                      minWidth: 0,
                    }}
                  >
                    <span>
                      Selected:{" "}
                      <strong
                        style={{
                          color: "var(--primary-dark)",
                          fontWeight: "750",
                        }}
                      >
                        {doctor.name.startsWith("Dr")
                          ? doctor.name
                          : `Dr. ${doctor.name}`}
                      </strong>
                    </span>
                    {doctor.specialty && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "11px",
                          background: "rgba(0,0,0,0.04)",
                          padding: "1.5px 6px",
                          borderRadius: "6px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doctor.specialty}
                      </span>
                    )}
                    {doctor.consultationFee && (
                      <span
                        style={{
                          color: "var(--primary-dark)",
                          fontSize: "11px",
                          background: "rgba(46, 102, 110, 0.08)",
                          padding: "1.5px 6px",
                          borderRadius: "6px",
                          fontWeight: "650",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doctor.consultationFee}
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Please select a doctor above to proceed
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleProceed(doctor)}
              style={{
                padding: "11px 26px",
                fontSize: "14.5px",
                fontWeight: "650",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: doctor ? 1 : 0.65,
                cursor: "pointer",
                boxShadow: doctor
                  ? "0 4px 14px rgba(46, 102, 110, 0.25)"
                  : "none",
                transition: "all 0.2s ease",
              }}
            >
              Next Step <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </BookingLayout>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
}
