import { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  ArrowRight, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Check, 
  Search, 
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getHospitalsForLocation } from "../../services/dataService";
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

export default function HospitalSelection() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });
  const navigate = useNavigate();
  const { globalLocation, bookingHospital, setBookingHospital } = useBooking();
  const ITEMS_PER_PAGE = 5;

  // Load hospitals for active location using original API implementation
  useEffect(() => {
    async function loadHospitals() {
      let locationKey = globalLocation?.entitylocation;
      if (!locationKey) {
        try {
          const savedLoc = localStorage.getItem("arvaya_location");
          if (savedLoc) {
            const parsed = JSON.parse(savedLoc);
            locationKey = parsed?.entitylocation;
          }
        } catch (e) {
          console.error("Error reading saved location", e);
        }
      }

      if (!locationKey) {
        setHospitals([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const fetchedHospitals = await getHospitalsForLocation(locationKey);
        const hospitalList = fetchedHospitals || [];
        setHospitals(hospitalList);

        // Auto-select if only 1 facility returned from API and none is selected
        if (hospitalList.length === 1 && !bookingHospital) {
          setBookingHospital(hospitalList[0]);
        }
      } catch (err) {
        console.error("Error loading hospitals", err);
      } finally {
        setLoading(false);
      }
    }

    loadHospitals();
  }, [globalLocation]);

  const filteredHospitals = useMemo(() => {
    const q = sanitizeSearchQuery(searchQ).trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => {
      const name = (h.name || "").toLowerCase();
      const addr = (h.address || h.address_line_1 || h.address1 || "").toLowerCase();
      const city = (h.city || "").toLowerCase();
      return name.includes(q) || addr.includes(q) || city.includes(q);
    });
  }, [hospitals, searchQ]);

  // Frontend Pagination - Only 5 medical centers per page
  const totalPages = Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHospitals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHospitals, currentPage, ITEMS_PER_PAGE]);

  const handleSearchChange = (e) => {
    const sanitized = sanitizeSearchQuery(e.target.value);
    setSearchQ(sanitized);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQ("");
    setCurrentPage(1);
  };

  const handleSelect = (hospital) => {
    setBookingHospital(hospital);
  };

  const handleProceed = () => {
    if (!bookingHospital) {
      setToast({
        isOpen: true,
        message: "Please select a hospital or clinic location to proceed.",
        type: "error"
      });
      return;
    }
    navigate("/doctors/specialty");
  };

  const activeCity = hospitals[0]?.city || globalLocation?.city || globalLocation?.entitylocation || "";

  return (
    <>
    <BookingLayout 
      currentStep={0} 
      title="Select Hospital & Clinic Location" 
      subtitle={`Choose your preferred medical center${activeCity ? ` in ${activeCity}` : ''} to view available specialists and book an appointment.`}
    >
      <div className="hospital-selection-container">
        
        {/* Controls: Search Bar & Count */}
        <div className="hospital-controls-bar">
          <div className="hospital-search-box">
            <Search size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <input 
              type="text"
              className="hospital-search-input"
              placeholder={activeCity ? `Search ${hospitals.length > 0 ? hospitals.length : ''} facilities in ${activeCity}...` : "Search hospital by name, area, or address..."}
              value={searchQ}
              onChange={handleSearchChange}
              maxLength={60}
              autoComplete="off"
              aria-label="Search hospitals"
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
              {filteredHospitals.length} {filteredHospitals.length === 1 ? "facility" : "facilities"} found
            </span>
            {activeCity && (
              <span className="hospital-location-tag">
                <MapPin size={11} /> {activeCity}
              </span>
            )}
          </div>
        </div>

        {/* Hospital Cards Content Area */}
        <div className="styled-scrollbar" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: '2px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: '14px' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', border: '3px solid rgba(46, 102, 110, 0.15)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}></div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                Loading medical centers{activeCity ? ` in ${activeCity}` : ''}...
              </span>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="hospital-empty-state">
              <div className="hospital-empty-icon-wrap">
                <Building2 size={30} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: '4px 0 2px' }}>
                No Medical Centers Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '360px', margin: '0 auto', lineHeight: 1.45 }}>
                We couldn't find any medical facilities registered{activeCity ? ` under ${activeCity}` : ''}.
              </p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="hospital-empty-state">
              <div className="hospital-empty-icon-wrap">
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '4px 0 2px' }}>
                No Results for "{searchQ}"
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', maxWidth: '340px', margin: '0 auto' }}>
                Try checking for typos or searching by another keyword.
              </p>
              <button 
                type="button" 
                className="hospital-filter-pill active" 
                onClick={handleClearSearch}
                style={{ marginTop: '8px' }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <>
              <div className="hospital-cards-grid">
                {paginatedHospitals.map((hospital) => {
                  const isSelected = bookingHospital?.name === hospital.name;
                  const addressText = hospital.address || hospital.address_line_1 || hospital.address1 || hospital.city || "";
                  const phoneText = hospital.mobile || hospital.phone || hospital.contact_number || hospital.contact_no || hospital.phone_number || "";

                  return (
                    <article 
                      key={hospital.id || hospital.name}
                      role="button"
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() => handleSelect(hospital)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelect(hospital);
                        }
                      }}
                      className={`hospital-card ${isSelected ? "is-selected" : ""}`}
                    >
                      {/* Top Row: Icon + Title & Tags + Radio Check Indicator */}
                      <div className="hospital-card-top">
                        <div className="hospital-card-avatar" aria-hidden="true">
                          <Building2 size={19} />
                        </div>
                        
                        <div className="hospital-card-info">
                          <h3 className="hospital-card-name" title={hospital.name}>
                            {hospital.name}
                          </h3>

                          <div className="hospital-card-subrow">
                            {/* {hospital.city && (
                              <span className="hospital-city-badge">
                                <MapPin size={11} /> {hospital.city}
                              </span>
                            )} */}
                            <span className="hospital-status-pill">
                              <span className="hospital-pulse-dot" /> Verified Center
                            </span>
                          </div>
                        </div>

                        {/* Top-Right Sleek Radio Selection Indicator */}
                        <div className="hospital-card-select-btn" aria-hidden="true">
                          <div className={`hospital-radio-circle ${isSelected ? "is-selected" : ""}`}>
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>

                      {/* Meta Row: Address & Phone (Real API data only) */}
                      {(addressText || phoneText) && (
                        <div className="hospital-card-meta">
                          {addressText && (
                            <div className="hospital-meta-item hospital-meta-address" title={addressText}>
                              <MapPin size={12} className="meta-icon" />
                              <span className="meta-text">{addressText}</span>
                            </div>
                          )}

                          {phoneText && (
                            <div className="hospital-meta-item hospital-meta-phone">
                              <Phone size={12} className="meta-icon" />
                              <a 
                                href={`tel:${phoneText.replace(/[^0-9+]/g, '')}`} 
                                className="hospital-phone-anchor"
                                onClick={(e) => e.stopPropagation()}
                                title="Call facility"
                              >
                                {phoneText}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Frontend Pagination Controls for 5 cards per page */}
              {filteredHospitals.length > 0 && (
                <div className="hospital-pagination-bar specialty-pagination-bar" style={{ marginTop: '10px' }}>
                  <span className="pagination-info-text">
                    Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredHospitals.length)}</strong> of <strong>{filteredHospitals.length}</strong> {filteredHospitals.length === 1 ? "medical center" : "medical centers"}
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

        {/* Pinned Responsive Action Bar */}
        <div className="booking-action-bar">
          <div>
            {bookingHospital ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  Selected: <strong style={{ color: 'var(--primary-dark)', fontWeight: '750' }}>{bookingHospital.name}</strong>
                  {bookingHospital.city && (
                    <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '11.5px', background: 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: '6px' }}>
                      {bookingHospital.city}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Please select a medical center above to proceed
              </span>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleProceed}
            style={{ 
              padding: '11px 26px', 
              fontSize: '14.5px', 
              fontWeight: '650',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: bookingHospital ? 1 : 0.65,
              cursor: 'pointer',
              boxShadow: bookingHospital ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none',
              transition: 'all 0.2s ease'
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
