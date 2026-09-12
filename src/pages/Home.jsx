import { 
  ChevronRight, ChevronLeft, ArrowRight, Activity, Heart, Eye, Brain, Bone, Baby, 
  ShieldCheck, Star, Pill, PhoneCall, Wallet, Gift, FileText, CreditCard, Search, 
  Users, CalendarCheck, Stethoscope, Quote, Sparkles, MapPin, Building2, Navigation, 
  TestTube, Clock, Flame, Check, ExternalLink, Download, Phone, MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AmbulanceRequestModal from "../components/ambulance/AmbulanceRequestModal";
import { downloadBannerAsset, getBanners, getDiagnosticPackages, getPatientReviews } from "../services/dataService";
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

  const defaultHomePackages = [
    {
      id: "ortho-robotics",
      title: "Ortho Robotics Package",
      tests: "97% Tests Included",
      price: "₹197380",
      img: "/checkup_fullbody.png",
      trend: "Doctor Verified"
    },
    {
      id: "paediatric-surgery",
      title: "Paediatric Surgery - 3A,51&71A3",
      tests: "91% Tests Included",
      price: "₹40000",
      img: "/checkup_heart.png",
      trend: "Popular"
    },
    {
      id: "orthopedics-29a",
      title: "Orthopedics - 28.58.00029A",
      tests: "91% Tests Included",
      price: "₹40000",
      img: "/checkup_fullbody.png",
      trend: "Doctor Verified"
    },
    {
      id: "orthopedics-90",
      title: "Orthopedics - 28.55.00090",
      tests: "85% Tests Included",
      price: "₹50000",
      img: "/checkup_heart.png",
      trend: "Recommended for Women"
    }
  ];

  const [apiPackages, setApiPackages] = useState(defaultHomePackages);

  const defaultReviews = [
    { name: "Mr. Rohit Ch", role: "Verified Patient", text: "Testing", rating: 5 },
    { name: "Mrs. Geethanjali D", role: "Verified Patient", text: "Gnh", rating: 5 },
    { name: "Mrs. Geethanjali D", role: "Verified Patient", text: "Gca1", rating: 5 },
  ];

  const [reviews, setReviews] = useState(defaultReviews);

  useEffect(() => {
    let isMounted = true;
    getPatientReviews({ pageIndex: 0, pageSize: 0 })
      .then((apiReviews) => {
        if (!isMounted) return;
        if (Array.isArray(apiReviews) && apiReviews.length > 0) {
          const normalized = apiReviews.map(r => ({
            name: r.patient_name || r.name || "Verified Patient",
            role: r.city || r.location || "Verified Patient",
            text: r.review || r.text || "",
            rating: r.ratings || r.rating || 5
          }));
          setReviews(normalized);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch patient reviews:", err);
      });

    getDiagnosticPackages({ pageSize: 4 })
      .then((apiPkgs) => {
        if (!isMounted) return;
        if (Array.isArray(apiPkgs) && apiPkgs.length > 0) {
          const normalized = apiPkgs.slice(0, 4).map((p, idx) => {
            const rawTitle = p.package_name || p.name || p.title || `Health Package ${idx+1}`;
            const priceVal = parseFloat(p.package_price || p.price || p.cost || p.amount || 999);

            const defaultBadges = [
              "Doctor Verified",
              "Popular",
              "Doctor Verified",
              "Recommended for Women"
            ];

            return {
              id: p.rateplan_package_id || p.id || p.package_key || `api-pkg-${idx}`,
              title: rawTitle,
              tests: p.subitems ? `${p.subitems.length}% Tests Included` : "91% Tests Included",
              price: `₹${priceVal}`,
              img: p.img || p.image || (idx % 2 === 0 ? "/checkup_fullbody.png" : "/checkup_heart.png"),
              trend: p.badge || defaultBadges[idx % defaultBadges.length]
            };
          });
          setApiPackages(normalized.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch packages:", err);
      });
      return () => { isMounted = false; };
  }, [user]);

  const heroSlides = [
    {
      badge: "⚡ 5 MIN EMERGENCY RESPONSE",
      title: <>24/7 Smart ICU Emergency &<br/><span style={{ color: '#00A896' }}>Mobile Dispatch</span></>,
      subtitle: "Rapid emergency ambulance dispatch equipped with mobile life support and live tracking.",
      primaryBtn: "Request Ambulance",
      primaryAction: () => go('/ambulance'),
      secondaryBtn: "Book Consultation",
      secondaryAction: () => go('/doctors'),
      bg: "/banner_healthcare_1.png"
    },
    {
      badge: "⭐ INDIA'S #1 HEALTHCARE PLATFORM",
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
      title: <>Accurate Diagnostic Tests &<br/><span style={{ color: '#38bdf8' }}>Home Sample Collection</span></>,
      subtitle: "Sample collection at your doorstep with guaranteed digital reports within 24 hours.",
      primaryBtn: "Book Lab Package",
      primaryAction: () => go('/labs'),
      secondaryBtn: "View Health Records",
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
        if (Array.isArray(banners) && banners.length > 0) {
          const newSlides = await Promise.all(banners.map(async (b, i) => {
            const baseSlide = heroSlides[i % heroSlides.length];
            const filename = b.filename || b.file_name || b.image || b.image_name || b.img_url;
            const asset = await downloadBannerAsset(filename);
            return {
              ...baseSlide,
              bg: asset?.url || baseSlide.bg,
              mimeType: asset?.mimeType || "image/*"
            };
          }));
          setDynamicSlides(newSlides);
          setCurrentSlide(0);
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
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews]);

  const tickerText = "24/7 Full Body Checkup this week!  •  Emergency Services now active in Bangalore, Mumbai, and Delhi...  •  Free consultation on  •  ";

  return (
    <main className="page page-enter" style={{ padding: 0, background: '#FAFAFB', fontFamily: "Inter, system-ui, sans-serif", color: '#1e293b' }}>
      
      {/* ── Top Emergency & Ticker Bar ── */}
      <div style={{ background: '#0D383F', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap' }}>
          
          {/* Emergency Call Pill */}
          <button 
            onClick={() => setShowAmbulanceModal(true)} 
            style={{ 
              background: '#EF4444', color: 'white', padding: '6px 14px', fontSize: '12px', 
              fontWeight: '700', borderRadius: '99px', border: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '13px' }}>🚨</span> Medical Emergency? Call Ambulance
          </button>

          {/* Ticker Row */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden', fontSize: '12.5px' }}>
            <span style={{ 
              fontWeight: '800', background: '#134E58', color: '#6EE7B7', padding: '3px 9px', 
              borderRadius: '4px', marginRight: '12px', fontSize: '10.5px', textTransform: 'uppercase', 
              letterSpacing: '0.05em', whiteSpace: 'nowrap' 
            }}>
              UPDATES
            </span>
            <div className="ticker-wrap" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
              <span className="ticker-content" style={{ display: 'inline-block', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                {tickerText}{tickerText}
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <a href="tel:18001234567" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', textDecoration: 'none', fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <Phone size={14} style={{ color: '#34D399' }} /> 1800 123 4567
          </a>
        </div>
      </div>

      {/* ── Main Container Outer Wrapper ── */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '20px 16px 40px 16px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* ── Hero Carousel Banner Card ── */}
        <section style={{ position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(13, 56, 63, 0.08)', minHeight: '440px', background: '#0F172A' }}>
          
          {dynamicSlides.map((slide, idx) => (
            <div key={`${slide.bg}-${idx}`} style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: idx === currentSlide ? 1 : 0, 
                transition: 'opacity 1s ease-in-out',
                zIndex: idx === currentSlide ? 1 : 0
            }}>
              {slide.mimeType?.startsWith('video/') ? (
                <video
                  src={slide.bg}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={`Banner ${idx + 1}`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right', display: 'block' }}
                />
              ) : (
                <img
                  src={slide.bg}
                  alt={`Banner ${idx + 1}`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right', display: 'block' }}
                />
              )}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.65) 45%, rgba(15, 23, 42, 0.15) 100%)' 
              }}></div>
            </div>
          ))}

          {/* Nav Arrows */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? dynamicSlides.length - 1 : prev - 1))}
            style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
              backdropFilter: 'blur(8px)', transition: 'all 0.2s'
            }}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length)}
            style={{
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
              backdropFilter: 'blur(8px)', transition: 'all 0.2s'
            }}
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Hero Slide Overlay Content */}
          <div style={{ position: 'relative', height: '100%', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, padding: '48px 56px' }}>
            {dynamicSlides.map((slide, idx) => idx === currentSlide && (
              <div key={idx} className="animate-fade-in-up" style={{ maxWidth: '560px' }}>
                {slide.badge && (
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', 
                    color: '#FDBF8B', padding: '6px 14px', borderRadius: '99px', 
                    fontSize: '11px', fontWeight: '700', marginBottom: '20px', 
                    border: '1px solid rgba(253, 191, 139, 0.3)', textTransform: 'uppercase', 
                    letterSpacing: '0.06em' 
                  }}>
                    {slide.badge}
                  </span>
                )}
                {slide.title && (
                  <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', marginBottom: '28px', lineHeight: 1.6 }}>
                    {slide.subtitle}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {slide.primaryBtn && (
                    <button 
                      onClick={slide.primaryAction} 
                      style={{ 
                        padding: '12px 26px', fontSize: '14px', fontWeight: '700', 
                        color: '#ffffff', background: 'linear-gradient(135deg, #FF6B00 0%, #F97316 100%)', 
                        border: 'none', borderRadius: '12px', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4)', transition: 'transform 0.2s' 
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span>{slide.primaryBtn}</span> <ArrowRight size={16} />
                    </button>
                  )}

                  {slide.secondaryBtn && (
                    <button 
                      onClick={slide.secondaryAction} 
                      style={{ 
                        padding: '12px 24px', fontSize: '14px', fontWeight: '700', 
                        color: '#ffffff', background: 'rgba(255, 255, 255, 0.12)', 
                        border: '1.5px solid rgba(255, 255, 255, 0.35)', borderRadius: '12px', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                        backdropFilter: 'blur(8px)', transition: 'all 0.2s' 
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                    >
                      {slide.secondaryBtn}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Centered Dots Indicator */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
            {dynamicSlides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentSlide ? '#FF6B00' : 'rgba(255, 255, 255, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </section>

        {/* ── Value Props Row ── */}
        <section style={{ 
          background: '#ffffff', padding: '16px 28px', borderRadius: '18px', 
          border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>
            {[
              { icon: <Star size={20} style={{ color: '#F59E0B' }} />, title: "4.9/5 Rating", sub: "From 1M+ Users", bg: "#FEF3C7" },
              { icon: <ShieldCheck size={20} style={{ color: '#10B981' }} />, title: "NABH Accredited", sub: "Quality Assured", bg: "#D1FAE5" },
              { icon: <PhoneCall size={20} style={{ color: '#6366F1' }} />, title: "24/7 Support", sub: "Always here for you", bg: "#E0E7FF" },
              { icon: <Pill size={20} style={{ color: '#0D9488' }} />, title: "100% Genuine", sub: "Medicines & Tests", bg: "#CCFBF1" }
            ].map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '42px', height: '42px', borderRadius: '50%', background: v.bg, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                }}>
                  {v.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: '13.5px', color: '#0F172A', fontWeight: '700' }}>{v.title}</b>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>{v.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── Your Health Ecosystem ── */}
      <div style={{ 
        width: '100%', 
        background: 'linear-gradient(135deg, #CFE8E3 0%, #BFE0D9 50%, #B2D8D0 100%)', 
        padding: '64px 0', 
        borderTop: '1px solid rgba(13, 92, 99, 0.1)', 
        borderBottom: '1px solid rgba(13, 92, 99, 0.1)',
        margin: '16px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Ambient Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(45,212,191,0.25) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0F2930', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Your Health Ecosystem
            </h2>
            <p style={{ fontSize: '15px', color: '#2E555C', lineHeight: 1.6 }}>
              Everything you need to manage your health, payments, and rewards—all in one place.
            </p>
          </div>

          {/* Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            
            {/* Card 1: ABHA Hub */}
            <div 
              onClick={() => go("/abha")}
              style={{ 
                background: 'rgba(255, 255, 255, 0.75)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '24px', 
                padding: '28px', 
                border: '1.5px solid rgba(255, 255, 255, 0.9)', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '20px', 
                boxShadow: '0 10px 30px rgba(13, 92, 99, 0.08)', 
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 36px rgba(13, 92, 99, 0.16)';
                e.currentTarget.style.borderColor = '#0D9488';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(13, 92, 99, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              <div>
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '16px', 
                  background: 'rgba(13, 148, 136, 0.14)', color: '#0D9488', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' 
                }}>
                  <CreditCard size={26} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  ABHA Hub
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                  Create & link your ABHA ID for seamless, instant health data access across providers.
                </p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px', 
                  background: 'rgba(13, 148, 136, 0.15)', color: '#0F766E', 
                  padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '700' 
                }}>
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 2: Arvaya Rewards (FEATURED CARD) */}
            <div 
              onClick={() => go("/rewards")}
              style={{ 
                background: 'linear-gradient(145deg, rgba(255, 253, 245, 0.95) 0%, rgba(254, 243, 199, 0.9) 100%)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '24px', 
                padding: '28px', 
                border: '2px solid #FBBF24', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '20px', 
                boxShadow: '0 12px 32px rgba(245, 158, 11, 0.22)', 
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.32)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.22)';
              }}
            >
              {/* Featured Badge */}
              <span style={{ 
                position: 'absolute', top: 0, right: 0, 
                background: 'linear-gradient(135deg, #D97706, #B45309)', 
                color: '#ffffff', fontSize: '10px', fontWeight: '800', 
                letterSpacing: '0.08em', padding: '5px 14px', 
                borderRadius: '0 22px 0 12px', textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(180, 83, 9, 0.3)' 
              }}>
                FEATURED
              </span>

              <div>
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', color: '#ffffff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                  boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)' 
                }}>
                  <Gift size={26} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#78350F', marginBottom: '8px' }}>
                  Arvaya Rewards
                </h3>
                <p style={{ fontSize: '13.5px', color: '#92400E', lineHeight: 1.6 }}>
                  Earn points on every booking and redeem exclusive health & wellness offers.
                </p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px', 
                  background: 'linear-gradient(135deg, #FF6B00, #F97316)', color: '#ffffff', 
                  padding: '8px 20px', borderRadius: '99px', fontSize: '13px', fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)' 
                }}>
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 3: Digital Wallet */}
            <div 
              onClick={() => go("/wallet")}
              style={{ 
                background: 'rgba(255, 255, 255, 0.75)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '24px', 
                padding: '28px', 
                border: '1.5px solid rgba(255, 255, 255, 0.9)', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '20px', 
                boxShadow: '0 10px 30px rgba(13, 92, 99, 0.08)', 
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 36px rgba(13, 92, 99, 0.16)';
                e.currentTarget.style.borderColor = '#0D9488';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(13, 92, 99, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              <div>
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '16px', 
                  background: 'rgba(13, 148, 136, 0.14)', color: '#0D9488', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' 
                }}>
                  <Wallet size={26} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Digital Wallet
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                  Fast, secure payments with instant refunds guaranteed on cancellations.
                </p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px', 
                  background: 'rgba(13, 148, 136, 0.15)', color: '#0F766E', 
                  padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '700' 
                }}>
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* Card 4: Health Records */}
            <div 
              onClick={() => go("/records")}
              style={{ 
                background: 'rgba(255, 255, 255, 0.75)', 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '24px', 
                padding: '28px', 
                border: '1.5px solid rgba(255, 255, 255, 0.9)', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '20px', 
                boxShadow: '0 10px 30px rgba(13, 92, 99, 0.08)', 
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 36px rgba(13, 92, 99, 0.16)';
                e.currentTarget.style.borderColor = '#0D9488';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(13, 92, 99, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              {/* Encrypted Top Right Badge */}
              <span style={{ 
                position: 'absolute', top: 0, right: 0, 
                background: 'linear-gradient(135deg, #10B981, #059669)', 
                color: '#ffffff', fontSize: '10px', fontWeight: '800', 
                letterSpacing: '0.08em', padding: '5px 14px', 
                borderRadius: '0 22px 0 12px', textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' 
              }}>
                ENCRYPTED
              </span>

              <div>
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '16px', 
                  background: 'rgba(13, 148, 136, 0.14)', color: '#0D9488', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' 
                }}>
                  <FileText size={26} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Health Records
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                  Your complete medical history, fully encrypted and accessible anytime.
                </p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px', 
                  background: 'rgba(13, 148, 136, 0.15)', color: '#0F766E', 
                  padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '700' 
                }}>
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>

          </div>
        </section>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '20px 16px 40px 16px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── How It Works Section (Exact White Card UI with Bottom Corner Mint Wave Overlays as Provided Image) ── */}
        <section style={{ 
          position: 'relative',
          width: '100%',
          borderRadius: '24px',
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          padding: '44px 32px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden'
        }}>
          {/* Bottom-Left Soft Mint/Cyan Wave Overlay */}
          <svg 
            style={{ position: 'absolute', left: 0, bottom: 0, width: '220px', height: '180px', pointerEvents: 'none', zIndex: 1 }} 
            viewBox="0 0 220 180" 
            fill="none"
          >
            <path d="M0,180 L0,70 Q60,60 120,120 Q160,160 220,180 Z" fill="rgba(207, 240, 233, 0.6)" />
            <path d="M0,180 L0,100 Q80,100 140,155 Q170,170 220,180 Z" fill="rgba(167, 243, 208, 0.45)" />
            <path d="M0,180 L0,130 Q70,130 130,170 Q160,175 220,180 Z" fill="rgba(45, 212, 191, 0.3)" />
          </svg>

          {/* Bottom-Right Soft Mint/Cyan Wave Overlay */}
          <svg 
            style={{ position: 'absolute', right: 0, bottom: 0, width: '220px', height: '180px', pointerEvents: 'none', zIndex: 1 }} 
            viewBox="0 0 220 180" 
            fill="none"
          >
            <path d="M220,180 L220,70 Q160,60 100,120 Q60,160 0,180 Z" fill="rgba(207, 240, 233, 0.6)" />
            <path d="M220,180 L220,100 Q140,100 80,155 Q50,170 0,180 Z" fill="rgba(167, 243, 208, 0.45)" />
            <path d="M220,180 L220,130 Q150,130 90,170 Q60,175 0,180 Z" fill="rgba(45, 212, 191, 0.3)" />
          </svg>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0F2930', marginBottom: '6px', letterSpacing: '-0.01em' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '14.5px', color: '#64748B', marginBottom: '44px' }}>
              Book a doctor appointment in 3 simple steps.
            </p>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '860px', margin: '0 auto' }}>
              
              {/* Connecting Arrow Line 1 (between step 1 and step 2) */}
              <div style={{ 
                position: 'absolute', top: '36px', left: '25%', width: '18%', height: '1px', 
                background: '#CBD5E1', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' 
              }}>
                <span style={{ color: '#38BDF8', fontSize: '10px', transform: 'translateX(3px)' }}>➤</span>
              </div>

              {/* Connecting Arrow Line 2 (between step 2 and step 3) */}
              <div style={{ 
                position: 'absolute', top: '36px', left: '58%', width: '18%', height: '1px', 
                background: '#CBD5E1', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' 
              }}>
                <span style={{ color: '#38BDF8', fontSize: '10px', transform: 'translateX(3px)' }}>➤</span>
              </div>
              
              {[
                { icon: <Search size={26} />, title: "Search", desc: "Find specialists by name, specialty, or location", bg: "linear-gradient(135deg, #00A896 0%, #0F766E 100%)" },
                { icon: <CalendarCheck size={26} />, title: "Book", desc: "Pick a convenient slot and confirm instantly", bg: "linear-gradient(135deg, #0D5C63 0%, #064E54 100%)" },
                { icon: <Stethoscope size={26} />, title: "Consult", desc: "Visit the clinic or join a video consultation", bg: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" },
              ].map((s) => (
                <div key={s.title} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '72px', height: '72px', borderRadius: '50%', background: s.bg, 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '4px solid #ffffff' 
                  }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>{s.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, maxWidth: '220px' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Consult Top Specialties ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Consult Top Specialties
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B' }}>Consult with India's best specialists</p>
            </div>
            <button 
              onClick={() => go("/doctors")}
              style={{ 
                background: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '99px', 
                padding: '8px 18px', fontSize: '13px', fontWeight: '700', color: '#0F172A', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)' 
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { name: "Cardiology", icon: <Heart size={24} />, consults: "2.5k+ Consults", bg: "#E6F4F1", color: "#0F766E" },
              { name: "Neurology", icon: <Brain size={24} />, consults: "1.8k+ Consults", bg: "#EEF2FF", color: "#4F46E5" },
              { name: "Pediatrics", icon: <Baby size={24} />, consults: "3.2k+ Consults", bg: "#FFF7ED", color: "#EA580C" },
              { name: "Orthopedics", icon: <Bone size={24} />, consults: "1.4k+ Consults", bg: "#F0F9FF", color: "#0284C7" },
              { name: "General Medicine", icon: <Activity size={24} />, consults: "5.1k+ Consults", bg: "#CCFBF1", color: "#0D9488" },
              { name: "Dermatology", icon: <Eye size={24} />, consults: "2.1k+ Consults", bg: "#FDF2F8", color: "#DB2777" },
            ].map((spec) => (
              <div 
                key={spec.name} 
                onClick={() => go("/doctors")}
                style={{ 
                  background: '#ffffff', borderRadius: '16px', padding: '20px 14px', 
                  border: '1px solid #E2E8F0', cursor: 'pointer', textAlign: 'center', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
                  transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '50%', background: spec.bg, 
                  color: spec.color, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {spec.icon}
                </div>
                <div>
                  <b style={{ fontSize: '14px', color: '#0F172A', display: 'block', fontWeight: '700' }}>{spec.name}</b>
                  <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', display: 'block' }}>{spec.consults}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Health Packages (Display Exactly 4 Records) ── */}
        <section style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Featured Health Packages
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B' }}>Comprehensive checkups with home sample collection</p>
            </div>
            <button 
              onClick={() => go("/labs")}
              style={{ 
                background: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '99px', 
                padding: '8px 18px', fontSize: '13px', fontWeight: '700', color: '#0F172A', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)' 
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            {/* Left Navigation Arrow */}
            <button 
              aria-label="Previous Packages"
              style={{ 
                position: 'absolute', top: '50%', left: '-18px', transform: 'translateY(-50%)',
                width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff',
                color: '#0F172A', border: '1px solid #CBD5E1', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0F766E';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#0F766E';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
            >
              <ChevronLeft size={22} />
            </button>

            {/* Right Navigation Arrow */}
            <button 
              aria-label="Next Packages"
              style={{ 
                position: 'absolute', top: '50%', right: '-18px', transform: 'translateY(-50%)',
                width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff',
                color: '#0F172A', border: '1px solid #CBD5E1', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)', transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0F766E';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#0F766E';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
            >
              <ChevronRight size={22} />
            </button>

            {/* Cards Grid Container - FIXED EXACTLY 4 CARDS */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '20px'
              }}
            >
              {apiPackages.slice(0, 4).map((pkg) => (
                <div 
                  key={pkg.id || pkg.title}
                  style={{ 
                    background: '#ffffff', borderRadius: '18px', border: '1px solid #E2E8F0', 
                    overflow: 'hidden', display: 'flex', flexDirection: 'column', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'all 0.25s' 
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Image Container */}
                  <div style={{ position: 'relative', height: '140px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <img src={pkg.img} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {pkg.trend && (
                      <span style={{ 
                        position: 'absolute', top: '10px', left: '10px', 
                        background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', 
                        fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', 
                        borderRadius: '8px', backdropFilter: 'blur(4px)' 
                      }}>
                        {pkg.trend}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <b style={{ fontSize: '16px', color: '#0F172A', fontWeight: '800', lineHeight: 1.3, marginBottom: '8px' }}>
                      {pkg.title}
                    </b>

                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px', 
                      background: '#DCFCE7', color: '#15803D', fontSize: '11px', 
                      fontWeight: '700', padding: '3px 8px', borderRadius: '6px', 
                      width: 'fit-content', marginBottom: '16px' 
                    }}>
                      <ShieldCheck size={13} /> {pkg.tests}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed #E2E8F0', marginBottom: '16px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '700', display: 'block' }}>
                        STARTING AT
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                        {pkg.price}
                      </span>
                    </div>

                    <button 
                      onClick={() => go(`/labs/package-details/${encodeURIComponent(pkg.id || pkg.title)}`, { state: { package: pkg } })}
                      style={{ 
                        width: '100%', background: '#0D5C63', color: '#ffffff', 
                        border: 'none', padding: '10px 16px', borderRadius: '10px', 
                        fontSize: '13px', fontWeight: '700', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', gap: '6px', 
                        cursor: 'pointer', transition: 'background 0.2s' 
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0F766E'}
                      onMouseLeave={e => e.currentTarget.style.background = '#0D5C63'}
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Our Patients Say (Exact Same White Card UI & Bottom Corner Mint Wave Overlays as How It Works) ── */}
        <section style={{ 
          position: 'relative',
          width: '100%',
          borderRadius: '24px',
          background: '#ffffff', 
          padding: '44px 32px', 
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden'
        }}>
          {/* Bottom-Left Soft Mint/Cyan Wave Overlay */}
          <svg 
            style={{ position: 'absolute', left: 0, bottom: 0, width: '220px', height: '180px', pointerEvents: 'none', zIndex: 1 }} 
            viewBox="0 0 220 180" 
            fill="none"
          >
            <path d="M0,180 L0,70 Q60,60 120,120 Q160,160 220,180 Z" fill="rgba(207, 240, 233, 0.6)" />
            <path d="M0,180 L0,100 Q80,100 140,155 Q170,170 220,180 Z" fill="rgba(167, 243, 208, 0.45)" />
            <path d="M0,180 L0,130 Q70,130 130,170 Q160,175 220,180 Z" fill="rgba(45, 212, 191, 0.3)" />
          </svg>

          {/* Bottom-Right Soft Mint/Cyan Wave Overlay */}
          <svg 
            style={{ position: 'absolute', right: 0, bottom: 0, width: '220px', height: '180px', pointerEvents: 'none', zIndex: 1 }} 
            viewBox="0 0 220 180" 
            fill="none"
          >
            <path d="M220,180 L220,70 Q160,60 100,120 Q60,160 0,180 Z" fill="rgba(207, 240, 233, 0.6)" />
            <path d="M220,180 L220,100 Q140,100 80,155 Q50,170 0,180 Z" fill="rgba(167, 243, 208, 0.45)" />
            <path d="M220,180 L220,130 Q150,130 90,170 Q60,175 0,180 Z" fill="rgba(45, 212, 191, 0.3)" />
          </svg>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0F2930', marginBottom: '4px' }}>
                What Our Patients Say
              </h2>
              <p style={{ fontSize: '14.5px', color: '#64748B' }}>Join 1 million+ happy patients across India</p>
              
            </div>

            {/* Slider Container with Left & Right Arrow Buttons */}
            <div style={{ position: 'relative', width: '100%' }}>
              
              {/* Left Navigation Arrow */}
              <button 
                onClick={() => scrollReviews('left')}
                aria-label="Previous Review"
                style={{ 
                  position: 'absolute', top: '50%', left: '-18px', transform: 'translateY(-50%)',
                  width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff',
                  color: '#0F172A', border: '1px solid #CBD5E1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0F766E';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#0F766E';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#0F172A';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
              >
                <ChevronLeft size={22} />
              </button>

              {/* Right Navigation Arrow */}
              <button 
                onClick={() => scrollReviews('right')}
                aria-label="Next Review"
                style={{ 
                  position: 'absolute', top: '50%', right: '-18px', transform: 'translateY(-50%)',
                  width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff',
                  color: '#0F172A', border: '1px solid #CBD5E1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0F766E';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#0F766E';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#0F172A';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
              >
                <ChevronRight size={22} />
              </button>

              {/* Scrollable Track - Displays ALL records from reviews */}
              <div 
                ref={reviewsScrollRef}
                style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  overflowX: 'auto', 
                  scrollSnapType: 'x mandatory', 
                  padding: '4px 4px 16px 4px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="no-scrollbar"
              >
                {reviews.map((t, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      flex: '0 0 calc(33.333% - 14px)', 
                      minWidth: '280px', 
                      scrollSnapAlign: 'start',
                      background: '#F8FAFC', 
                      padding: '24px', 
                      borderRadius: '18px', 
                      border: '1px solid #E2E8F0', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justify: 'space-between', 
                      gap: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.25s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '34px', color: '#94A3B8', fontFamily: 'serif', lineHeight: 0.8 
                      }}>
                        “
                      </span>
                    </div>

                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', fontStyle: 'normal', flex: 1, margin: 0 }}>
                      "{t.text}"
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '14px', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
                      <div style={{ 
                        width: '38px', height: '38px', borderRadius: '50%', background: '#93C5FD', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: '700', color: '#1E3A8A', fontSize: '14px' 
                      }}>
                        {t.name ? t.name.charAt(0) : "M"}
                      </div>
                      <div>
                        <b style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>{t.name}</b>
                        <span style={{ fontSize: '11.5px', color: '#64748B' }}>{t.role}</span>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#F59E0B' }}>5.0 ★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Get the Arvaya App CTA (Fixed Background Attached Behind Section) ── */}
      <section style={{ 
        position: 'relative', 
        width: '100%', 
        margin: '16px 0 0 0',
        padding: 0, 
        color: 'white', 
        backgroundImage: 'url(/banner_healthcare_2.png)',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '380px'
      }}>
        {/* Professional Dark Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(13, 56, 63, 0.92) 0%, rgba(13, 56, 63, 0.8) 50%, rgba(13, 56, 63, 0.4) 100%)',
          zIndex: 1
        }} />

        {/* Content Container Centered Inside Full-Width Section */}
        <div style={{ 
          maxWidth: '1240px', 
          margin: '0 auto', 
          position: 'relative', 
          zIndex: 2, 
          padding: '64px 24px', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '32px' 
        }}>
          <div style={{ maxWidth: '520px' }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.15)', 
              color: '#ffffff', padding: '6px 16px', borderRadius: '99px', 
              fontSize: '12px', fontWeight: '700', marginBottom: '16px', 
              border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)'
            }}>
              📱 Available on iOS & Android
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Get the Arvaya App
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '28px' }}>
              Book appointments, manage health records, order medicines, and earn rewards — all from your pocket.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button style={{ 
                padding: '12px 24px', background: '#ffffff', color: '#0F172A', 
                border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'all 0.2s' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Download size={16} /> App Store
              </button>
              <button style={{ 
                padding: '12px 24px', background: 'rgba(255,255,255,0.15)', color: '#ffffff', 
                border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '12px', fontSize: '14px', 
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                backdropFilter: 'blur(8px)', transition: 'all 0.2s' 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              >
                <Download size={16} /> Google Play
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { num: "1M+", label: "Downloads" },
              { num: "4.9★", label: "App Rating" },
              { num: "50K+", label: "Daily Users" }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: '32px', color: '#ffffff', lineHeight: 1, fontWeight: '800' }}>{s.num}</b>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: '6px', display: 'block' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAmbulanceModal && (
        <AmbulanceRequestModal onClose={() => setShowAmbulanceModal(false)} />
      )}
    </main>
  );
}
