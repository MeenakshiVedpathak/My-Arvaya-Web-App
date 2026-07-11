import { useState, useEffect } from "react";
import {
  CalendarDays,
  Wallet,
  ArrowRight,
  PhoneCall,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import HealthAnalytics from "../components/analytics/HealthAnalytics";

export default function Home() {
  let go = useNavigate();
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
      
      {/* 1. Image Carousel Banner */}
      <section className="web-carousel">
        <button className="carousel-btn left" onClick={() => setCurrentSlide(s => s === 0 ? banners.length - 1 : s - 1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {banners.map((b, i) => (
            <div className="carousel-slide" key={i}>
              <div className="carousel-image">
                <img src={b.src} alt="Healthcare Banner" />
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

      {/* 2. Quick Actions Row */}
      <div className="pro-actions-row">
        <div className="pro-action-card" onClick={() => go("/doctors")}>
          <div className="pro-action-icon-large"><CalendarDays size={24} /></div>
          <span>Book Appointment</span>
        </div>
        <div className="pro-action-card" onClick={() => go("/wallet")}>
          <div className="pro-action-icon-large"><Wallet size={24} /></div>
          <span>Wallet History</span>
        </div>
        <div className="pro-action-card" onClick={() => go("/records")}>
          <div className="pro-action-icon-large"><FileText size={24} /></div>
          <span>Upload Record</span>
        </div>
        <div className="pro-action-card emergency" onClick={() => alert("Calling Emergency...")}>
          <div className="pro-action-icon-large"><PhoneCall size={24} /></div>
          <span>Emergency Assistance</span>
        </div>
      </div>

      {/* 3. Top Metrics Row */}
      <div className="pro-metrics-row">
        <div className="pro-metric-card">
          <div className="pro-metric-header">
            <span>Next Appointment</span>
            <CalendarDays size={18} color="#64748b" />
          </div>
          <div className="pro-metric-value">Oct 24, 10:30 AM</div>
          <div className="pro-metric-subtext">Dr. Sarah Jenkins • Cardiology</div>
        </div>
        <div className="pro-metric-card">
          <div className="pro-metric-header">
            <span>Wallet Balance</span>
            <Wallet size={18} color="#64748b" />
          </div>
          <div className="pro-metric-value">₹ 1,250</div>
          <div className="pro-metric-subtext text-green">+₹200 earned this month</div>
        </div>
        <div className="pro-metric-card">
          <div className="pro-metric-header">
            <span>ABHA Status</span>
            <img src="/abha.svg" alt="ABHA" style={{ width: 18, filter: 'grayscale(1) opacity(0.6)' }} />
          </div>
          <div className="pro-metric-value">Linked</div>
          <div className="pro-metric-subtext">Profile sync active</div>
        </div>
      </div>

      {/* 4. Main Data Area */}
      <div className="pro-dashboard-grid">
        <HealthAnalytics />
        <div className="pro-main-col">
          <div className="pro-card">
            <div className="pro-card-header">
              <h3>Recent Medical Records</h3>
              <button className="pro-btn-outline" onClick={() => go("/records")}>View All</button>
            </div>
            <div className="cr-list">
              <div className="cr-item verified">
                <div className="cr-left">
                  <div className="cr-icon"><FileText size={20} /></div>
                  <div className="cr-info">
                    <h4>Complete Blood Count (CBC)</h4>
                    <p>Apollo Diagnostics</p>
                  </div>
                </div>
                <div className="cr-right">
                  <div className="cr-meta">
                    <span className="cr-date">Oct 12, 2026</span>
                    <span className="pro-badge success">Verified</span>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1" />
                </div>
              </div>

              <div className="cr-item">
                <div className="cr-left">
                  <div className="cr-icon"><FileText size={20} /></div>
                  <div className="cr-info">
                    <h4>Cardiology Consultation</h4>
                    <p>Dr. Sarah Jenkins</p>
                  </div>
                </div>
                <div className="cr-right">
                  <div className="cr-meta">
                    <span className="cr-date">Sep 28, 2026</span>
                    <span className="pro-badge neutral">Stored</span>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1" />
                </div>
              </div>

              <div className="cr-item">
                <div className="cr-left">
                  <div className="cr-icon"><FileText size={20} /></div>
                  <div className="cr-info">
                    <h4>Prescription (Refill)</h4>
                    <p>City General Hospital</p>
                  </div>
                </div>
                <div className="cr-right">
                  <div className="cr-meta">
                    <span className="cr-date">Aug 15, 2026</span>
                    <span className="pro-badge neutral">Stored</span>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1" />
                </div>
              </div>

              <div className="cr-item verified">
                <div className="cr-left">
                  <div className="cr-icon"><FileText size={20} /></div>
                  <div className="cr-info">
                    <h4>Lipid Profile Test</h4>
                    <p>HealthCore Labs</p>
                  </div>
                </div>
                <div className="cr-right">
                  <div className="cr-meta">
                    <span className="cr-date">Jul 02, 2026</span>
                    <span className="pro-badge success">Verified</span>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1" />
                </div>
              </div>

              <div className="cr-item">
                <div className="cr-left">
                  <div className="cr-icon"><FileText size={20} /></div>
                  <div className="cr-info">
                    <h4>Dental X-Ray</h4>
                    <p>Smile Care Clinic</p>
                  </div>
                </div>
                <div className="cr-right">
                  <div className="cr-meta">
                    <span className="cr-date">Jun 18, 2026</span>
                    <span className="pro-badge neutral">Stored</span>
                  </div>
                  <ArrowRight size={20} color="#cbd5e1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
