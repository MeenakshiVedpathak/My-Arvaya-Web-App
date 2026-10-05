import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar({ selectedDate, onSelectDate, minDate, compact = false, borderless = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDateObj = minDate ? new Date(minDate) : today;
  minDateObj.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const startDay = startOfMonth.getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div style={{ 
      background: 'var(--bg-surface)', 
      border: borderless ? 'none' : '1px solid var(--border)', 
      borderRadius: '14px', 
      padding: compact ? '6px 8px' : '14px 16px', 
      width: '100%', 
      maxWidth: compact ? '290px' : '320px', 
      boxShadow: borderless ? 'none' : '0 2px 8px rgba(0,0,0,0.02)' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? '6px' : '10px' }}>
        <button onClick={prevMonth} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={compact ? 16 : 18} color="var(--text-main)" />
        </button>
        <b style={{ color: 'var(--text-main)', fontSize: compact ? '13px' : '14px', fontWeight: '700' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</b>
        <button onClick={nextMonth} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={compact ? 16 : 18} color="var(--text-main)" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <small key={d} style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600' }}>{d}</small>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map((date, i) => {
          if (!date) return <div key={i} />;

          const isPast = date < minDateObj;
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(date)}
              style={{
                width: '100%',
                height: compact ? '26px' : '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: isSelected 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' 
                  : (isToday ? 'rgba(46, 102, 110, 0.1)' : 'transparent'),
                color: isSelected 
                  ? '#ffffff' 
                  : (isPast ? 'var(--border)' : (isToday ? 'var(--primary-dark)' : 'var(--text-main)')),
                borderRadius: '7px',
                cursor: isPast ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? '700' : (isToday ? '600' : '500'),
                fontSize: compact ? '11.5px' : '12.5px',
                boxShadow: isSelected ? '0 2px 8px rgba(46, 102, 110, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
