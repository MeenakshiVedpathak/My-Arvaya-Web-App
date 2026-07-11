import { useState, useEffect } from "react";
import {
  CalendarDays,
  Wallet,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import HealthAnalytics from "../components/analytics/HealthAnalytics";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const go = useNavigate();
  const { user } = useAuth();
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
    <main className="container web-dashboard">
      
      {/* Concierge Greeting */}
      <div style={{ marginBottom: '48px', paddingTop: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', color: 'var(--blue)', margin: '0 0 16px', lineHeight: '1.1', fontWeight: '600' }}>
          Good morning, {user?.name ? user.name.split(' ')[0] : 'User'}.
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', margin: 0, maxWidth: '600px' }}>
          Welcome to your personal health concierge. How can we support your wellness journey today?
        </p>
      </div>

      {/* 2. Quick Actions Row (Moved up for immediate access) */}
      <div className="pro-actions-row">
        <div className="pro-action-card" onClick={() => go("/doctors")}>
          <div className="pro-action-icon-large"><CalendarDays size={28} /></div>
          <span>Book Visit</span>
        </div>
        <div className="pro-action-card" onClick={() => go("/labs")}>
          <div className="pro-action-icon-large"><FileText size={28} /></div>
          <span>Lab Tests</span>
        </div>
        <div className="pro-action-card" onClick={() => go("/wallet")}>
          <div className="pro-action-icon-large"><Wallet size={28} /></div>
          <span>Wallet</span>
        </div>
        <div className="pro-action-card emergency" onClick={() => alert("Calling Emergency...")}>
          <div className="pro-action-icon-large"><PhoneCall size={28} /></div>
          <span>Emergency</span>
        </div>
      </div>

      {/* 1. Image Carousel Banner (Now an elegant arch/pill shape) */}
      <section className="web-carousel" style={{ borderRadius: '64px', height: '400px' }}>
        <button className="carousel-btn left" onClick={() => setCurrentSlide(s => s === 0 ? banners.length - 1 : s - 1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {banners.map((b, i) => (
            <div className="carousel-slide" key={i}>
              <div className="carousel-image">
                <img src={b.src} alt="Healthcare Banner" style={{ filter: 'contrast(0.95) saturate(0.9)' }} />
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-btn right" onClick={() => setCurrentSlide(s => (s + 1) % banners.length)}>
          <ChevronRight size={24} />
        </button>
        <div className="carousel-dots">
          {banners.map((_, i) => (
            <div key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
      </section>

      {/* 3. Top Metrics Row */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--blue)', margin: '0 0 24px', fontWeight: '600' }}>Your Overview</h2>
      <div className="pro-metrics-row">
        <div className="pro-metric-card">
          <div className="pro-metric-header">
            <span>Next Appointment</span>
            <CalendarDays size={20} color="var(--primary)" />
          </div>
          <div className="pro-metric-value" style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginTop: '16px' }}>Oct 24</div>
          <div className="pro-metric-subtext">Dr. Sarah Jenkins • 10:30 AM</div>
        </div>
        <div className="pro-metric-card">
          <div className="pro-metric-header">
            <span>Wallet Balance</span>
            <Wallet size={20} color="var(--primary)" />
          </div>
          <div className="pro-metric-value" style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginTop: '16px' }}>₹ 1,250</div>
          <div className="pro-metric-subtext" style={{ color: 'var(--primary)' }}>+₹200 earned this month</div>
        </div>
        <div className="pro-metric-card">
          <div className="pro-metric-header">
            <span>ABHA Status</span>
            <img src="/abha.svg" alt="ABHA" style={{ width: 24, filter: 'grayscale(1) opacity(0.6)' }} />
          </div>
          <div className="pro-metric-value" style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginTop: '16px', color: 'var(--primary)' }}>Linked</div>
          <div className="pro-metric-subtext">14-digit ID active</div>
        </div>
      </div>

      {/* 4. Analytics Section */}
      <div style={{ marginTop: '64px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--blue)', margin: '0 0 24px', fontWeight: '600' }}>Health Insights</h2>
        <HealthAnalytics />
      </div>

    </main>
  );
}
