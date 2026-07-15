import { ArrowLeft, CheckCircle2, CalendarDays, Clock, MapPin } from "lucide-react";
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
    <main className="page" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Steps current={4} />

        <section className="glass-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '48px 32px', background: 'var(--surface)', marginTop: '32px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 24px 0', position: 'relative' }}>
            <div style={{ background: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 0 0 12px var(--primary-light)' }}>
              <CheckCircle2 color="white" size={40} />
            </div>
            {/* Simple confetti dots using absolute positioning */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}>
              <span style={{ position: 'absolute', top: '10%', left: '20%', width: '6px', height: '6px', background: '#f56565', borderRadius: '50%' }}></span>
              <span style={{ position: 'absolute', top: '30%', left: '10%', width: '4px', height: '4px', background: '#f6e05e', borderRadius: '50%' }}></span>
              <span style={{ position: 'absolute', bottom: '20%', left: '25%', width: '8px', height: '8px', background: '#48bb78', borderRadius: '50%' }}></span>
              <span style={{ position: 'absolute', top: '15%', right: '25%', width: '6px', height: '6px', background: '#4299e1', borderRadius: '50%' }}></span>
              <span style={{ position: 'absolute', top: '40%', right: '15%', width: '5px', height: '5px', background: '#ed8936', borderRadius: '50%' }}></span>
              <span style={{ position: 'absolute', bottom: '30%', right: '20%', width: '6px', height: '6px', background: '#f56565', borderRadius: '50%' }}></span>
            </div>
          </div>

          <h1 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 24px', lineHeight: 1.3, letterSpacing: '-0.02em', fontWeight: '800' }}>
            Your {bookingType === 'lab' ? "sample collection" : "appointment"} has<br />been confirmed!
          </h1>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--muted)", fontWeight: '600' }}>
            Booking ID
          </p>
          <b style={{ display: "block", marginBottom: "32px", fontSize: "18px", color: "var(--text-main)", letterSpacing: '1px' }}>
            {bookingId || "APMNT12345678"}
          </b>

          <div style={{ border: "1px solid var(--border)", padding: "24px", borderRadius: "16px", textAlign: 'left', marginBottom: '32px', background: 'var(--surface-alt)' }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
              {bookingType === 'lab' && labPackage ? (
                <>
                  {labPackage.img && <img src={labPackage.img} alt={labPackage.title} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <b style={{ fontSize: "16px", color: "var(--text-main)" }}>{labPackage.title}</b>
                    <small style={{ fontSize: "13px", color: "var(--muted)" }}>{labPackage.tests}</small>
                  </div>
                </>
              ) : (
                <>
                  <Avatar doctor={doctor} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <b style={{ fontSize: "16px", color: "var(--text-main)" }}>{doctor.name}</b>
                    <small style={{ fontSize: "13px", color: "var(--muted)" }}>{doctor.specialty}</small>
                  </div>
                </>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-main)', fontWeight: '500' }}>
                <CalendarDays size={18} color="var(--primary)" /> {formattedDate}
              </span>
              <span style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-main)', fontWeight: '500' }}>
                <Clock size={18} color="var(--primary)" /> {slot}
              </span>
              <span style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '15px', color: 'var(--text-main)', fontWeight: '500' }}>
                <MapPin size={18} color="var(--primary)" /> {bookingType === 'lab' ? "Home Collection" : doctor.hospital}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 32px", lineHeight: 1.5 }}>
            We have sent the details to your<br />email and SMS.
          </p>

          <div style={{ display: 'flex', gap: '16px', maxWidth: '400px', margin: '0 auto', flexDirection: 'column' }}>
            <button className="hover-lift" style={{ background: 'var(--surface-alt)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CalendarDays size={18} />
              Add to Calendar
            </button>
            <button className="hover-lift" onClick={() => go("/")} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              Go to My Appointments
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
