import { Star, MapPin, Check, Heart, ArrowLeft, CalendarDays, Award, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import Steps from "../components/common/Steps";
import Avatar from "../components/common/Avatar";

export default function DoctorProfile() {
  const { doctor } = useBooking();
  const { user, openLoginModal } = useAuth();
  const go = useNavigate();

  if (!doctor) return null;

  return (
    <main className="page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingBottom: '40px' }}>

        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '32px 0', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }} onClick={() => go(-1)}>
          <ArrowLeft size={20} /> <span>Back to Doctors</span>
        </div>

        <Steps current={1} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', marginTop: '32px' }}>

          {/* Left Column: Doctor Profile & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <section className="glass-panel" style={{ padding: '32px', background: 'var(--surface)' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: "24px" }}>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <Avatar doctor={doctor} big />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h1 style={{ fontSize: "28px", color: "var(--text-main)", margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>{doctor.name}</h1>
                      <Heart size={24} color="#ef4444" fill="rgba(239, 68, 68, 0.1)" cursor="pointer" />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {doctor.specialty && <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '700' }}>{doctor.specialty}</span>}
                      {doctor.qualification && <span style={{ fontSize: '14px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>🎓 {doctor.qualification}</span>}
                    </div>

                    <span style={{ fontSize: "14px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: '4px' }}>
                      <Award size={16} /> {doctor.experienceText} Experience
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <b style={{ display: 'block', fontSize: '24px', color: 'var(--text-main)', marginBottom: '4px' }}>4.9</b>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: '#eab308', marginBottom: '4px' }}><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                  <small style={{ color: 'var(--muted)' }}>120 Reviews</small>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                  <b style={{ display: 'block', fontSize: '24px', color: 'var(--text-main)', marginBottom: '4px' }}>15k+</b>
                  <small style={{ color: 'var(--muted)', display: 'block', marginTop: '18px' }}>Patients Consulted</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <b style={{ display: 'block', fontSize: '24px', color: 'var(--text-main)', marginBottom: '4px' }}>99%</b>
                  <small style={{ color: 'var(--muted)', display: 'block', marginTop: '18px' }}>Recommendation</small>
                </div>
              </div>
            </section>

            {/* About & Services */}
            <section className="glass-panel" style={{ padding: '32px', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', borderBottom: '2px solid var(--primary)', paddingBottom: '16px', marginBottom: '-17px' }}>About</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--muted)', cursor: 'pointer' }}>Experience</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--muted)', cursor: 'pointer' }}>Reviews</span>
              </div>

              <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '32px' }}>
                Dr. {doctor.name.split(" ").slice(1).join(" ")} is a highly experienced medical professional focusing on comprehensive patient care. With a holistic approach to medicine, they prioritize both immediate symptom relief and long-term health strategies.
              </p>

              <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '20px', fontWeight: '700' }}>Services Offered</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  "Comprehensive Diagnosis",
                  "Preventative Care",
                  "Chronic Disease Management",
                  "Post-op Rehabilitation",
                  "Specialist Referrals",
                  "Tele-consultations"
                ].map((x) => (
                  <div key={x} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-alt)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', padding: '4px' }}>
                      <Check size={14} />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{x}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div>
            <div className="glass-panel" style={{ padding: '32px', background: 'var(--surface)', position: 'sticky', top: '120px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 24px 0' }}>Book Appointment</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}><MapPin size={24} /></div>
                  <div>
                    <b style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>{doctor.hospital}</b>
                    <small style={{ color: 'var(--muted)', fontSize: '13px' }}>Clinic Visit</small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}><Clock size={24} /></div>
                  <div>
                    <b style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>15 Min Consult</b>
                    <small style={{ color: 'var(--muted)', fontSize: '13px' }}>Estimated Duration</small>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                <span style={{ fontSize: '15px', color: 'var(--muted)', fontWeight: '500' }}>Consultation Fee</span>
                <b style={{ fontSize: '24px', color: 'var(--text-main)' }}>₹800</b>
              </div>

              <button
                className="hover-lift"
                onClick={() => user ? go("/slot") : openLoginModal("/slot")}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px', width: '100%', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <CalendarDays size={20} /> Select Time Slot
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
