import { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, 
  Check, 
  CalendarDays, 
  Clock, 
  Calendar as CalendarIcon, 
  ArrowRight,
  Search,
  X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";
import Calendar from "../../components/common/Calendar";
import { getDoctorSlots, checkVisitType } from "../../services/dataService";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/common/Toast";
import { toDisplayTime } from "../../utils/formatTime";

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
  // Only allow valid search characters: alphanumeric, spaces and colons (for times like 1:00 PM)
  clean = clean.replace(/[^a-zA-Z0-9\s:]/g, "");
  return clean;
}

export default function ScheduleSelection() {
  const navigate = useNavigate();
  const { doctor, bookingHospital, date, setDate, slot, setSlot } = useBooking();
  const { user, openLoginModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error", duration: 4000 });
  const [validating, setValidating] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (!doctor || !date) return;

    setLoading(true);
    setSlot(""); // Reset slot when date changes

    getDoctorSlots(doctor.drkey || doctor.id, date).then(res => {
      let rawSlots = [];
      if (res && res.slots && typeof res.slots === 'object') {
        Object.values(res.slots).forEach(locObj => {
          if (locObj && typeof locObj === 'object') {
            Object.values(locObj).forEach(dateArray => {
              if (Array.isArray(dateArray)) {
                rawSlots = rawSlots.concat(dateArray);
              }
            });
          }
        });
      } else {
        rawSlots = Array.isArray(res) ? res : (res.data || res.list || []);
      }
      
      const validSlots = [];
      rawSlots.forEach(s => {
        const timeStr = typeof s === 'string' ? s : (s.start_time || s.time || s.slot_time || "");
        if (!timeStr) return;
        validSlots.push(s);
      });

      // Sort chronologically
      validSlots.sort((a, b) => {
        const getMinutes = (slotItem) => {
          const str = typeof slotItem === 'string' ? slotItem : (slotItem.start_time || slotItem.time || slotItem.slot_time || "");
          const match = str.match(/(\d+):(\d+)/);
          let h = match ? parseInt(match[1], 10) : 0;
          const m = match ? parseInt(match[2], 10) : 0;
          if (str.toLowerCase().includes('pm') && h !== 12) h += 12;
          if (str.toLowerCase().includes('am') && h === 12) h = 0;
          return h * 60 + m;
        };
        return getMinutes(a) - getMinutes(b);
      });
      
      setAvailableSlots(validSlots);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading doctor slots:", err);
      setLoading(false);
    });
  }, [date, doctor, setSlot]);

  const formatSlot = (s) => {
    let str = typeof s === 'string' ? s : (s.start_time || s.time || s.slot_time || "Slot");
    if (/^\d{1,2}:\d{2}$/.test(str)) {
      let [h, m] = str.split(':');
      let hour = parseInt(h);
      let ampm = hour >= 12 ? 'PM' : 'AM';
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      str = `${hour}:${m} ${ampm}`;
    }
    return str;
  };


  const handleSearchChange = (e) => {
    const sanitized = sanitizeSearchQuery(e.target.value);
    setSearchQ(sanitized);
  };

  const handleClearSearch = () => {
    setSearchQ("");
  };

  const filteredSlots = useMemo(() => {
    const q = sanitizeSearchQuery(searchQ).trim().toLowerCase();
    if (!q) return availableSlots;

    return availableSlots.filter(s => {
      const str = formatSlot(s);
      return str.toLowerCase().includes(q) || toDisplayTime(str).toLowerCase().includes(q);
    });
  }, [availableSlots, searchQ]);

  const handleConfirm = async () => {
    if (validating) return;

    if (!slot) {
      setToast({
        isOpen: true,
        message: "Please select an available appointment time slot to proceed.",
        type: "error",
        duration: 3500
      });
      return;
    }
    if (!date) {
      setToast({
        isOpen: true,
        message: "Please select an appointment date to proceed.",
        type: "error",
        duration: 3500
      });
      return;
    }
    if (!doctor) {
      setToast({
        isOpen: true,
        message: "Please select a doctor first.",
        type: "error",
        duration: 3500
      });
      return;
    }

    if (!user) {
      openLoginModal("/doctors/review");
      return;
    }

    // Format parameters for checkVisitType
    const patient_id = user?.id || user?.patient_id || user?.user_id || 1;

    let dStr = date;
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dStr = `${year}-${month}-${day}`;
    }

    let start = slot;
    let end = "";
    if (slot.includes('-')) {
      const parts = slot.split('-').map(s => s.trim());
      start = parts[0];
      end = parts[1];
    } else {
      start = slot;
    }
    start = start.replace(/\s*(AM|PM|am|pm)\s*$/i, '');
    end = end.replace(/\s*(AM|PM|am|pm)\s*$/i, '');

    const entitylocation = doctor.locations?.[0]?.location_key || bookingHospital?.location_key || "";

    const payload = {
      patient_id,
      drkey: doctor.id || doctor.drkey,
      date: dStr,
      entitylocation,
      start,
      end
    };

    setValidating(true);

    try {
      const visitRes = await checkVisitType(payload);

      // Start the 5-minute slot hold; BookingReview reads this expiry to show the countdown
      try {
        sessionStorage.setItem("arvaya_slot_hold_expiry", String(Date.now() + 5 * 60 * 1000));
        if (visitRes) {
          sessionStorage.setItem("arvaya_visit_type_data", JSON.stringify(visitRes));
        }
      } catch (e) {}

      navigate("/doctors/review");
    } catch (err) {
      console.error("check-visit-type error:", err);
      const serverMsg =
        err?.response?.message ||
        err?.response?.data?.message ||
        err?.data?.message ||
        (typeof err?.response === "string" ? err.response : null) ||
        (err?.message && err.message !== "Request failed" ? err.message : null);

      const errorText = serverMsg || "You cannot book a follow-up appointment before your initial appointment.";

      setToast({
        isOpen: true,
        message: errorText,
        type: "error",
        duration: 4000
      });
      // Do NOT redirect to review. Stay on same schedule page!
    } finally {
      setValidating(false);
    }
  };

  // Quick next-days shortcuts for high-convenience booking
  const quickDates = useMemo(() => {
    const today = new Date();
    const list = [];
    for (let i = 1; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      d.setHours(0, 0, 0, 0);
      list.push({
        label: i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        shortLabel: i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
        date: d
      });
    }
    return list;
  }, []);

  const totalSlotsCount = availableSlots.length;

  if (!doctor) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '14px' }}>
          No doctor selected. Please select a doctor first.
        </p>
        <button onClick={() => navigate("/doctors/list")} className="btn btn-primary">
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <>
    <BookingLayout 
      currentStep={4} 
      title="Date & Time" 
      subtitle="Select a convenient slot for your appointment."
    >
      <div className="schedule-selection-wrapper">
        
        {/* Calendar & Time Slots 2-Column Responsive Layout */}
        <div className="booking-schedule-grid">
          
          {/* Left Panel: Appointment Date Picker & Quick Days */}
          <div className="schedule-calendar-card">
            <div className="schedule-card-header">
              <h3 className="schedule-card-title">
                <CalendarDays size={16} /> Select Date
              </h3>
              {date && (
                <span className="hospital-location-tag" style={{ fontSize: '11px', padding: '2.5px 7px' }}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Quick Next Days Filter Bar */}
            {/* <div className="schedule-quick-dates">
              {quickDates.map((q) => {
                const isActive = date && date.toDateString() === q.date.toDateString();
                return (
                  <button
                    key={q.label}
                    type="button"
                    className={`quick-date-chip ${isActive ? "active" : ""}`}
                    onClick={() => setDate(q.date)}
                  >
                    {q.shortLabel}
                  </button>
                );
              })}
            </div> */}

            {/* Standard Calendar Widget */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return (
                  <Calendar 
                    selectedDate={date}
                    onSelectDate={(d) => setDate(d)}
                    minDate={tomorrow}
                    compact={true}
                    borderless={true}
                  />
                );
              })()}
            </div>
          </div>

          {/* Right Panel: Available Time Slots Container (Feasible for Large Slot Datasets) */}
          <div className="schedule-slots-panel">
            
            {/* Header: Title, Slot Counter & Search */}
            <div className="schedule-slots-header">
              <div className="schedule-slots-title-group">
                <h3 className="schedule-slots-title">
                  <Clock size={16} color="var(--primary)" /> Available Slots
                </h3>
                <span className="hospital-count-badge">
                  {totalSlotsCount} {totalSlotsCount === 1 ? "slot" : "slots"}
                </span>
              </div>

              {/* SQL Protected Search for Available Slots */}
              {totalSlotsCount > 3 && (
                <div className="hospital-search-box" style={{ maxWidth: '175px', height: '32px', minHeight: '32px', maxHeight: '32px', padding: '0 8px', borderRadius: '8px' }}>
                  <Search size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    className="hospital-search-input"
                    placeholder="Search time, e.g. 1:00 PM"
                    value={searchQ}
                    onChange={handleSearchChange}
                    maxLength={30}
                    autoComplete="off"
                    aria-label="Search slots"
                    style={{ fontSize: '11px', lineHeight: '30px' }}
                  />
                  {searchQ && (
                    <button
                      type="button"
                      className="hospital-search-clear"
                      onClick={handleClearSearch}
                      title="Clear slot search"
                      aria-label="Clear slot search"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Slots Scroll Container */}
            <div className="schedule-slots-scroll-area styled-scrollbar">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px' }}>
                  <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', border: '3px solid rgba(46, 102, 110, 0.15)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}></div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Loading available slots for {date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'selected date'}...
                  </span>
                </div>
              ) : totalSlotsCount === 0 ? (
                <div className="hospital-empty-state" style={{ padding: '36px 16px' }}>
                  <div className="hospital-empty-icon-wrap" style={{ width: '56px', height: '56px' }}>
                    <CalendarIcon size={28} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: '4px 0 2px' }}>
                    No Slots Available
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '320px', margin: '0 auto', lineHeight: 1.4 }}>
                    No appointment slots available for {date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}. Please select another date.
                  </p>
                </div>
              ) : (
                <>
                  {/* Empty state when search yields no slots */}
                  {searchQ && filteredSlots.length === 0 && (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No slots matching "{searchQ}". <button type="button" onClick={handleClearSearch} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>Clear search</button>
                    </div>
                  )}

                  {/* All Available Slots */}
                  {filteredSlots.length > 0 && (
                    <div className="time-slots-grid schedule-time-grid">
                      {filteredSlots.map(s => {
                        const slotStr = formatSlot(s);
                        const isSel = slot === slotStr;
                        return (
                          <button
                            key={slotStr}
                            type="button"
                            onClick={() => setSlot(slotStr)}
                            className={`slot-chip ${isSel ? 'selected' : ''}`}
                            aria-selected={isSel}
                          >
                            <Clock size={11} className="slot-clock-icon" />
                            <span>{toDisplayTime(slotStr)}</span>
                            {isSel && <Check size={11} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Bottom Action Bar (Matching HospitalSelection style) */}
        <div className="booking-action-bar">
          <div>
            {slot && date ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)', minWidth: 0 }}>
                <CheckCircle2 size={17} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
                  <span>Selected: <strong style={{ color: 'var(--primary-dark)', fontWeight: '750' }}>{toDisplayTime(slot)}</strong> on <strong style={{ color: 'var(--primary-dark)', fontWeight: '750' }}>{date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></span>
                  {doctor?.name && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', background: 'rgba(0,0,0,0.04)', padding: '1.5px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Dr. {doctor.name}
                    </span>
                  )}
                  {bookingHospital?.name && (
                    <span style={{ color: 'var(--primary-dark)', fontSize: '11px', background: 'rgba(46, 102, 110, 0.08)', padding: '1.5px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      {bookingHospital.name}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Select a date and an available time slot above to proceed
              </span>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={validating || !slot}
            style={{ 
              padding: '11px 26px', 
              fontSize: '14.5px', 
              fontWeight: '650',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: (slot && !validating) ? 1 : 0.65,
              cursor: (validating || !slot) ? 'not-allowed' : 'pointer',
              boxShadow: (slot && !validating) ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {validating ? (
              <>
                <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px', borderTopColor: '#fff', marginRight: '4px' }} />
                <span>Checking...</span>
              </>
            ) : (
              <>
                Review Details <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>

      </div>
    </BookingLayout>
    <Toast 
      isOpen={toast.isOpen} 
      message={toast.message} 
      type={toast.type} 
      duration={toast.duration || 4000}
      onClose={() => setToast({ ...toast, isOpen: false })} 
    />
    </>
  );
}
