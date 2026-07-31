import { useState, useEffect } from "react";
import { CheckCircle2, Sun, Sunrise } from "lucide-react";
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

  const getSlotDisplay = (s) => {
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        
        {/* Scrollable Calendar & Time Slot area */}
        <div className="styled-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '24px', alignItems: 'start', padding: '4px' }}>
            
            {/* Calendar Area */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 12px 0' }}>Select a Date</h3>
              <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
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
            </div>

            {/* Time Slots Area */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 12px 0' }}>Available Time Slots</h3>
              
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
                              className={`slot-chip ${isSel ? 'selected' : ''}`}
                            >
                              {slotStr}
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
                              className={`slot-chip ${isSel ? 'selected' : ''}`}
                            >
                              {slotStr}
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
                              className={`slot-chip ${isSel ? 'selected' : ''}`}
                            >
                              {slotStr}
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
