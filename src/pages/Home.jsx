import { useState, useEffect } from "react";
import {
  Search,
  Stethoscope,
  Building2,
  FlaskConical,
  Fingerprint,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Activity,
  CalendarDays,
  Phone,
  FileText,
  Route,
  Pill,
  ClipboardList,
  Users,
  BellRing,
  Heart,
  Footprints,
  Moon,
  ChevronRight,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doctors, packages } from "../mocks/data";

export default function Home() {
  const go = useNavigate();
  const { user } = useAuth();
  const doc = doctors[0]; // Dr. Priya Sharma for upcoming appointment

  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    { src: "/banner_healthcare_1.png" },
    { src: "/banner_healthcare_3.png" },
    { src: "/banner_healthcare_2.png" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <main className="platform-home">

      {/* ── Banner Carousel Section ── */}
      <section className="home-banner-carousel" style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {banners.map((banner, index) => (
          <div 
            key={index} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              opacity: currentSlide === index ? 1 : 0, 
              transition: 'opacity 0.8s ease-in-out',
              zIndex: currentSlide === index ? 1 : 0
            }}
          >
            <img 
              src={banner.src} 
              alt={`Banner ${index + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', cursor: 'pointer' }}
              onClick={() => go("/doctors")}
            />
          </div>
        ))}

        {/* Indicator Dots */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 10 }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: currentSlide === index ? 'var(--primary)' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Quick Services Banner ── */}
      <div className="container" style={{ marginTop: '40px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { icon: <Stethoscope size={28}/>, title: "Consult Doctors", desc: "Online or in-clinic", path: "/doctors", color: "#3b82f6", bg: "#eff6ff" },
            { icon: <FlaskConical size={28}/>, title: "Lab Tests", desc: "Home sample pickup", path: "/labs", color: "#8b5cf6", bg: "#f3e8ff" },
            { icon: <Building2 size={28}/>, title: "Find Hospitals", desc: "Top rated centers", path: "/hospitals", color: "#ef4444", bg: "#fef2f2" },
            { icon: <Fingerprint size={28}/>, title: "ABHA Card", desc: "Create your health ID", path: "/abha", color: "#10b981", bg: "#ecfdf5" },
          ].map((s, i) => (
            <div key={i} onClick={() => go(s.path)} style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <b style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>{s.title}</b>
                <small style={{ color: '#64748b', fontSize: '13px' }}>{s.desc}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Specialties ── */}
      <section style={{ padding: '80px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Consult top doctors by specialty</h2>
              <p style={{ color: '#64748b', margin: 0 }}>Find experienced doctors across all specialties</p>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }} onClick={() => go("/doctors")}>View all specialties &rarr;</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {[
              { icon: <HeartPulse size={32}/>, name: "Cardiology" },
              { icon: <Brain size={32}/>, name: "Neurology" },
              { icon: <Baby size={32}/>, name: "Pediatrics" },
              { icon: <Bone size={32}/>, name: "Orthopedics" },
              { icon: <Activity size={32}/>, name: "General Medicine" },
              { icon: <Stethoscope size={32}/>, name: "Dermatology" },
            ].map((spec, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }} onClick={() => go("/doctors")}>
                <div style={{ color: 'var(--primary)' }}>{spec.icon}</div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155', textAlign: 'center' }}>{spec.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Health Packages ── */}
      <section style={{ padding: '40px 0 80px', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Comprehensive Health Packages</h2>
              <p style={{ color: '#64748b', margin: 0 }}>Get comprehensive checkups at the comfort of your home</p>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }} onClick={() => go("/labs")}>View all packages &rarr;</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {packages.map((pkg, i) => (
              <article key={i} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'} onClick={() => go("/labs")}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <img src={pkg.img} alt={pkg.title} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                  <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{pkg.discount} OFF</span>
                </div>
                <b style={{ display: 'block', fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>{pkg.title}</b>
                <small style={{ display: 'block', color: '#64748b', marginBottom: '16px' }}>{pkg.tests}</small>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '18px', color: '#0f172a' }}>{pkg.price}</b>
                    <s style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>{pkg.oldPrice}</s>
                  </div>
                  <button style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Book</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Your Personal Health Dashboard (Existing Portal Features) ── */}
      {user && (
        <section style={{ padding: '60px 0', borderTop: '1px solid #e2e8f0' }}>
          <div className="container">
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 32px 0' }}>Your Health Dashboard</h2>
            
            <div className="home-two-col" style={{ marginTop: 0 }}>
              
              {/* Upcoming Appointment */}
              <div className="home-card">
                <h3 className="home-section-label">Upcoming Appointment</h3>
                <div className="home-appt-body">
                  <div className="home-appt-avatar">
                    {doc.name.split(" ")[1][0]}{doc.name.split(" ")[2][0]}
                  </div>
                  <div className="home-appt-info">
                    <b>{doc.name}</b>
                    <small>{doc.specialty}</small>
                  </div>
                  <div className="home-appt-date">
                    <CalendarDays size={18} />
                    <div>
                      <b>15 Jun, 2026</b>
                      <small>10:00 AM</small>
                    </div>
                  </div>
                </div>
                <div className="home-appt-footer">
                  <div className="home-appt-location">
                    <MapPin size={16} /> <span>{doc.hospital}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}><Phone size={16} /></button>
                    <button style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}><FileText size={16} /></button>
                    <button className="home-appt-details-btn" onClick={() => go("/appointments/1")}>Details</button>
                  </div>
                </div>
              </div>

              {/* Health Summary */}
              <div className="home-card">
                <h3 className="home-section-label">Health Summary</h3>
                <div className="home-health-stats">
                  
                  <div className="home-health-steps">
                    <div className="home-stat-header">
                      <span className="home-stat-title">Steps</span>
                      <Footprints size={16} className="home-stat-icons" />
                    </div>
                    <div className="home-stat-value">5,234 <small>/ 8000</small></div>
                    <div className="home-steps-bar">
                      <div className="home-steps-fill" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  <div className="home-health-stat-item">
                    <div className="home-stat-icon-circle sleep">
                      <Moon size={20} />
                    </div>
                    <div className="home-stat-title">Sleep</div>
                    <div className="home-stat-value">7<small>h</small> 20<small>m</small></div>
                  </div>

                  <div className="home-health-stat-item">
                    <div className="home-stat-icon-circle heart">
                      <Heart size={20} />
                    </div>
                    <div className="home-stat-title">Heart</div>
                    <div className="home-stat-value">72 <small>bpm</small></div>
                  </div>

                </div>
              </div>
            </div>

            {/* Manage Your Health Grid */}
            <div className="home-card" style={{ marginTop: '32px' }}>
              <h3 className="home-section-label">Manage Your Records</h3>
              <div className="home-manage-grid">
                <div className="home-manage-item" onClick={() => go("/records")}>
                  <div className="home-manage-icon"><ClipboardList size={22} /></div>
                  <span>Medical Records</span>
                </div>
                <div className="home-manage-item" onClick={() => go("/records")}>
                  <div className="home-manage-icon"><Pill size={22} /></div>
                  <span>Prescriptions</span>
                </div>
                <div className="home-manage-item" onClick={() => go("/records")}>
                  <div className="home-manage-icon"><FlaskConical size={22} /></div>
                  <span>Test Reports</span>
                </div>
                <div className="home-manage-item" onClick={() => go("/records")}>
                  <div className="home-manage-icon"><BellRing size={22} /></div>
                  <span>Reminders</span>
                </div>
                <div className="home-manage-item" onClick={() => alert("Family linking coming soon")}>
                  <div className="home-manage-icon"><Users size={22} /></div>
                  <span>Family Members</span>
                </div>
                <div className="home-manage-item" onClick={() => go("/abha")}>
                  <div className="home-manage-icon"><Fingerprint size={22} /></div>
                  <span>ABHA Profile</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
