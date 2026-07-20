import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { slots } from "../mocks/data";
import Steps from "../components/common/Steps";
import Summary from "../components/appointments/Summary";
import Avatar from "../components/common/Avatar";
import Calendar from "../components/common/Calendar";

export default function SelectSlot() {
  let { doctor, date, setDate, slot, setSlot } = useBooking(),
    go = useNavigate();

  const today = new Date();
  const isToday = date && date.toDateString() === today.toDateString();
  const currentTotalMinutes = today.getHours() * 60 + today.getMinutes();

  const getMinutesFromTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  if (!doctor) return null;

  return (
    <main className="page page-enter" style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: '24px 0' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600', transition: 'color 0.2s' }} onClick={() => go(-1)} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-main)'}>
          <ArrowLeft size={20} /> <span>Back to Profile</span>
        </div>

        <Steps current={2} />

        <style>{`
          .slot-btn {
            padding: 12px;
            text-align: center;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid var(--border);
            background: var(--bg-app);
            color: var(--text-main);
          }
          .slot-btn:hover:not(.active) {
            border-color: var(--primary);
            color: var(--primary);
            box-shadow: 0 4px 12px rgba(46, 102, 110, 0.1);
            transform: translateY(-2px);
          }
          .slot-btn.active {
            border-color: var(--primary);
            background: var(--primary);
            color: #fff;
            box-shadow: 0 8px 24px rgba(46, 102, 110, 0.25);
            transform: translateY(-2px);
          }
          .select-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-top: 32px; }
          @media (max-width: 900px) { .select-layout { grid-template-columns: 1fr; } }
        `}</style>

        <div className="select-layout">
          <section className="card-elevated animate-fade-in-up" style={{ padding: '32px', background: 'var(--bg-surface)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 32px 0', letterSpacing: '-0.02em' }}>Select Date & Time</h1>

            {/* Doctor Info Card */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "32px", border: "1px solid var(--border)", padding: "20px", borderRadius: "var(--radius-lg)", background: 'var(--bg-app)', alignItems: 'center' }}>
              <Avatar doctor={doctor} size="64px" />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <b style={{ fontSize: "18px", color: "var(--text-main)" }}>{doctor.name}</b>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
                  <span className="badge badge-success" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', border: 'none' }}>{doctor.specialty}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {doctor.hospital}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "40px", display: 'flex', justifyContent: 'center' }}>
              <Calendar selectedDate={date} onSelectDate={setDate} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {Object.entries(slots).map(([g, a]) => {
                const validSlots = isToday
                  ? a.filter(s => getMinutesFromTime(s) > currentTotalMinutes)
                  : a;

                if (validSlots.length === 0) return null;

                return (
                  <section key={g}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <Clock size={18} className="text-primary" />
                      <b style={{ fontSize: "16px", color: "var(--text-main)" }}>{g}</b>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '16px' }}>
                      {validSlots.map((s) => (
                        <div
                          className={`slot-btn ${slot === s ? 'active' : ''}`}
                          onClick={() => setSlot(s)}
                          key={s}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <aside className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div style={{ position: 'sticky', top: '120px' }}>
              <Summary
                doctor={doctor}
                date={date}
                slot={slot}
                action="Continue to Review"
                onAction={() => go("/review")}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
