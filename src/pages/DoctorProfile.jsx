import { Star, MapPin, Check, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import Steps from "../components/common/Steps";
import Avatar from "../components/common/Avatar";
export default function DoctorProfile() {
  let { doctor } = useBooking(),
    go = useNavigate();
  return (
    <main className="container page">
      <Steps current={1} />
      <div className="profilelayout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Doctor Identity & Booking */}
        <section className="mockup-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            <h1 className="header-title" style={{ margin: 0 }} onClick={() => go(-1)}>
              <ArrowLeft /> {doctor.name}
            </h1>
            <Heart size={20} color="#ff5b5b" fill="#ff5b5b" />
          </div>
          
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <Avatar doctor={doctor} big />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <b style={{ fontSize: "18px", color: "#4e4e4d" }}>{doctor.name}</b>
              {doctor.qualification && <small style={{ fontSize: "13px", color: "#718096" }}>{doctor.qualification}</small>}
              <span style={{ fontSize: "13px", color: "#718096", display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={14} /> {doctor.experienceText} Experience
              </span>
            </div>
          </div>

          <div className="loc-fee-box">
            <div className="loc-fee-item">
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <MapPin size={20} color="#2e666e" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: "14px", color: "#4e4e4d" }}>{doctor.hospital}</b>
                  <small style={{ fontSize: "12px", color: "#718096" }}>Bangalore</small>
                </div>
              </span>
            </div>
            <div className="loc-fee-item" style={{ alignItems: 'flex-start' }}>
              <b style={{ fontSize: "16px", color: "#4e4e4d" }}>TBD</b>
              <small style={{ fontSize: "12px", color: "#718096" }}>Consultation Fee</small>
            </div>
          </div>

          <button
            className="primary full"
            onClick={() => go("/slot")}
            style={{ marginTop: "16px", fontSize: '15px', padding: '14px' }}
          >
            Book Appointment
          </button>
        </section>
        
        {/* Right Column: Doctor Details */}
        <aside className="mockup-card">
          <div className="profile-tabs">
            <span className="active">About</span>
            <span>Experience</span>
            <span>Reviews</span>
            <span>Services</span>
          </div>

          <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.6, marginBottom: '24px' }}>
            Dr. {doctor.name.split(" ").slice(1).join(" ")} is a highly experienced medical professional focusing on comprehensive patient care, with over {doctor.experienceText} of clinical practice.
          </p>

          <h3 style={{ fontSize: '16px', color: '#4e4e4d', marginBottom: '16px' }}>Services</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              "Orthodontic Treatment",
              "Cosmetic Dentistry",
              "Teeth Cleaning",
              "Dental Implants",
              "Root Canal Treatment",
            ].map((x) => (
              <p key={x} style={{ fontSize: '14px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Check size={16} color="var(--accent)" /> {x}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
