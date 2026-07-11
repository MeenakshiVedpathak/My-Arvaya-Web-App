import { CheckCircle2, Calendar as CalendarIcon, MapPin, User, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingConfirmation() {
  const { state } = useLocation();
  const go = useNavigate();
  
  // Default fallback if someone hits /confirmed directly
  const booking = state || {
    doctor: { name: "Dr. Sushant Tolgekar", specialty: "Dermatologist" },
    date: "Sat, Jul 11, 2026",
    time: "10:00 AM",
    branch: { name: "APEX Hospital", address: "Shivaji Park, Kohlapur" }
  };

  return (
    <main className="container page booking-wizard" style={{ textAlign: "center", paddingTop: "60px" }}>
      <div style={{ display: "inline-flex", background: "#dcfce7", padding: "24px", borderRadius: "50%", marginBottom: "24px" }}>
        <CheckCircle2 size={64} color="#16a34a" />
      </div>
      
      <h1 className="header-title" style={{ fontSize: "32px", marginBottom: "8px" }}>Booking Confirmed!</h1>
      <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "40px" }}>
        Your appointment has been successfully scheduled. We have sent a confirmation email with details.
      </p>

      <div className="branch-card" style={{ textAlign: "left", maxWidth: "800px", margin: "0 auto", cursor: "default" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
          <div className="branch-icon"><CalendarIcon size={24} /></div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", color: "#0f172a" }}>{booking.date}</h4>
            <span style={{ color: "#2e666e", fontWeight: "600" }}>{booking.time}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <User size={20} color="#64748b" />
          <div>
            <b style={{ display: "block", color: "#0f172a" }}>{booking.doctor.name}</b>
            <span style={{ fontSize: "13px", color: "#64748b" }}>{booking.doctor.specialty}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MapPin size={20} color="#64748b" />
          <div>
            <b style={{ display: "block", color: "#0f172a" }}>{booking.branch.name}</b>
            <span style={{ fontSize: "13px", color: "#64748b" }}>{booking.branch.address}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "40px", display: "flex", gap: "16px", justifyContent: "center" }}>
        <button 
          className="pro-btn-secondary" 
          style={{ padding: "16px 32px", borderRadius: "12px", fontSize: "16px", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", fontWeight: "600", color: "#334155" }}
          onClick={() => go("/records")}
        >
          View Appointments
        </button>
        <button 
          className="pro-btn-primary" 
          style={{ padding: "16px 32px", borderRadius: "12px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => go("/")}
        >
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}
