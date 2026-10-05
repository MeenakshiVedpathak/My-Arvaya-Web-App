import { useState, useEffect, useMemo } from "react";
import { 
  Stethoscope, 
  ArrowRight, 
  Search, 
  X, 
  Building2, 
  CheckCircle2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  HeartPulse, 
  Brain, 
  Baby, 
  Eye, 
  Activity, 
  Sparkles 
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
  const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|TRUNCATE|DECLARE|CAST|CONVERT|WHERE|FROM|XP_)\b/gi;
  clean = clean.replace(sqlKeywords, "");
  // Strip SQL boolean bypass tautologies (e.g. OR 1=1, AND '1'='1')
  clean = clean.replace(/\b(OR|AND)\s+['"\w\d]+\s*=\s*['"\w\d]+/gi, "");
  // Only allow valid search characters: alphanumeric, spaces, hyphens, commas, ampersands, slashes, periods
  clean = clean.replace(/[^a-zA-Z0-9\s,\-&/.]/g, "");
  return clean;
}

function getSpecialtyIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("cardio") || n.includes("heart")) return HeartPulse;
  if (n.includes("neuro") || n.includes("brain") || n.includes("psych")) return Brain;
  if (n.includes("pediatric") || n.includes("child") || n.includes("baby")) return Baby;
  if (n.includes("eye") || n.includes("ophthalm")) return Eye;
  if (n.includes("derma") || n.includes("skin") || n.includes("plastic")) return Sparkles;
  if (n.includes("radio") || n.includes("xray") || n.includes("imaging") || n.includes("scan")) return Activity;
  if (n.includes("gastro") || n.includes("uro") || n.includes("nephro") || n.includes("endo")) return Activity;
  if (n.includes("surgeon") || n.includes("surgery") || n.includes("onco")) return Activity;
  return Stethoscope;
}

