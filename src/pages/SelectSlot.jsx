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

  return (
    <main className="container page">
      <Steps current={2} />
      <div className="slotlayout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <section className="mockup-card">
          <h1 className="header-title" onClick={() => go(-1)}>
            <ArrowLeft /> Select Date & Time
          </h1>
          <div style={{ display: "flex", gap: "16px", marginBottom: "32px", border: "1px solid #edf1f6", padding: "16px", borderRadius: "16px" }}>
            <Avatar doctor={doctor} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", justifyContent: "center" }}>
              <b style={{ fontSize: "16px", color: "#4e4e4d" }}>{doctor.name}</b>
              <small style={{ fontSize: "12px", color: "#718096" }}>{doctor.specialty}</small>
              <small style={{ fontSize: "12px", color: "#718096" }}>{doctor.hospital}</small>
            </div>
          </div>
          
          <div style={{ marginBottom: "32px", display: 'flex', justifyContent: 'center' }}>
            <Calendar selectedDate={date} onSelectDate={setDate} />
          </div>

          <div className="slotgroups" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(slots).map(([g, a]) => {
              const validSlots = isToday 
                ? a.filter(s => getMinutesFromTime(s) > currentTotalMinutes)
                : a;
              
              if (validSlots.length === 0) return null;

              return (
                <section key={g}>
                  <b style={{ fontSize: "15px", color: "#4e4e4d", display: "block", marginBottom: "16px" }}>{g}</b>
                  <div className="time-grid">
                    {validSlots.map((s) => (
                      <div
                        className={`time-pill ${slot === s ? "active" : ""}`}
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
        
        {/* Summary acts as sidebar */}
        <aside>
          <Summary
            doctor={doctor}
            date={date}
            slot={slot}
            action="Continue"
            onAction={() => go("/review")}
          />
        </aside>
      </div>
    </main>
  );
}
