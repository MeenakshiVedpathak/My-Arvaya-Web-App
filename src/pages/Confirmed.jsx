import { CheckCircle2, CalendarDays, Clock, MapPin, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import Steps from "../components/common/Steps";
import Avatar from "../components/common/Avatar";

export default function Confirmed() {
  let { doctor, date, slot, bookingId, bookingType, labPackage } = useBooking(),
    go = useNavigate();

  const formattedDate = date && date instanceof Date
    ? date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : "";

  return (
    <main className="page page-enter" style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: '24px 0' }}>
      <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Steps current={4} />
        
        <section className="card-elevated animate-scale-in" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '48px 32px', background: 'var(--bg-surface)', marginTop: '40px', boxShadow: '0 20px 40px rgba(46, 102, 110, 0.1)' }}>
          
          <style>{`
            @keyframes success-pulse {
              0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
              70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
              100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            .success-icon-wrap {
              background: var(--success);
              width: 80px;
              height: 80px;
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
            <CheckCircle2 color="white" size={40} />
          </div>

          <h1 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 16px', lineHeight: 1.3, letterSpacing: '-0.02em', fontWeight: '800' }}>
            Your {bookingType === 'lab' ? "sample collection" : "appointment"} has<br />been confirmed!
          </h1>
          
          <div style={{ background: 'var(--bg-app)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'inline-flex', flexDirection: 'column', padding: '16px 32px', marginBottom: '32px' }}>
            <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking ID</span>
            <b style={{ fontSize: "20px", color: "var(--primary-dark)", letterSpacing: '2px', fontFamily: 'monospace' }}>
              {bookingId || "APMNT12345678"}
            </b>
          </div>

          <div style={{ border: "1px solid var(--border)", padding: "24px", borderRadius: "var(--radius-lg)", textAlign: 'left', marginBottom: '32px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px dashed var(--border)" }}>
              {bookingType === 'lab' && labPackage ? (
                <>
                  {labPackage.img && <img src={labPackage.img} alt={labPackage.title} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', background: 'var(--primary-light)' }} />}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <b style={{ fontSize: "18px", color: "var(--text-main)" }}>{labPackage.title}</b>
                    <small style={{ fontSize: "14px", color: "var(--muted)" }}>{labPackage.tests}</small>
                  </div>
                </>
              ) : (
                <>
                  <Avatar doctor={doctor} size="64px" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <b style={{ fontSize: "18px", color: "var(--text-main)", display: 'flex', alignItems: 'center', gap: '6px' }}>{doctor?.name} <CheckCircle2 size={16} className="text-success" /></b>
                    <small style={{ fontSize: "14px", color: "var(--muted)" }}>{doctor?.specialty}</small>
                  </div>
                </>
              )}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span className="receipt-row">
                <CalendarDays size={20} /> {formattedDate}
              </span>
              <span className="receipt-row">
                <Clock size={20} /> {slot}
              </span>
              <span className="receipt-row">
                <MapPin size={20} /> {bookingType === 'lab' ? "Home Collection" : (doctor?.hospital || "Arvaya Clinic")}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 32px", lineHeight: 1.5 }}>
            We have sent the appointment details and instructions to<br />your registered email and SMS.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <button className="btn btn-primary" onClick={() => go("/")} style={{ padding: '16px', justifyContent: 'center', fontSize: '16px', height: '56px' }}>
              Go to My Appointments
            </button>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <CalendarDays size={16} /> Add to Calendar
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <Share2 size={16} /> Share Details
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