export default function SpecialtySelection() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });
  const ITEMS_PER_PAGE = 5;

  const navigate = useNavigate();
  const { bookingHospital, bookingSpecialty, setBookingSpecialty } = useBooking();

  useEffect(() => {
    if (!bookingHospital) {
      navigate("/doctors");
      return;
    }

    async function loadSpecialties() {
      try {
        setLoading(true);
        const res = await getDoctors({ pageSize: 200, location_key: bookingHospital.entitylocation });
        const docs = Array.isArray(res) ? res : (res.list || res.data || []);

        const targetHospName = (bookingHospital.name || "").toLowerCase().trim();
        const hospitalEntityLocation = (bookingHospital.entitylocation || bookingHospital.location_key || "").toLowerCase().trim();

        // Filter doctors by selected hospital name and city
        const docsAtHospital = docs.filter(d => {
          const locs = Array.isArray(d.locations) ? d.locations : (d.locations ? [d.locations] : []);
          const matchesName = locs.some(l => {
            const locKey = (l.location_key || l.entitylocation || "").toLowerCase().trim();
            if (hospitalEntityLocation && locKey === hospitalEntityLocation) return true;

            const locName = (l.locname || l.name || l.alt_name || "").toLowerCase().trim();
            return (
              locName === targetHospName ||
              locName.replace(/s$/, '') === targetHospName.replace(/s$/, '') ||
              locName.includes(targetHospName) ||
              targetHospName.includes(locName)
            );
          });
          
          let matchesCity = true;
          if (bookingHospital && bookingHospital.city) {
            const hospitalCity = bookingHospital.city.toLowerCase().trim();
            const docCity = (d.city || "").toLowerCase().trim();
            matchesCity = (docCity === hospitalCity) || 
              locs.some(l => (l.city || "").toLowerCase().trim() === hospitalCity);
          }
          
          return matchesName && matchesCity;
        });

        const targetDocs = docsAtHospital.length > 0 ? docsAtHospital : docs;

        // Group doctors by specialty to extract real counts and unique specialty list
        const specialtyStats = {};
        targetDocs.forEach(d => {
          const rawSpec = d.specialty || (Array.isArray(d.speciality) ? d.speciality.join(", ") : d.speciality);
          if (rawSpec && typeof rawSpec === 'string' && rawSpec.trim()) {
            const specName = rawSpec.trim();
            if (!specialtyStats[specName]) {
              specialtyStats[specName] = { name: specName, doctorCount: 0 };
            }
            specialtyStats[specName].doctorCount += 1;
          }
        });

        let list = Object.values(specialtyStats);
        list.sort((a, b) => a.name.localeCompare(b.name));

        setSpecialties(list);
      } catch (err) {
        console.error("Error loading specialties", err);
      } finally {
        setLoading(false);
      }
    }

    loadSpecialties();
  }, [bookingHospital, navigate]);

  // Real-time search filter with SQL Injection sanitization
  const filteredSpecialties = useMemo(() => {
    const q = sanitizeSearchQuery(searchQ).trim().toLowerCase();
    if (!q) return specialties;
    return specialties.filter((spec) => (spec.name || "").toLowerCase().includes(q));
  }, [specialties, searchQ]);

  // Frontend Pagination - Only 5 cards per page
  const totalPages = Math.ceil(filteredSpecialties.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedSpecialties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSpecialties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSpecialties, currentPage, ITEMS_PER_PAGE]);

  const handleSearchChange = (e) => {
    const sanitized = sanitizeSearchQuery(e.target.value);
    setSearchQ(sanitized);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQ("");
    setCurrentPage(1);
  };

  const handleSelect = (specName) => {
    setBookingSpecialty(specName);
  };

  const handleProceed = () => {
    if (!bookingSpecialty) {
      setToast({
        isOpen: true,
        message: "Please select a specialty to proceed.",
        type: "error"
      });
      return;
    }
    navigate("/doctors/list");
  };

  const hospitalDisplayName = bookingHospital?.name || "Hospital";

  return (
    <>
    <BookingLayout 
      currentStep={1} 
      title="Select Specialty" 
      subtitle={`What do you need help with at ${hospitalDisplayName}?`}
    >
      <div className="hospital-selection-container" style={{ gap: '10px' }}>
        
        {/* Controls: Search Bar & Count (matching HospitalSelection design) */}
        <div className="hospital-controls-bar">
          <div className="hospital-search-box">
            <Search size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <input 
              type="text"
              className="hospital-search-input"
              placeholder={`Search ${specialties.length > 0 ? specialties.length : ''} specialties...`}
              value={searchQ}
              onChange={handleSearchChange}
              maxLength={60}
              autoComplete="off"
              aria-label="Search specialties"
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
              {filteredSpecialties.length} {filteredSpecialties.length === 1 ? "specialty" : "specialties"}
            </span>
            <span className="hospital-location-tag">
              <Building2 size={12} /> {hospitalDisplayName}
            </span>
          </div>
        </div>

        {/* Specialty Cards Content Area (5 Cards Per Page) */}
        <div className="styled-scrollbar" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: '2px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '34px', height: '34px', border: '3px solid rgba(46, 102, 110, 0.15)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}></div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Loading specialties for {hospitalDisplayName}...
              </span>
            </div>
          ) : specialties.length === 0 ? (
            <div className="hospital-empty-state" style={{ padding: '32px 16px' }}>
              <div className="hospital-empty-icon-wrap" style={{ width: '56px', height: '56px' }}>
                <Stethoscope size={28} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: '4px 0 2px' }}>
                No Specialties Available
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                No specialist departments found registered for this location.
              </p>
            </div>
          ) : filteredSpecialties.length === 0 ? (
            <div className="hospital-empty-state" style={{ padding: '32px 16px' }}>
              <div className="hospital-empty-icon-wrap" style={{ width: '56px', height: '56px' }}>
                <Search size={26} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '4px 0 2px' }}>
                No Results for "{searchQ}"
              </h3>
              <button 
                type="button" 
                className="hospital-filter-pill active" 
                onClick={handleClearSearch}
                style={{ marginTop: '6px' }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              <div className="specialty-cards-grid">
                {paginatedSpecialties.map((spec) => {
                  const isSelected = bookingSpecialty === spec.name;
                  const IconComponent = getSpecialtyIcon(spec.name);

                  return (
                    <article 
                      key={spec.name}
                      role="button"
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() => handleSelect(spec.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(spec.name);
                        }
                      }}
                      className={`specialty-card ${isSelected ? "is-selected" : ""}`}
                    >
                      <div className="specialty-avatar-icon" aria-hidden="true">
                        <IconComponent size={18} />
                      </div>
                      
                      <div className="specialty-card-info">
                        <h3 className="specialty-card-title" title={spec.name}>
                          {spec.name}
                        </h3>
                        {spec.doctorCount > 0 && (
                          <span className="specialty-doctor-count">
                            <UserCheck size={11} />
                            {spec.doctorCount} {spec.doctorCount === 1 ? 'doctor' : 'doctors'} available
                          </span>
                        )}
                      </div>

                      <div className="specialty-radio-wrap" aria-hidden="true">
                        <div className={`specialty-radio-dot ${isSelected ? "is-selected" : ""}`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Frontend Pagination Controls for 5 cards per page */}
              {filteredSpecialties.length > 0 && (
                <div className="specialty-pagination-bar">
                  <span className="pagination-info-text">
                    Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredSpecialties.length)}</strong> of <strong>{filteredSpecialties.length}</strong> specialties
                  </span>

                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button 
                        type="button" 
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>

                      <div className="pagination-pages-list">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

        {/* Pinned Action Bar */}
        <div className="booking-action-bar" style={{ marginTop: '4px', paddingTop: '10px' }}>
          <div>
            {bookingSpecialty ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  Selected: <strong style={{ color: 'var(--primary-dark)', fontWeight: '750' }}>{bookingSpecialty}</strong>
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Please choose a specialty above to proceed
              </span>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleProceed}
            style={{ 
              padding: '10px 24px', 
              fontSize: '14px', 
              fontWeight: '650',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: bookingSpecialty ? 1 : 0.65,
              cursor: 'pointer',
              boxShadow: bookingSpecialty ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Next Step <ArrowRight size={16} />
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
