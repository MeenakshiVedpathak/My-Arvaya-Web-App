import { ChevronRight, ArrowRight, Activity, Heart, Eye, Brain, Bone, Baby, ShieldCheck, Star, Pill, PhoneCall, Wallet, Gift, FileText, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

export default function Home() {
  const go = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "/banner_healthcare_1.png",
    "/banner_healthcare_2.png",
    "/banner_healthcare_3.png"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="page" style={{ padding: 0 }}>
      {/* ── Carousel Banner ── */}
      <section style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
        {slides.map((src, idx) => (
          <img 
            key={src}
            src={src} 
            alt={`Banner ${idx + 1}`} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              opacity: idx === currentSlide ? 1 : 0, 
              transition: 'opacity 1s ease-in-out',
              zIndex: idx === currentSlide ? 1 : 0
            }} 
          />
        ))}
        {/* Navigation Dots */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: idx === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Value Props ── */}
      <section style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container flex justify-between">
          {[
            { icon: <Star size={24} className="text-accent" />, title: "4.9/5 Rating", sub: "From 1M+ Users" },
            { icon: <ShieldCheck size={24} className="text-success" />, title: "NABH Accredited", sub: "Quality Assured" },
            { icon: <PhoneCall size={24} className="text-primary" />, title: "24/7 Support", sub: "Always here for you" },
            { icon: <Pill size={24} className="text-accent" />, title: "100% Genuine", sub: "Medicines & Tests" }
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-4">
              {v.icon}
              <div className="flex flex-col">
                <b style={{ fontSize: '15px' }}>{v.title}</b>
                <span className="text-muted" style={{ fontSize: '13px' }}>{v.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Arvaya Ecosystem ── */}
      <section style={{ padding: '40px 24px 0 24px' }} className="container">
        <style>{`
          .ecosystem-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
          @media (max-width: 900px) { .ecosystem-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 600px) { .ecosystem-grid { grid-template-columns: 1fr; } }
        `}</style>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h2">Your Health Ecosystem</h2>
            <p className="text-muted mt-2">Manage everything from one place</p>
          </div>
        </div>
        
        <div className="ecosystem-grid">
          {[
            { title: "ABHA Hub", sub: "Create & link ABHA ID", icon: <CreditCard size={32} strokeWidth={1.5} />, link: "/abha", color: "#3b82f6", bg: "#eff6ff" },
            { title: "Arvaya Rewards", sub: "View points & offers", icon: <Gift size={32} strokeWidth={1.5} />, link: "/rewards", color: "#f59e0b", bg: "#fef3c7" },
            { title: "Digital Wallet", sub: "Fast, secure payments", icon: <Wallet size={32} strokeWidth={1.5} />, link: "/wallet", color: "#10b981", bg: "#ecfdf5" },
            { title: "Health Records", sub: "Your medical history", icon: <FileText size={32} strokeWidth={1.5} />, link: "/records", color: "#8b5cf6", bg: "#f5f3ff" },
          ].map((item) => (
            <div key={item.title} className="card-elevated card-hover flex flex-col gap-4 cursor-pointer" style={{ padding: '24px', borderTop: `4px solid ${item.color}` }} onClick={() => go(item.link)}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <b style={{ fontSize: '18px', display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>{item.title}</b>
                <span className="text-muted" style={{ fontSize: '14px', lineHeight: 1.4, display: 'block' }}>{item.sub}</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: item.color, fontSize: '14px', fontWeight: '700' }}>
                Explore <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Top Specialties ── */}
      <section className="container" style={{ padding: '40px 24px' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h2">Consult Top Specialties</h2>
            <p className="text-muted mt-2">Consult with India's best specialists</p>
          </div>
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => go("/doctors")}>View All <ArrowRight size={16} /></button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
          {[
            { name: "Cardiology", icon: <Heart size={32} strokeWidth={1.5} /> },
            { name: "Neurology", icon: <Brain size={32} strokeWidth={1.5} /> },
            { name: "Pediatrics", icon: <Baby size={32} strokeWidth={1.5} /> },
            { name: "Orthopedics", icon: <Bone size={32} strokeWidth={1.5} /> },
            { name: "General Medicine", icon: <Activity size={32} strokeWidth={1.5} /> },
            { name: "Dermatology", icon: <Eye size={32} strokeWidth={1.5} /> },
          ].map((spec) => (
            <div key={spec.name} className="card card-hover flex flex-col items-center justify-center gap-4 cursor-pointer" style={{ padding: '24px 16px', textAlign: 'center' }} onClick={() => go("/doctors")}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {spec.icon}
              </div>
              <b style={{ fontSize: '14px', color: 'var(--text-main)' }}>{spec.name}</b>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Lab Packages ── */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-h2">Featured Health Packages</h2>
              <p className="text-muted mt-2">Comprehensive checkups with home sample collection</p>
            </div>
            <button className="btn btn-secondary flex items-center gap-2" onClick={() => go("/labs")}>View All <ArrowRight size={16} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { title: "Full Body Checkup", tests: "80+ tests included", price: "₹1,499", oldPrice: "₹2,300", discount: "35% OFF", tags: ["Fasting Required"] },
              { title: "Diabetes Profile", tests: "30+ tests included", price: "₹799", oldPrice: "₹1,200", discount: "33% OFF", tags: [] },
              { title: "Heart Health", tests: "40+ tests included", price: "₹1,199", oldPrice: "₹1,800", discount: "33% OFF", tags: [] },
              { title: "Thyroid Profile", tests: "24+ tests included", price: "₹649", oldPrice: "₹900", discount: "28% OFF", tags: [] },
            ].map((pkg) => (
              <div key={pkg.title} className="card-elevated card-hover flex flex-col" style={{ padding: '20px' }}>
                <div className="flex justify-between items-start mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.3 }}>{pkg.title}</h3>
                  <div className="badge badge-accent" style={{ fontSize: '11px' }}>{pkg.discount}</div>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: '13px' }}>{pkg.tests}</p>
                <div className="flex gap-2 mb-6">
                  {pkg.tags.map(t => <span key={t} className="badge" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)' }}>{t}</span>)}
                </div>
                
                <div className="flex justify-between items-center mt-auto" style={{ paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                  <div className="flex flex-col">
                    <s className="text-muted" style={{ fontSize: '12px' }}>{pkg.oldPrice}</s>
                    <b style={{ fontSize: '18px', color: 'var(--text-main)' }}>{pkg.price}</b>
                  </div>
                  <button className="btn btn-accent" onClick={() => go("/labs")}>Book</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Promo ── */}
      <section className="container" style={{ padding: '0 24px 40px' }}>
        <div className="card text-center" style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <div className="badge mb-4" style={{ background: '#ef4444', color: 'white' }}>🚨 24/7 EMERGENCY</div>
          <h2 className="text-h2" style={{ color: '#991b1b', marginBottom: '16px' }}>Need an Ambulance Instantly?</h2>
          <p className="text-muted mb-6">ALS and BLS ambulances available at your location within 15 minutes.</p>
          <button className="btn" style={{ background: '#dc2626', color: 'white', fontSize: '18px', padding: '12px 32px', borderRadius: 'var(--radius-full)' }} onClick={() => go("/ambulance")}>
            Call 1066 Now
          </button>
        </div>
      </section>

      {/* ── App Download Banner ── */}
      <section className="container" style={{ padding: '40px 24px' }}>
        <div className="flex justify-between items-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex flex-col gap-4" style={{ maxWidth: '500px' }}>
            <h2 className="text-h2">Download the Arvaya App</h2>
            <p className="text-muted">Get exclusive offers, manage appointments, and access your health vault anytime, anywhere.</p>
            <div className="flex gap-4 mt-2">
              <div style={{ background: 'var(--text-main)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer' }}>App Store</div>
              <div style={{ background: 'var(--text-main)', color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer' }}>Google Play</div>
            </div>
          </div>
          <div style={{ width: '200px', height: '200px', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-muted text-center" style={{ padding: '20px' }}>App Mockup<br/>Image Here</span>
          </div>
        </div>
      </section>
    </main>
  );
}
