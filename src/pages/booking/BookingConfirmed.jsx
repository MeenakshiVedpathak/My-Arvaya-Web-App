import { useEffect } from "react";
import { CheckCircle2, CalendarDays, Clock, MapPin, Share2 } from "lucide-react";
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

  return (
    <main className="page animate-fade-in-up" style={{ background: 'var(--bg-app)', minHeight: 'calc(100vh - 80px)', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        <section className="card-elevated animate-scale-in" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '64px 40px', background: 'var(--bg-surface)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(46, 102, 110, 0.08)' }}>
          
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

          <h1 style={{ fontSize: '32px', color: 'var(--text-main)', margin: '0 0 16px', lineHeight: 1.3, letterSpacing: '-0.02em', fontWeight: '800' }}>
            Appointment Confirmed!
          </h1>
          
          <div style={{ background: 'var(--bg-app)', border: '1px dashed var(--border)', borderRadius: '16px', display: 'inline-flex', flexDirection: 'column', padding: '16px 40px', marginBottom: '40px' }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Booking ID</span>
            <b style={{ fontSize: "22px", color: "var(--primary-dark)", letterSpacing: '2px', fontFamily: 'monospace' }}>
              {bookingId || "APMNT" + Date.now().toString().slice(-8)}
            </b>
          </div>

          <div style={{ border: "1px solid var(--border)", padding: "24px", borderRadius: "20px", textAlign: 'left', marginBottom: '40px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px dashed var(--border)" }}>
              {doctor?.image && !doctor.image.includes('ui-avatars') ? (
                <img src={doctor.image} alt={doctor.name} style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'var(--bg-app)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {doctor?.name?.substring(0, 2).toUpperCase() || "DR"}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                <b style={{ fontSize: "20px", color: "var(--text-main)", display: 'flex', alignItems: 'center', gap: '6px' }}>{doctor?.name} <CheckCircle2 size={18} className="text-success" /></b>
                <small style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: '500' }}>{doctor?.specialty} • {bookingVisitType}</small>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="receipt-row">
                <CalendarDays size={20} /> {formattedDate}
              </span>
              <span className="receipt-row">
                <Clock size={20} /> {slot}
              </span>
              <span className="receipt-row">
                <MapPin size={20} /> {bookingHospital?.name || doctor?.hospital || "Arvaya Clinic"}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: "0 0 40px", lineHeight: 1.6 }}>
            We have sent the appointment details and instructions to<br />your registered email and SMS.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <button className="btn btn-primary" onClick={() => navigate("/my-appointments")} style={{ padding: '16px', justifyContent: 'center', fontSize: '16px', borderRadius: '12px', width: '100%' }}>
              View My Appointments
            </button>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: '12px' }}>
                <CalendarDays size={18} /> Add to Calendar
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: '12px' }}>
                <Share2 size={18} /> Share Details
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
