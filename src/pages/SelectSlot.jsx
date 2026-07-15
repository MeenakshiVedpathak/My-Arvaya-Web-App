import { ArrowLeft } from "lucide-react";
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
    <main className="page" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container">

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }} onClick={() => go(-1)}>
          <ArrowLeft size={20} /> <span>Back to Profile</span>
        </div>

        <Steps current={2} />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginTop: '32px' }}>
          <section className="glass-panel" style={{ padding: '32px', background: 'var(--surface)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>Select Date & Time</h1>

            <div style={{ display: "flex", gap: "16px", marginBottom: "32px", border: "1px solid var(--border)", padding: "16px", borderRadius: "16px", background: 'var(--surface-alt)' }}>
              <Avatar doctor={doctor} />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                <b style={{ fontSize: "16px", color: "var(--text-main)" }}>{doctor.name}</b>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)' }}>
                  <span>{doctor.specialty}</span>
                  <span style={{ color: 'var(--border)' }}>|</span>
                  <span>{doctor.hospital}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "32px", display: 'flex', justifyContent: 'center' }}>
              <Calendar selectedDate={date} onSelectDate={setDate} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {Object.entries(slots).map(([g, a]) => {
                const validSlots = isToday
                  ? a.filter(s => getMinutesFromTime(s) > currentTotalMinutes)
                  : a;

                if (validSlots.length === 0) return null;

                return (
                  <section key={g}>
                    <b style={{ fontSize: "16px", color: "var(--text-main)", display: "block", marginBottom: "16px" }}>{g}</b>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                      {validSlots.map((s) => (
                        <div
                          className="hover-lift"
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: `1px solid ${slot === s ? 'var(--primary)' : 'var(--border)'}`,
                            background: slot === s ? 'var(--primary)' : 'var(--surface-alt)',
                            color: slot === s ? '#fff' : 'var(--text-main)',
                            transition: 'all 0.2s'
                          }}
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

          <aside>
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
