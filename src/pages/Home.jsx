import { ChevronRight, ChevronLeft, ArrowRight, Activity, Heart, Eye, Brain, Bone, Baby, ShieldCheck, Star, Pill, PhoneCall, Wallet, Gift, FileText, CreditCard, Search, Users, CalendarCheck, Stethoscope, Quote, Sparkles, MapPin, Building2, Navigation, TestTube, Clock, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { packages } from "../mocks/data";
import AmbulanceRequestModal from "../components/ambulance/AmbulanceRequestModal";
import { getBanners, getDiagnosticPackages, getPatientReviews } from "../services/dataService";
import { getImageUrl } from "../services/uploadService";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const go = useNavigate();
  const { user } = useAuth();
  const reviewsScrollRef = useRef(null);
  
  const scrollReviews = (dir) => {
    if (reviewsScrollRef.current) {
      const scrollAmount = reviewsScrollRef.current.clientWidth / 2;
      reviewsScrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [apiPackages, setApiPackages] = useState(packages.slice(0, 4));
  const [reviews, setReviews] = useState([
    { name: "Ananya Reddy", role: "Bangalore", text: "Booking an appointment was incredibly seamless. The doctor was available the same day and the consultation was thorough. Arvaya has become my go-to healthcare platform.", rating: 5 },
    { name: "Vikram Singh", role: "Mumbai", text: "The home sample collection for lab tests is a game-changer. The phlebotomist was on time, professional, and I got my reports within 24 hours. Highly recommended!", rating: 5 },
    { name: "Priya Nair", role: "Delhi", text: "Managing my family's health records in one place is so convenient. The ABHA integration makes sharing records with new doctors effortless. Love this platform!", rating: 5 },
  ]);

  useEffect(() => {
    let isMounted = true;
    getPatientReviews({ pageIndex: 0, pageSize: 0 })
      .then((apiReviews) => {
        if (!isMounted) return;
        if (Array.isArray(apiReviews) && apiReviews.length > 0) {
          const normalized = apiReviews.map(r => ({
            name: r.patient_name || "Patient",
            role: "Verified Patient",
            text: r.review || "",
            rating: r.ratings || 5
          }));
          setReviews(normalized);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/patientReview/get for Home:", err);
      });

    getDiagnosticPackages({ pageSize: 10 })
      .then((apiPkgs) => {
        if (!isMounted) return;
        if (Array.isArray(apiPkgs) && apiPkgs.length > 0) {
          const normalized = apiPkgs.map((p, idx) => {
            const rawTitle = p.package_name || p.name || p.title || `Health Package ${idx+1}`;
            const priceVal = parseFloat(p.package_price || p.price || p.cost || p.amount || 999);
            const oldPriceVal = Math.round(priceVal * 1.25);
            const itemCount = Array.isArray(p.subitems) && p.subitems.length > 0 
              ? `${p.subitems.length}+ Tests Included` 
              : "30+ Tests";

            return {
              id: p.rateplan_package_id || p.id || p.package_key || `api-pkg-${idx}`,
              title: rawTitle,
              tests: itemCount,
              price: `₹${priceVal}`,
              oldPrice: `₹${oldPriceVal}`,
              discount: `${Math.round(((oldPriceVal - priceVal) / oldPriceVal) * 100)}% OFF`,
              img: p.img || p.image || (idx % 2 === 0 ? "/checkup_fullbody.png" : "/checkup_heart.png"),
              trend: p.badge || (idx === 0 ? "Most Booked" : idx === 1 ? "Popular" : "Doctor Verified")
            };
          });
          setApiPackages(normalized.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /api/diagnostic/getPackages for Home:", err);
      });
      return () => { isMounted = false; };
  }, [user]);

  const heroSlides = [
    {
      badge: "✨ 15 MIN EMERGENCY RESPONSE",
      badgeColor: "#2dd4bf",
      badgeBorder: "rgba(45, 212, 191, 0.4)",
      badgeBg: "rgba(18, 51, 58, 0.7)",
      title: <>24/7 Smart ICU Emergency &<br/>Mobile Dispatch</>,
      subtitle: "Rapid emergency ambulance dispatch equipped with mobile life support and live tracking.",
      primaryBtn: "Request Ambulance",
      primaryAction: () => go('/ambulance'),
      bg: "/banner_healthcare_1.png"
    },
    {
      badge: "⭐ INDIA'S #1 HEALTHCARE PLATFORM",
      badgeColor: "#FDBF8B",
      badgeBorder: "rgba(253, 191, 139, 0.4)",
      badgeBg: "rgba(255, 255, 255, 0.1)",
      title: <>Consult Top Doctors &<br/><span style={{ color: '#FDBF8B' }}>Specialists Online</span></>,
      subtitle: "Instant video consultations with verified top doctors across 35+ medical specialties.",
      primaryBtn: "Find a Doctor",
      primaryAction: () => go('/doctors'),
      secondaryBtn: "Book Lab Test",
      secondaryAction: () => go('/labs'),
      bg: "/banner_healthcare_2.png"
    },
    {
      badge: "🔬 100% NABL ACCREDITED LABS",
      badgeColor: "#38bdf8",
      badgeBorder: "rgba(56, 189, 248, 0.4)",
      badgeBg: "rgba(15, 23, 42, 0.6)",
      title: <>Accurate Diagnostic Tests &<br/><span style={{ color: '#38bdf8' }}>Home Sample Collection</span></>,
      subtitle: "Sample collection at your doorstep with guaranteed digital reports within 24 hours.",
      primaryBtn: "Book Lab Package",
      primaryAction: () => go('/labs'),
      secondaryBtn: "View Health Vault",
      secondaryAction: () => go('/records'),
      bg: "/banner_healthcare_3.png"
    }
  ];

  const [dynamicSlides, setDynamicSlides] = useState(heroSlides);

  useEffect(() => {
    const fetchDynamicBanners = async () => {
      try {
        const res = await getBanners();
        const banners = res?.data || res || [];
        if (banners.length > 0) {
          const newSlides = banners.map((b, i) => {
            const baseSlide = heroSlides[i % heroSlides.length];
            const fullImgUrl = b.img_url ? getImageUrl(b.img_url, 'bannerImages') : "";
            return {
              ...baseSlide,
              bg: fullImgUrl || baseSlide.bg
            };
          });
          setDynamicSlides(newSlides);
        }
      } catch (e) {
        console.error("Error fetching banners:", e);
      }
    };
    fetchDynamicBanners();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dynamicSlides.length]);

  // Auto-scroll testimonials
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;
    
    const interval = setInterval(() => {
      if (reviewsScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = reviewsScrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const scrollAmount = clientWidth / 2;
        
        if (scrollLeft >= maxScroll - 10) {
          reviewsScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          reviewsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews]);

  const tickerText = "🎉 Avail flat 20% off on all Full Body Checkups this week!  •  🏥 24/7 Emergency Services now active in Bangalore, Mumbai, and Delhi  •  ⭐ Free consultation with our top specialists for ABHA card holders  •  ";

  return (
    <main className="page page-enter" style={{ padding: 0 }}>
      {/* ── Emergency & Ticker ── */}
      <div style={{ background: 'linear-gradient(90deg, #0d5c63, #2E666E)', color: 'white' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Emergency Call Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              🚨 Medical Emergency?
            </div>
            <button onClick={() => setShowAmbulanceModal(true)} className="btn" style={{ background: 'white', color: '#2E666E', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🚑 Call Ambulance
            </button>
            </div>
          {/* Ticker Row */}
          <div style={{ padding: '6px 0', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.3)', marginRight: '12px', whiteSpace: 'nowrap', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Updates</span>
            <div className="ticker-wrap">
              <span className="ticker-content">
                {tickerText}{tickerText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Carousel Banner ── */}
      <section className="home-hero-section" style={{ position: 'relative', width: '100%', minHeight: '480px', overflow: 'hidden' }}>
        {dynamicSlides.map((slide, idx) => (
          <div key={`${slide.bg}-${idx}`} style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              opacity: idx === currentSlide ? 1 : 0, 
              transition: 'opacity 1.2s ease-in-out',
              zIndex: idx === currentSlide ? 1 : 0
          }}>
            <img 
              src={slide.bg} 
              alt={`Banner ${idx + 1}`} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} 
            />
            {slide.title && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)' }}></div>}
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? dynamicSlides.length - 1 : prev - 1))}
          style={{
            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff',
            color: '#1e293b', border: '1px solid var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          aria-label="Previous Slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length)}
          style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
            width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff',
            color: '#1e293b', border: '1px solid var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          aria-label="Next Slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Overlay Content */}
        <div className="container" style={{ position: 'relative', height: '100%', minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, padding: '48px 24px', pointerEvents: 'none' }}>
          {dynamicSlides.map((slide, idx) => idx === currentSlide && (
            <div key={idx} className="animate-fade-in-up" style={{ maxWidth: '640px', pointerEvents: 'auto' }}>
              {slide.badge && (
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', 
                  background: slide.badgeBg, backdropFilter: 'blur(10px)', 
                  color: slide.badgeColor, padding: '8px 18px', borderRadius: '99px', 
                  fontSize: '12px', fontWeight: '700', marginBottom: '20px', 
                  border: `1px solid ${slide.badgeBorder}`, textTransform: 'uppercase', 
                  letterSpacing: '0.06em' 
                }}>
                  {slide.badge}
                </span>
              )}
              {slide.title && (
                <h1 className="hero-title" style={{ fontSize: '42px', fontWeight: '800', color: 'white', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <p className="hero-subtext" style={{ fontSize: '17px', color: 'rgba(255,255,255,0.85)', marginBottom: '32px', lineHeight: 1.6 }}>
                  {slide.subtitle}
                </p>
              )}
              
              {(slide.primaryBtn || slide.secondaryBtn) && (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Primary Orange CTA Button */}
                  {slide.primaryBtn && (
                    <button 
                      onClick={slide.primaryAction} 
                      style={{ 
                        padding: '14px 28px', fontSize: '15px', fontWeight: '700', 
                        color: '#ffffff', background: 'linear-gradient(135deg, #FF6B00 0%, #F97316 100%)', 
                        border: 'none', borderRadius: '14px', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)', transition: 'all 0.3s' 
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span>{slide.primaryBtn}</span> <ArrowRight size={16} />
                    </button>
                  )}

                {/* Secondary Outlined CTA Button */}
                {slide.secondaryBtn && (
                  <button 
                    onClick={slide.secondaryAction} 
                    style={{ 
                      padding: '14px 28px', fontSize: '15px', fontWeight: '700', 
                      color: '#ffffff', background: 'rgba(255, 255, 255, 0.08)', 
                      border: '1.5px solid rgba(255, 255, 255, 0.5)', borderRadius: '14px', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                      backdropFilter: 'blur(8px)', transition: 'all 0.3s' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.borderColor = '#ffffff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'; }}
                  >
                    {slide.secondaryBtn}
                  </button>
                )}
              </div>
            )}
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
          {dynamicSlides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: idx === currentSlide ? '28px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: idx === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Value Props ── */}
      <section style={{ background: 'var(--bg-surface)', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container value-props-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: <Star size={22} />, title: "4.9/5 Rating", sub: "From 1M+ Users", color: "var(--accent)" },
            { icon: <ShieldCheck size={22} />, title: "NABH Accredited", sub: "Quality Assured", color: "var(--success)" },
            { icon: <PhoneCall size={22} />, title: "24/7 Support", sub: "Always here for you", color: "var(--primary)" },
            { icon: <Pill size={22} />, title: "100% Genuine", sub: "Medicines & Tests", color: "var(--accent)" }
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-3" style={{ padding: '8px 0' }}>
              <div style={{ color: v.color }}>{v.icon}</div>
              <div className="flex flex-col">
                <b style={{ fontSize: '14px', color: 'var(--text-main)' }}>{v.title}</b>
                <span className="text-muted" style={{ fontSize: '12px' }}>{v.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Arvaya Ecosystem ── */}
      <div className="bg-mesh-primary" style={{ padding: '56px 0', borderBottom: '1px solid var(--border)' }}>
        <section className="container" style={{ padding: '0 24px' }}>
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
            { title: "ABHA Hub", sub: "Create & link your ABHA ID for seamless health data access", icon: <CreditCard size={28} strokeWidth={1.5} />, link: "/abha", color: "#2E666E", bg: "#E4EEEF" },
            { title: "Arvaya Rewards", sub: "Earn points on every booking and redeem exclusive offers", icon: <Gift size={28} strokeWidth={1.5} />, link: "/rewards", color: "#FB913F", bg: "#FEF0E2" },
            { title: "Digital Wallet", sub: "Fast, secure payments with instant refunds guaranteed", icon: <Wallet size={28} strokeWidth={1.5} />, link: "/wallet", color: "#3D7A83", bg: "#E4EEEF" },
            { title: "Health Records", sub: "Your complete medical history, encrypted and always accessible", icon: <FileText size={28} strokeWidth={1.5} />, link: "/records", color: "#1F4F57", bg: "#DCE9EB" },
          ].map((item, idx) => (
             <div key={item.title} className={`card-elevated hover-glow flex flex-col gap-4 cursor-pointer animate-fade-in-up`} style={{ padding: '28px', borderTop: `4px solid ${item.color}`, animationDelay: `${idx * 80}ms` }} onClick={() => go(item.link)}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <b style={{ fontSize: '17px', display: 'block', marginBottom: '6px', color: 'var(--text-main)' }}>{item.title}</b>
                <span className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5, display: 'block' }}>{item.sub}</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: item.color, fontSize: '14px', fontWeight: '700' }}>
                Explore <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
        </section>
      </div>

      {/* ── How It Works ── */}
      <section style={{ padding: '56px 0', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="text-h2" style={{ marginBottom: '8px' }}>How It Works</h2>
          <p className="text-muted mb-8" style={{ fontSize: '15px' }}>Book a doctor appointment in 3 simple steps</p>
          
          <div className="how-it-works-grid" style={{ position: 'relative' }}>
            {/* Connecting line */}
            <div className="how-it-works-line" style={{ position: 'absolute', top: '40px', left: '20%', right: '20%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
            
            {[
              { step: "1", icon: <Search size={28} />, title: "Search", desc: "Find specialists by name, specialty, or location" },
              { step: "2", icon: <CalendarCheck size={28} />, title: "Book", desc: "Pick a convenient slot and confirm instantly" },
              { step: "3", icon: <Stethoscope size={28} />, title: "Consult", desc: "Visit the clinic or join a video consultation" },
            ].map((s, i) => (
              <div key={s.step} className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, animationDelay: `${i * 150}ms` }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(46, 102, 110, 0.3)', border: '4px solid var(--bg-surface)' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>{s.title}</h3>
                <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.5, maxWidth: '220px', margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consult Top Specialties ── */}
      <section className="container" style={{ padding: '56px 24px' }}>
        <style>{`
          .specialties-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
          @media (max-width: 900px) { .specialties-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 600px) { .specialties-grid { grid-template-columns: repeat(2, 1fr); } }
        `}</style>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-h2">Consult Top Specialties</h2>
            <p className="text-muted mt-2">Consult with India's best specialists</p>
          </div>
          <button className="btn btn-secondary flex items-center gap-2" onClick={() => go("/doctors")}>View All <ArrowRight size={16} /></button>
        </div>
        
        <div className="specialties-grid">
          {[
            { name: "Cardiology", icon: <Heart size={28} strokeWidth={1.5} />, consults: "2.5k+" },
            { name: "Neurology", icon: <Brain size={28} strokeWidth={1.5} />, consults: "1.8k+" },
            { name: "Pediatrics", icon: <Baby size={28} strokeWidth={1.5} />, consults: "3.2k+" },
            { name: "Orthopedics", icon: <Bone size={28} strokeWidth={1.5} />, consults: "1.4k+" },
            { name: "General Medicine", icon: <Activity size={28} strokeWidth={1.5} />, consults: "5.1k+" },
            { name: "Dermatology", icon: <Eye size={28} strokeWidth={1.5} />, consults: "2.1k+" },
          ].map((spec, i) => (
            <div key={spec.name} className="card-elevated hover-glow flex flex-col items-center justify-center gap-3 cursor-pointer animate-scale-in" style={{ padding: '24px 16px', textAlign: 'center', animationDelay: `${i * 60}ms` }} onClick={() => go("/doctors")}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                {spec.icon}
              </div>
              <b style={{ fontSize: '14px', color: 'var(--text-main)' }}>{spec.name}</b>
              <span className="text-muted" style={{ fontSize: '12px' }}>{spec.consults} Consults</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Lab Packages ── */}
      <section style={{ padding: '0 0 56px 0' }}>
        <div className="container">
          <style>{`
            .packages-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            @media (max-width: 1024px) { .packages-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 600px) { .packages-grid { grid-template-columns: 1fr; } }
            
            .pkg-card {
              width: 100%;
              background: #ffffff;
              border-radius: 18px;
              border: 1px solid var(--border);
              overflow: hidden;
              display: flex;
              flex-direction: column;
              transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
              box-shadow: 0 2px 8px rgba(18, 51, 58, 0.04);
              position: relative;
            }
            .pkg-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 28px rgba(18, 51, 58, 0.1);
              border-color: var(--primary-soft);
            }
            .pkg-card-img-container {
              height: 135px;
              width: 100%;
              background: #f0f7f7;
              overflow: hidden;
              position: relative;
            }
            .pkg-card-badge {
              position: absolute;
              top: 10px;
              left: 10px;
              background: var(--primary);
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
            .pkg-card-body {
              padding: 16px;
              display: flex;
              flex-direction: column;
              flex: 1;
            }
            .pkg-card-title {
              font-weight: 800;
              font-size: 15px;
              line-height: 1.3;
              color: var(--text-main);
              margin-bottom: 6px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              min-height: 40px;
            }
            .pkg-card-tests-badge {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 600;
              color: #16a34a;
              background: #dcfce7;
              padding: 3px 8px;
              border-radius: 6px;
              width: fit-content;
              margin-bottom: 12px;
            }
            .pkg-card-btn {
              width: 100%;
              background: #1b4d54;
              color: #ffffff;
              border: none;
              padding: 10px 14px;
              border-radius: 20px;
              font-size: 12.5px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              cursor: pointer;
              transition: background 0.2s, transform 0.15s;
            }
            .pkg-card-btn:hover {
              background: var(--primary);
            }
            .lab-card-price-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: auto;
              padding-top: 12px;
              border-top: 1px dashed var(--border);
              gap: 6px;
              margin-bottom: 16px;
            }
            .lab-card-price {
              font-weight: 800;
              font-size: 18px;
              color: #12333A;
              line-height: 1.1;
            }
            .lab-card-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s;
            }
            .pkg-card:hover .lab-card-img {
              transform: scale(1.05);
            }
          `}</style>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-h2">Featured Health Packages</h2>
              <p className="text-muted mt-2">Comprehensive checkups with home sample collection</p>
            </div>
            <button className="btn btn-secondary flex items-center gap-2" onClick={() => go("/labs")}>View All <ArrowRight size={16} /></button>
          </div>
          
          <div className="packages-grid">
            {apiPackages.map((pkg, idx) => (
              <div className="pkg-card animate-fade-in-up" key={pkg.id || pkg.title} style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="pkg-card-img-container">
                  <img src={pkg.img} alt={pkg.title} className="lab-card-img" />
                  {pkg.trend && <div className="pkg-card-badge">{pkg.trend}</div>}
                </div>
                <div className="pkg-card-body">
                  <div className="pkg-card-title">{pkg.title}</div>
                  <div className="pkg-card-tests-badge">
                    <ShieldCheck size={12} /> {pkg.tests}
                  </div>
                  <div className="lab-card-price-row">
                    <span className="lab-card-price">{pkg.price}</span>
                  </div>
                  <button className="pkg-card-btn" onClick={() => go(`/labs/package-details/${encodeURIComponent(pkg.id || pkg.title)}`, { state: { package: pkg } })}>
                    View Details <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '56px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="text-h2">What Our Patients Say</h2>
            <p className="text-muted mt-2" style={{ fontSize: '15px' }}>Join 1 million+ happy patients across India</p>
          </div>

          <style>{`
            .testimonials-slider { 
              display: flex; 
              overflow-x: auto; 
              scroll-snap-type: x mandatory; 
              gap: 24px; 
              padding-bottom: 20px;
              scrollbar-width: none;
            }
            .testimonials-slider::-webkit-scrollbar { display: none; }
            .testimonial-card-wrap {
              flex: 0 0 calc(33.333% - 16px);
              scroll-snap-align: start;
            }
            @media (max-width: 1024px) { .testimonial-card-wrap { flex: 0 0 calc(50% - 12px); } }
            @media (max-width: 768px) { .testimonial-card-wrap { flex: 0 0 100%; } }
            .review-nav-btn {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 44px; height: 44px; border-radius: 50%; background: #ffffff;
              color: #1e293b; border: 1px solid var(--border); display: flex;
              align-items: center; justify-content: center; cursor: pointer; z-index: 20;
              box-shadow: 0 4px 16px rgba(0,0,0,0.1); transition: all 0.2s;
            }
            .review-nav-btn:hover {
              background: var(--primary); color: white; border-color: var(--primary);
            }
            .review-nav-btn.left { left: -20px; }
            .review-nav-btn.right { right: -20px; }
            @media (max-width: 1024px) {
              .review-nav-btn { display: none; }
            }
          `}</style>
          
          <div style={{ position: 'relative' }}>
            <button className="review-nav-btn left" onClick={() => scrollReviews('left')}>
              <ChevronLeft size={20} />
            </button>
            <button className="review-nav-btn right" onClick={() => scrollReviews('right')}>
              <ChevronRight size={20} />
            </button>
            
            <div className="testimonials-slider" ref={reviewsScrollRef}>
              {reviews.map((t, i) => (
                <div key={i} className="testimonial-card-wrap">
                  <div className="card-elevated animate-fade-in-up" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', animationDelay: `${(i % 3) * 100}ms` }}>
                    <Quote size={24} style={{ color: 'var(--primary-soft)', transform: 'scaleX(-1)' }} />
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.7, flex: 1 }}>"{t.text}"</p>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-soft))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--primary-dark)', fontSize: '14px' }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <b style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>{t.name}</b>
                        <span className="text-muted" style={{ fontSize: '12px' }}>{t.role}</span>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                        {Array(t.rating).fill(null).map((_, si) => (
                          <Star key={si} size={14} fill="#FBBF24" color="#FBBF24" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── App Download CTA ── */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="animate-fade-in-up home-cta-card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 'var(--radius-xl)', padding: '44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px rgba(46, 102, 110, 0.25)', position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: '32px' }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-60%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-40%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(251,145,63,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>📱 Available on iOS & Android</span>
              <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '12px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Get the Arvaya App</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>Book appointments, manage health records, order medicines, and earn rewards — all from your pocket.</p>
              <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                <button className="btn" style={{ padding: '14px 28px', background: 'white', color: 'var(--primary-dark)', fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  🍎 App Store
                </button>
                <button className="btn" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                  ▶️ Google Play
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { num: "1M+", label: "Downloads" },
                { num: "4.9★", label: "App Rating" },
                { num: "50K+", label: "Daily Users" }
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <b style={{ display: 'block', fontSize: '28px', color: 'white', lineHeight: 1 }}>{s.num}</b>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded CSS for Home Responsiveness */}
      <style>{`
        .how-it-works-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
          max-width: 800px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .home-hero-section {
            min-height: 420px !important;
          }
          .hero-title {
            font-size: 32px !important;
          }
          .hero-subtext {
            font-size: 15px !important;
          }
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .how-it-works-line {
            display: none !important;
          }
          .home-cta-card {
            padding: 28px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 26px !important;
          }
        }
      `}</style>

      {showAmbulanceModal && (
        <AmbulanceRequestModal onClose={() => setShowAmbulanceModal(false)} />
      )}
    </main>

  );
}
