import { ChevronLeft, ChevronRight, ChevronDown, CalendarX2, Calendar } from "lucide-react";
import { useState } from "react";

export default function SelectSlotUI({ doctor, onConfirm, type = "doctor" }) {
  const [selectedDate, setSelectedDate] = useState(11);
  const [selectedTime, setSelectedTime] = useState(null);
  const dates = [5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="select-slot-container">
      {/* Doctor Mini Card - Conditionally Rendered */}
      {doctor && (
        <div className="doc-mini-card">
          <div className="dmc-avatar">
            <img src={doctor.image} alt={doctor.name} />
          </div>
          <div className="dmc-info">
            <h4>{doctor.name}</h4>
            <span className="dmc-spec">{doctor.specialty}</span>
          </div>
        </div>
      )}

      <div className="slot-grid-layout">
        <div className="date-selector-section">
          <div className="section-title-row">
            <Calendar size={18} color="var(--primary)" />
            <h4 className="step-prompt" style={{ margin: 0, color: 'var(--text-main)', fontSize: '15px' }}>
              {type === "lab" ? "Select Collection Date" : "Select a Date"}
            </h4>
          </div>

          <div className="full-calendar-card">
            <div className="fc-header">
              <button className="icon-btn"><ChevronLeft size={16} /></button>
              <span className="fc-month">July 2026</span>
              <button className="icon-btn"><ChevronRight size={16} /></button>
            </div>
            <div className="fc-grid">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={`wd-${i}`} className="fc-weekday">{d}</div>
              ))}
              {/* Mock empty days for start of month (July 1st is Wed, so 3 empty cells) */}
              <div className="fc-empty"></div>
              <div className="fc-empty"></div>
              <div className="fc-empty"></div>
              {/* 31 days of July */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <button
                  key={`day-${day}`}
                  className={`fc-date ${selectedDate === day ? 'active' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="slots-section">
          <div className="section-title-row" style={{ justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Calendar size={18} color="var(--primary)" />
              <h4 className="step-prompt" style={{ margin: 0 }}>Available Slots</h4>
            </div>
            <span className="selected-date-badge">Sat, Jul {selectedDate}, 2026</span>
          </div>

          <div className="time-slots-grid">
            {["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "04:30 PM", "05:00 PM"].map((time) => (
              <button
                key={time}
                className={`time-slot-btn ${selectedTime === time ? 'active' : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="bottom-fixed-action" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-accent"
          disabled={!selectedTime}
          onClick={() => onConfirm({ date: `Sat, Jul ${selectedDate}, 2026`, time: selectedTime })}
          style={{ padding: '12px 24px', fontSize: '15px' }}
        >
          <Calendar size={18} style={{ marginRight: '8px' }} />
          {type === "lab" ? "Confirm Schedule" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
