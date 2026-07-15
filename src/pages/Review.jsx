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

  if (!doctor) return null;

  return (
    <main className="page" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container">

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }} onClick={() => go(-1)}>
          <ArrowLeft size={20} /> <span>Back to Selection</span>
        </div>

        <Steps current={3} />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginTop: '32px' }}>
          <section className="glass-panel" style={{ padding: '32px', background: 'var(--surface)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>Review Appointment</h1>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--surface-alt)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              {[
                ["Date", formattedDate],
                ["Time", slot],
                ["Patient", user?.name || "Patient"],
                ["Purpose of Visit", "Regular Checkup"],
                ["Mode", "In-clinic"],
                ["Amount to Pay", `₹${doctor.fee || "0"}`],
              ].map((x) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px' }} key={x[0]}>
                  <span style={{ color: 'var(--muted)' }}>{x[0]}</span>
                  <b style={{ color: 'var(--text-main)', fontWeight: '600' }}>{x[1]}</b>
                </div>
              ))}
            </div>
          </section>

          <aside className="glass-panel" style={{ alignSelf: 'start', padding: '32px', background: 'var(--surface)' }}>
            <b style={{ fontSize: '16px', color: 'var(--text-main)', display: 'block', marginBottom: '16px' }}>Apply Coupon</b>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input placeholder="Enter code" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', outline: 'none' }} />
              <button className="hover-lift" style={{ background: 'var(--surface-alt)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Apply</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 24px', borderTop: '1px dashed var(--border)', paddingTop: '24px' }}>
              <span style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: '600' }}>Total Amount</span>
              <b style={{ fontSize: '24px', color: 'var(--text-main)' }}>₹{doctor.fee || "0"}</b>
            </div>

            <button className="hover-lift" onClick={confirm} disabled={submitting} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px', width: '100%', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all 0.2s' }}>
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
