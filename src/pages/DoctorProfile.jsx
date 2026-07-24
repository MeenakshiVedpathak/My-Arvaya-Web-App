import { Star, MapPin, Check, Heart, ArrowLeft, CalendarDays, Award, Clock, ShieldCheck } from "lucide-react";
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
    <main className="page" style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: '24px 0' }}>
      <div className="container" style={{ paddingBottom: '24px' }}>

        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }} onClick={() => go(-1)}>
          <ArrowLeft size={20} /> <span>Back to Doctors</span>
        </div>

        <Steps current={1} />

        <div className="doctor-profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginTop: '16px' }}>

          {/* Left Column: Doctor Profile & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <section style={{ paddingBottom: '16px' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: 'wrap' }}>
                  <Avatar doctor={doctor} big />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: "24px", color: "var(--text-main)", margin: 0, fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {doctor.name}
                        </h1>
                        <Heart size={22} color="#ef4444" fill="rgba(239, 68, 68, 0.1)" cursor="pointer" />
                      </div>
                      <span style={{ fontSize: '12px', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', alignSelf: 'flex-start', marginTop: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <ShieldCheck size={12}/> Medical Registration Verified
                      </span>
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

              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', borderBottom: '2px solid var(--primary)', paddingBottom: '12px', marginBottom: '-13px' }}>Profile Details</span>
              </div>
              
              <div style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '16px' }}>
                <div style={{ marginBottom: '12px' }}><strong>Specialty:</strong> {doctor.specialty || 'N/A'}</div>
                {doctor.qualification && <div style={{ marginBottom: '12px' }}><strong>Qualification:</strong> {doctor.qualification}</div>}
                {doctor.gender && <div style={{ marginBottom: '12px' }}><strong>Gender:</strong> {doctor.gender === 'M' ? 'Male' : doctor.gender === 'F' ? 'Female' : doctor.gender}</div>}
                {doctor.experience && doctor.experience !== "10+" && <div style={{ marginBottom: '12px' }}><strong>Experience:</strong> {doctor.experienceText}</div>}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div>
            <div className="card-elevated" style={{ position: 'sticky', top: '120px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 16px 0' }}>Book Appointment</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'var(--bg-app)', borderRadius: '12px' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}><MapPin size={24} /></div>
                  <div>
                    <b style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>{doctor.hospital}</b>
                    <small style={{ color: 'var(--muted)', fontSize: '13px' }}>Clinic Visit</small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'var(--bg-app)', borderRadius: '12px' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}><Clock size={24} /></div>
                  <div>
                    <b style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>15 Min Consult</b>
                    <small style={{ color: 'var(--muted)', fontSize: '13px' }}>Estimated Duration</small>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', color: 'var(--muted)', fontWeight: '500' }}>Consultation Fee</span>
                <b style={{ fontSize: '24px', color: 'var(--text-main)' }}>₹{doctor.fee}</b>
              </div>

              <button
                className="btn btn-primary hover-glow"
                onClick={() => user ? go("/slot") : openLoginModal("/slot")}
                style={{ padding: '16px', width: '100%', borderRadius: '12px', fontSize: '16px' }}
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
