import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { bookAppointment } from "../services/dataService";
import Steps from "../components/common/Steps";
import Avatar from "../components/common/Avatar";
export default function Review() {
  let { doctor, date, slot, setBookingId } = useBooking(),
    go = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  let confirm = async () => {
    setSubmitting(true);
    try {
      const result = await bookAppointment({
        doctorId: doctor.id,
        date: date?.toISOString(),
        slot,
      });
      setBookingId(result.bookingId);
      go("/confirmed");
    } catch {
      setBookingId("APMNT" + Date.now().toString().slice(-8));
      go("/confirmed");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = date && date instanceof Date 
    ? date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : "";

  return (
    <main className="container page">
      <Steps current={3} />
      <div className="reviewlayout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <section className="mockup-card">
          <h1 className="header-title" onClick={() => go(-1)}>
            <ArrowLeft /> Review Appointment
          </h1>
          <div style={{ display: "flex", gap: "16px", marginBottom: "32px", border: "1px solid #edf1f6", padding: "16px", borderRadius: "16px" }}>
            <Avatar doctor={doctor} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", justifyContent: "center" }}>
              <b style={{ fontSize: "16px", color: "#4e4e4d" }}>{doctor.name}</b>
              <small style={{ fontSize: "12px", color: "#718096" }}>{doctor.specialty}</small>
              <small style={{ fontSize: "12px", color: "#718096" }}>{doctor.hospital}</small>
            </div>
          </div>
          <div className="review-table">
            {[
              ["Date", formattedDate],
              ["Time", slot],
              ["Consultation Fee", `₹${doctor.fee}`],
              ["Patient", user?.name || "Patient"],
              ["Purpose of Visit", "Regular Checkup"],
              ["Mode", "In-clinic"],
              ["Amount to Pay", `₹${doctor.fee}`],
            ].map((x) => (
              <div className="row" key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
              </div>
            ))}
          </div>
        </section>
        
        <aside className="mockup-card summary" style={{ alignSelf: 'start' }}>
          <b style={{ fontSize: '15px', color: '#4e4e4d' }}>Apply Coupon</b>
          <div className="coupon-box">
            <input placeholder="Enter coupon code" />
            <button>Apply</button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 24px', borderTop: '1px dashed #edf1f6', paddingTop: '24px' }}>
            <span style={{ fontSize: '14px', color: '#718096', fontWeight: '500' }}>Total Amount</span>
            <b style={{ fontSize: '20px', color: '#4e4e4d' }}>₹{doctor.fee}</b>
          </div>
          <button className="primary full" onClick={confirm} disabled={submitting} style={{ padding: '14px', fontSize: '15px', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </aside>
      </div>
    </main>
  );
}
