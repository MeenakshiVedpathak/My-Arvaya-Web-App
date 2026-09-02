import { useEffect, useCallback } from "react";
import { CheckCircle2, CalendarDays, Clock, MapPin, Share2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";

export default function BookingConfirmed() {
  const { doctor, date, slot, bookingId, bookingVisitType, bookingHospital, clearBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (clearBooking) clearBooking();
    };
  }, [clearBooking]);

  const formattedDate = date && date instanceof Date
    ? date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : "";

  const handleAddToCalendar = useCallback(() => {
    if (!date || !(date instanceof Date)) return;
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const formatIcsDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}Z`;
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Arvaya Healthcare//Booking Confirmation//EN",
      "BEGIN:VEVENT",
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${doctor?.name || "Appointment with Arvaya Healthcare"}`,
      "DESCRIPTION:Appointment confirmed with Arvaya Healthcare",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arvaya-booking.ics";
    a.click();
    URL.revokeObjectURL(url);
  }, [date, doctor]);

  const handleShareDetails = useCallback(() => {
    const details = `My appointment is confirmed with Arvaya Healthcare.\nBooking ID: ${bookingId || "APMNT" + Date.now().toString().slice(-8)}\nDoctor: Dr. ${doctor?.name || "N/A"}\nDate: ${formattedDate}\nTime: ${slot}`;
    if (navigator.share) {
      navigator.share({
        title: "Arvaya Healthcare Booking Confirmation",
        text: details,
      }).catch((err) => {
        navigator.clipboard.writeText(details).then(() => {
          alert("Booking details copied to clipboard!");
        });
      });
    } else {
      navigator.clipboard.writeText(details).then(() => {
        alert("Booking details copied to clipboard!");
      }).catch(() => {
        alert("Unable to share. Please copy the details manually.");
      });
    }
  }, [bookingId, doctor, slot, formattedDate]);

  return (
    <main className="page animate-fade-in-up" style={{ background: 'var(--bg-app)', minHeight: 'calc(100vh - 80px)', padding: '40px 12px' }}>
      <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        <section className="card-elevated animate-scale-in booking-confirmed-card">
          
          <style>{`
            @keyframes success-pulse {
              0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
              70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
              100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            .success-icon-wrap {
              background: var(--success);
              width: 88px;
              height: 88px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 32px;
              animation: success-pulse 2s infinite;
            }
            .receipt-row { display: flex; align-items: center; gap: 16px; font-size: 15px; color: var(--text-main); font-weight: 500; }
            .receipt-row svg { flex-shrink: 0; color: var(--primary); }
          `}</style>

          <div className="success-icon-wrap">
            <CheckCircle2 color="white" size={48} />
          </div>

          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', color: 'var(--text-main)', margin: '0 0 16px', lineHeight: 1.3, letterSpacing: '-0.02em', fontWeight: '800' }}>
            Appointment Confirmed!
          </h1>
          
          <div style={{ background: 'var(--bg-app)', border: '1px dashed var(--border)', borderRadius: '16px', display: 'inline-flex', flexDirection: 'column', padding: '12px 24px', marginBottom: '32px', maxWidth: '100%' }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Booking ID</span>
            <b style={{ fontSize: "clamp(16px, 4vw, 22px)", color: "var(--primary-dark)", letterSpacing: '2px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {bookingId || "APMNT" + Date.now().toString().slice(-8)}
            </b>
          </div>

          <div style={{ border: "1px solid var(--border)", padding: "20px", borderRadius: "20px", textAlign: 'left', marginBottom: '32px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px dashed var(--border)", alignItems: 'center', flexWrap: 'wrap' }}>
              {doctor?.image && !doctor.image.includes('ui-avatars') ? (
                <img src={doctor.image} alt={doctor.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-app)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {doctor?.name?.substring(0, 2).toUpperCase() || "DR"}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                <b style={{ fontSize: "18px", color: "var(--text-main)", display: 'flex', alignItems: 'center', gap: '6px' }}>{doctor?.name} <CheckCircle2 size={18} className="text-success" /></b>
                <small style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: '500' }}>{doctor?.specialty} • {bookingVisitType}</small>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <span className="receipt-row">
                <CalendarDays size={18} /> {formattedDate}
              </span>
              <span className="receipt-row">
                <Clock size={18} /> {slot}
              </span>
              <span className="receipt-row">
                <MapPin size={18} /> {bookingHospital?.name || doctor?.hospital || "Arvaya Clinic"}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 32px", lineHeight: 1.6 }}>
            We have sent the appointment details and instructions to<br />your registered email and SMS.
          </p>

          <div className="booking-confirmed-actions">
            <button className="btn btn-primary" onClick={() => navigate("/my-appointments")} style={{ padding: '14px', justifyContent: 'center', fontSize: '15px', borderRadius: '12px', width: '100%' }}>
              View My Appointments
            </button>
            <div className="booking-confirmed-sub-actions">
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px', borderRadius: '12px', fontSize: '13px' }} onClick={handleAddToCalendar}>
                <CalendarDays size={16} /> Add to Calendar
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px', borderRadius: '12px', fontSize: '13px' }} onClick={handleShareDetails}>
                <Share2 size={16} /> Share Details
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
