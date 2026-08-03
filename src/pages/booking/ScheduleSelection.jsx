import { useState, useEffect } from "react";
import { CheckCircle2, Sun, Sunrise, Sunset, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";
import Calendar from "../../components/common/Calendar";
import { getDoctorSlots } from "../../services/dataService";

export default function ScheduleSelection() {
  const navigate = useNavigate();
  const { doctor, bookingVisitType, date, setDate, slot, setSlot } = useBooking();
  const [loading, setLoading] = useState(false);

  const [availableSlots, setAvailableSlots] = useState({ morning: [], afternoon: [], evening: [] });

  useEffect(() => {
    if (!doctor || !date) return;

    setLoading(true);
    setSlot(""); // Reset slot when date changes

    getDoctorSlots(doctor.drkey || doctor.id, date).then(res => {
      const morning = [];
      const afternoon = [];
      const evening = [];

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
      
      rawSlots.forEach(s => {
        const timeStr = typeof s === 'string' ? s : (s.start_time || s.time || s.slot_time || "");
        if (!timeStr) return;
        
        const hourMatch = timeStr.match(/^\d+/);
        let hour24 = hourMatch ? parseInt(hourMatch[0]) : 0;
        
        if (timeStr.toLowerCase().includes('pm') && hour24 !== 12) hour24 += 12;
        if (timeStr.toLowerCase().includes('am') && hour24 === 12) hour24 = 0;
        
        if (hour24 >= 17) {
          evening.push(s);
        } else if (hour24 >= 12) {
          afternoon.push(s);
        } else {
          morning.push(s);
        }
      });
      
      setAvailableSlots({ morning, afternoon, evening });
      setLoading(false);
    }).catch(err => {
      console.error(err);
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

  const handleConfirm = () => {
    if (slot && date && doctor) {
      navigate("/doctors/review");
    }
  };

  if (!doctor) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No doctor selected. Redirecting...</p>
        <button onClick={() => navigate("/doctors/list")} className="btn btn-primary">Go back</button>
      </div>
    );
  }

  return (
    <BookingLayout 
      currentStep={4} 
      title="Date & Time" 
      subtitle="Select a convenient slot for your appointment."
    >
      {/* Scoped Styling for Time Slots Selection */}
      <style>{`
        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
          gap: 12px;
        }

        .slot-chip {
          padding: 10px 14px;
          border: 1.5px solid var(--border, #e2e8f0);
          border-radius: 12px;
          background: #ffffff;
          color: #1e293b;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
          user-select: none;
          outline: none;
        }

        .slot-chip:hover:not(.selected):not(.active) {
          border-color: var(--primary, #2e666e);
          background: var(--primary-light, #e4eeef);
          color: var(--primary-dark, #12333a);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.12);
          transform: translateY(-2px);
        }

        .slot-chip.selected,
        .slot-chip.active {
          background: linear-gradient(135deg, var(--primary, #2e666e) 0%, var(--primary-dark, #12333a) 100%) !important;
          color: #ffffff !important;
          border-color: var(--primary-dark, #12333a) !important;
          font-weight: 700 !important;
          box-shadow: 0 6px 18px rgba(46, 102, 110, 0.35) !important;
          transform: translateY(-2px) scale(1.02) !important;
        }

        .slot-chip:active {
          transform: scale(0.97);
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        
        {/* Calendar & Time Slot area */}
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start', padding: '4px', overflow: 'hidden' }}>
          
          {/* Calendar Area - Full Display on Screen */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 10px 0' }}>Select a Date</h3>
            {(() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              return (
                <Calendar 
                  selectedDate={date}
                  onSelectDate={(d) => setDate(d)}
                  minDate={tomorrow}
                />
              );
            })()}
          </div>

          {/* Time Slots Area */}
          <div className="styled-scrollbar" style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 10px 0' }}>Available Time Slots</h3>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', flex: 1 }}>
                <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                
                {/* Morning */}
                {availableSlots.morning.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600' }}>
                      <Sunrise size={16} color="#eab308" /> Morning
                    </div>
                    <div className="time-slots-grid">
                      {availableSlots.morning.map(s => {
                        const slotStr = formatSlot(s);
                        const isSel = slot === slotStr;
                        return (
                          <button
                            key={slotStr}
                            onClick={() => setSlot(slotStr)}
                            className={`slot-chip ${isSel ? 'selected active' : ''}`}
                          >
                            {isSel && <Check size={14} strokeWidth={2.5} />}
                            <span>{slotStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Afternoon */}
                {availableSlots.afternoon.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600' }}>
                      <Sun size={16} color="#f97316" /> Afternoon
                    </div>
                    <div className="time-slots-grid">
                      {availableSlots.afternoon.map(s => {
                        const slotStr = formatSlot(s);
                        const isSel = slot === slotStr;
                        return (
                          <button
                            key={slotStr}
                            onClick={() => setSlot(slotStr)}
                            className={`slot-chip ${isSel ? 'selected active' : ''}`}
                          >
                            {isSel && <Check size={14} strokeWidth={2.5} />}
                            <span>{slotStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evening */}
                {availableSlots.evening.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600' }}>
                      <Sunset size={16} color="#8b5cf6" /> Evening
                    </div>
                    <div className="time-slots-grid">
                      {availableSlots.evening.map(s => {
                        const slotStr = formatSlot(s);
                        const isSel = slot === slotStr;
                        return (
                          <button
                            key={slotStr}
                            onClick={() => setSlot(slotStr)}
                            className={`slot-chip ${isSel ? 'selected active' : ''}`}
                          >
                            {isSel && <Check size={14} strokeWidth={2.5} />}
                            <span>{slotStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableSlots.morning.length === 0 && availableSlots.afternoon.length === 0 && availableSlots.evening.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No slots available for the selected date. Please choose another date.
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* Pinned Bottom Action Bar */}
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', paddingTop: '14px', paddingBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-app)', marginTop: '8px' }}>
          <div>
            {slot ? (
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Selected Slot: <strong style={{ color: 'var(--primary-dark)' }}>{slot}</strong> on <strong>{date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select a date and time slot to proceed</span>
            )}
          </div>

          <button 
            className="btn btn-primary"
            disabled={!slot}
            onClick={handleConfirm}
            style={{ 
              padding: '12px 28px', 
              fontSize: '15px', 
              fontWeight: '600',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: slot ? 1 : 0.5,
              cursor: slot ? 'pointer' : 'not-allowed',
              boxShadow: slot ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none'
            }}
          >
            Review Details <CheckCircle2 size={18} />
          </button>
        </div>

      </div>
    </BookingLayout>
  );
}
