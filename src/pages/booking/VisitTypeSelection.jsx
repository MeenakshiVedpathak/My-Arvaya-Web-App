import { useState, useMemo } from "react";
import { Stethoscope, RotateCcw, CheckCircle2, ArrowRight, Info, Building2, User, GraduationCap, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";
import Toast from "../../components/common/Toast";

const VISIT_TYPES = [
  {
    id: "Initial consultation",
    title: "Initial consultation",
    icon: Stethoscope,
    desc: "First visit for a new concern or symptom.",
  },
  {
    id: "Follow-up",
    title: "Follow-up",
    icon: RotateCcw,
    desc: "Continuing care from a previous recent visit.",
  }
];

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

export default function VisitTypeSelection() {
  const navigate = useNavigate();
  const { doctor, bookingHospital, bookingSpecialty, bookingVisitType, setBookingVisitType } = useBooking();
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

  const handleSearchChange = (e) => {
    const sanitized = sanitizeSearchQuery(e.target.value);
    setSearchQ(sanitized);
  };

  const handleClearSearch = () => {
    setSearchQ("");
  };

  const filteredVisitTypes = useMemo(() => {
    const q = sanitizeSearchQuery(searchQ).trim().toLowerCase();
    if (!q) return VISIT_TYPES;
    return VISIT_TYPES.filter(
      (vt) =>
        vt.title.toLowerCase().includes(q) ||
        vt.desc.toLowerCase().includes(q) ||
        vt.id.toLowerCase().includes(q)
    );
  }, [searchQ]);

  const handleSelect = (typeId) => {
    setBookingVisitType(typeId);
  };

  const handleProceed = (typeId) => {
    const targetType = typeId || bookingVisitType;
    if (!targetType) {
      setToast({
        isOpen: true,
        message: "Please select a consultation visit type to proceed.",
        type: "error"
      });
      return;
    }
    setBookingVisitType(targetType);
    navigate("/doctors/schedule");
  };

  if (!doctor) {
    return (
      <BookingLayout currentStep={3} title="Visit Type" subtitle="Please select a doctor to choose your visit type.">
        <div className="hospital-empty-state">
          <div className="hospital-empty-icon-wrap">
            <User size={32} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '750', color: 'var(--text-main)', margin: '4px 0 2px' }}>
            No Doctor Selected
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '360px', margin: '0 auto', lineHeight: 1.45 }}>
            Please select a doctor first to configure your appointment visit type.
          </p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => navigate("/doctors/list")}
            style={{ marginTop: '10px', padding: '9px 20px', borderRadius: '10px', fontSize: '13.5px' }}
          >
            Go to Doctor List
          </button>
        </div>
      </BookingLayout>
    );
  }

  const doctorDisplayName = doctor.name.startsWith("Dr") ? doctor.name : `Dr. ${doctor.name}`;
  const hospitalName = bookingHospital?.name || doctor.hospital || "Medical Center";
  const doctorSpecialty = doctor.specialty || bookingSpecialty || "";

  return (
    <>
    <BookingLayout 
      currentStep={3} 
      title="Visit Type" 
      subtitle={`What type of visit is this for ${doctorDisplayName}?`}
    >
      <div className="hospital-selection-container" style={{ gap: '14px' }}>
        
        {/* Doctor Summary Context Banner */}
        <div className="booking-doctor-context-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #e7f5f7 0%, #d3eef2 100%)', 
                border: '1px solid rgba(46, 102, 110, 0.16)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--primary-dark)', 
                fontWeight: '750', 
                fontSize: '14px',
                flexShrink: 0
              }}
            >
              {doctor.image && !doctor.image.includes('ui-avatars') ? (
                <img src={doctor.image} alt={doctor.name} style={{ width: '100%', height: '100%', borderRadius: '9px', objectFit: 'cover' }} />
              ) : (
                <User size={18} />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-main)' }}>
                  {doctorDisplayName}
                </span>
                {doctor.qualification && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <GraduationCap size={11} color="var(--primary)" /> {doctor.qualification}
                  </span>
                )}
              </div>
              {doctorSpecialty && (
                <div style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: '600' }}>
                  {doctorSpecialty}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {hospitalName && (
              <span className="hospital-location-tag">
                <Building2 size={12} /> {hospitalName}
              </span>
            )}
          </div>
        </div>

        {/* Controls: Search Bar & Count (matching HospitalSelection design) */}
        <div className="hospital-controls-bar">
          <div className="hospital-search-box">
            <Search size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <input 
              type="text"
              className="hospital-search-input"
              placeholder="Search consultation types..."
              value={searchQ}
              onChange={handleSearchChange}
              maxLength={60}
              autoComplete="off"
              aria-label="Search consultation types"
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
              {filteredVisitTypes.length} {filteredVisitTypes.length === 1 ? "option" : "options"}
            </span>
          </div>
        </div>

        {/* 2 Visit Type Cards Content Area */}
        <div className="styled-scrollbar" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: '2px', paddingBottom: '16px' }}>
          {filteredVisitTypes.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No consultation types matching "{searchQ}".{" "}
              <button 
                type="button" 
                onClick={handleClearSearch} 
                style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="visittype-cards-grid">
              {filteredVisitTypes.map(vt => {
                const isSelected = bookingVisitType === vt.id;
                const IconComponent = vt.icon;

                return (
                  <article 
                    key={vt.id}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => handleSelect(vt.id)}
                    onDoubleClick={() => handleProceed(vt.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(vt.id);
                      }
                    }}
                    className={`visittype-card ${isSelected ? "is-selected" : ""}`}
                  >
                  
                  {/* Compact Header: Icon, Titles & Selection Pill */}
                  <div className="visittype-card-header">
                    <div className="visittype-icon-wrap" aria-hidden="true">
                      <IconComponent size={19} />
                    </div>

                    <div className="visittype-card-title-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                        <h3 className="visittype-card-title">
                          {vt.title}
                        </h3>
                        <div className={`hc-select-pill ${isSelected ? "is-selected" : ""}`} style={{ flexShrink: 0 }}>
                          {isSelected ? (
                            <>
                              <CheckCircle2 size={12} /> Selected
                            </>
                          ) : (
                            <>
                              <span className="hc-radio-circle" /> Select
                            </>
                          )}
                        </div>
                      </div>

                      <p className="visittype-card-desc">
                        {vt.desc}
                      </p>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
          )}

          {/* Integrated Policy & Guidelines Box */}
          <div className="visittype-guidance-card" style={{ marginTop: '14px' }}>
            <div className="visittype-guidance-icon">
              <Info size={18} />
            </div>
            <div className="visittype-guidance-content">
              <span style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.45 }}>
                Select <strong>Follow-up Consultation</strong> only if you have consulted {doctorDisplayName} within the last 7 days.
              </span>
            </div>
          </div>

        </div>

        {/* Pinned Responsive Action Bar matching HospitalSelection & DoctorList */}
        <div className="booking-action-bar">
          <div>
            {bookingVisitType ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)', minWidth: 0 }}>
                <CheckCircle2 size={17} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
                  <span>Selected: <strong style={{ color: 'var(--primary-dark)', fontWeight: '750' }}>{bookingVisitType}</strong></span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', background: 'rgba(0,0,0,0.04)', padding: '1.5px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                    for {doctorDisplayName}
                  </span>
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Please choose a visit type above to proceed
              </span>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => handleProceed(bookingVisitType)}
            style={{ 
              padding: '11px 26px', 
              fontSize: '14.5px', 
              fontWeight: '650',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: bookingVisitType ? 1 : 0.65,
              cursor: 'pointer',
              boxShadow: bookingVisitType ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none',
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
