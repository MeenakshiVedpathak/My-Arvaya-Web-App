import { 
  ChevronRight, ChevronLeft, ArrowRight, Activity, Heart, Eye, Brain, Bone, Baby, 
  ShieldCheck, Star, Pill, PhoneCall, Wallet, Gift, FileText, CreditCard, Search, 
  Users, CalendarCheck, Stethoscope, Quote, Sparkles, MapPin, Building2, Navigation, 
  TestTube, Clock, Flame, Check, ExternalLink, Download, Phone, MessageSquare, Award, Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import AmbulanceRequestModal from "../components/ambulance/AmbulanceRequestModal";
import { downloadBannerAsset, getBanners, getDiagnosticPackages, getPatientReviews } from "../services/dataService";import { getImageUrl } from "../services/uploadService";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const go = useNavigate();
  const { user } = useAuth();
  const reviewsScrollRef = useRef(null);

  const scrollReviews = (dir) => {
    if (reviewsScrollRef.current) {
      const container = reviewsScrollRef.current;
      const firstCard = container.firstElementChild;
      const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 310;
      
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 0) return;

      if (dir === 'right') {
        if (scrollLeft >= maxScroll - 15) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      } else {
        if (scrollLeft <= 15) {
          container.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
      }
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
    { name: "Rohit Chaudhari", role: "Bangalore", text: "Booked a cardiac consultation and got connected with a top cardiologist in 10 minutes. Super smooth experience!", rating: 5 },
    { name: "Mrs. Geethanjali D", role: "Mumbai", text: "The lab technician arrived right on time for home sample collection. Digital reports were ready in 18 hours.", rating: 5 },
    { name: "Dr. Ananya Sharma", role: "Delhi NCR", text: "Arvaya platform makes managing health records and ABHA health ID incredibly easy for my entire family.", rating: 5 },
    { name: "Vikram Patil", role: "Pune", text: "Emergency ambulance request was dispatched instantly with live GPS tracking. Saved critical time for hospital admission.", rating: 5 },
    { name: "Meenakshi K", role: "Hyderabad", text: "Very user-friendly patient portal! I can view all past prescriptions and diagnostic test history in one place.", rating: 5 },
    { name: "Siddharth Rao", role: "Chennai", text: "Excellent diagnostic services with transparent pricing. Earned reward points on my lab test package booking too!", rating: 5 },
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
          if (normalized.length < 6) {
            setReviews([...normalized, ...defaultReviews.slice(normalized.length)]);
          } else {
            setReviews(normalized);
          }
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
        const container = reviewsScrollRef.current;
        const firstCard = container.firstElementChild;
        const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 310;
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const maxScroll = scrollWidth - clientWidth;
        
        if (maxScroll <= 0) return;

        if (scrollLeft >= maxScroll - 15) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [reviews]);

  const tickerText = "24/7 Full Body Checkup this week!  •  Emergency Services now active in Bangalore, Mumbai, and Delhi...  •  Free consultation on  •  ";

  return (
    <main className="page page-enter" style={{ padding: 0, background: '#F8FAFC', fontFamily: "Inter, system-ui, sans-serif", color: '#0F172A' }}>
      
      {/* ── Top Emergency & Ticker Header Bar (Dark Teal Gradient Theme) ── */}
      <div style={{ background: 'linear-gradient(90deg, rgb(13, 92, 99), rgb(46, 102, 110))', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '9px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap' }}>
          
          {/* Emergency Call Pill */}
          <button 
            onClick={() => setShowAmbulanceModal(true)} 
            style={{ 
              background: 'linear-gradient(135deg, #FB913F 0%, #EF7D24 100%)', color: 'white', padding: '6px 14px', fontSize: '12px', 
              fontWeight: '700', borderRadius: '99px', border: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(251, 145, 63, 0.4)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '13px' }}>🚨</span> Medical Emergency? Call Ambulance
          </button>

          {/* Ticker Row */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden', fontSize: '12.5px' }}>
            <span style={{ 
              fontWeight: '800', background: 'hsla(0, 0%, 100%, 1.00)', color: '#043633ff', padding: '3px 9px', 
              borderRadius: '4px', marginRight: '12px', fontSize: '10.5px', textTransform: 'uppercase', 
              letterSpacing: '0.05em', whiteSpace: 'nowrap', border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              UPDATES
            </span>
            <div className="ticker-wrap" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
              <span className="ticker-content" style={{ display: 'inline-block', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '600' }}>
                {tickerText}{tickerText}
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <a href="tel:18001234567" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', textDecoration: 'none', fontSize: '12.5px', fontWeight: '800', whiteSpace: 'nowrap' }}>
            <Phone size={14} style={{ color: '#2DD4BF' }} /> 1800 123 4567
          </a>
        </div>
      </div>

      {/* ── Section 1: Full-Width Hero Banner (0 Upper/Left/Right Margins) ── */}
      <section style={{ position: 'relative', width: '100%', margin: 0, padding: 0, overflow: 'hidden', minHeight: '440px', background: '#0F172A' }}>
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
              background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.72) 48%, rgba(15, 23, 42, 0.2) 100%)' 
            }}></div>
          </div>
        ))}

        {/* Nav Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? dynamicSlides.length - 1 : prev - 1))}
          style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)',
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
            width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)',
            color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
            backdropFilter: 'blur(8px)', transition: 'all 0.2s'
          }}
          aria-label="Next Slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Hero Inner Centered Content */}
        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', height: '100%', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, padding: '48px 24px' }}>
          
          {/* Reference Header Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ height: '2px', width: '28px', background: '#00A896', display: 'inline-block', borderRadius: '2px' }}></span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#00A896', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              We Care About Your Health
            </span>
          </div>

          {dynamicSlides.map((slide, idx) => idx === currentSlide && (
            <div key={idx} className="animate-fade-in-up" style={{ maxWidth: '600px' }}>
              {slide.badge && (
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px', 
                  background: 'rgba(255, 255, 255, 0.14)', backdropFilter: 'blur(10px)', 
                  color: '#FDBF8B', padding: '6px 14px', borderRadius: '99px', 
                  fontSize: '11px', fontWeight: '700', marginBottom: '16px', 
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
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.88)', marginBottom: '28px', lineHeight: 1.6 }}>
                  {slide.subtitle}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                {slide.primaryBtn && (
                  <button 
                    onClick={slide.primaryAction} 
                    style={{ 
                      padding: '12px 26px', fontSize: '14px', fontWeight: '700', 
                      color: '#ffffff', background: 'linear-gradient(135deg, #00A896 0%, #0D766E 100%)', 
                      border: 'none', borderRadius: '12px', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '8px', 
                      boxShadow: '0 4px 16px rgba(0, 168, 150, 0.4)', transition: 'transform 0.2s' 
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

          {/* Sub-Hero Quick Stat Indicators Pill Bar */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <b style={{ fontSize: '18px', fontWeight: '800', color: '#00A896' }}>7+</b>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Years Experience</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <b style={{ fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>22+</b>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Top Doctors & Specialists</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <b style={{ fontSize: '18px', fontWeight: '800', color: '#FBBF24' }}>24/7</b>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Emergency Ambulance Dispatch</span>
            </div>
          </div>

        </div>

        {/* Carousel Dots */}
        <div style={{ position: 'absolute', bottom: '16px', right: '32px', zIndex: 10, display: 'flex', gap: '8px' }}>
          {dynamicSlides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: idx === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentSlide ? '#00A896' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Main Container Wrapper ── */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 16px 40px 16px', display: 'flex', flexDirection: 'column', gap: '44px' }}>
        
        {/* ── Section 1: 4 Solid Contrast Service Cards Grid ── */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            {/* Card 1: Doctor Consultation (Royal Blue) */}
            <div 
              onClick={() => go('/doctors')}
              style={{
                background: 'linear-gradient(135deg, #0A369D 0%, #072AC8 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                boxShadow: '0 8px 20px rgba(10, 54, 157, 0.18)',
                transition: 'transform 0.25s, box-shadow 0.25s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 28px rgba(10, 54, 157, 0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(10, 54, 157, 0.18)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Doctor Consultation</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '12px 0' }}>
                Book video consultations or hospital visits with certified top specialists across 35+ departments.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#6EE7B7' }}>
                Book Doctor <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Emergency Care (Deep Teal) */}
            <div 
              onClick={() => setShowAmbulanceModal(true)}
              style={{
                background: 'linear-gradient(135deg, #005F73 0%, #0A9396 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                boxShadow: '0 8px 20px rgba(0, 95, 115, 0.18)',
                transition: 'transform 0.25s, box-shadow 0.25s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 28px rgba(0, 95, 115, 0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 95, 115, 0.18)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Emergency Care</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '12px 0' }}>
                Instant emergency medical care response team available 24/7 for urgent hospital admission.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#A7F3D0' }}>
                Get Immediate Help <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3: Ambulance Services (Cyan Blue) */}
            <div 
              onClick={() => go('/ambulance')}
              style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.18)',
                transition: 'transform 0.25s, box-shadow 0.25s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 28px rgba(2, 132, 199, 0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.18)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Ambulance Dispatch</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '12px 0' }}>
                GPS-tracked mobile ICU ambulance dispatch with trained paramedic life support teams.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#BAE6FD' }}>
                Track Ambulance <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 4: 24/7 Diagnostics (Dark Navy Slate) */}
            <div 
              onClick={() => go('/labs')}
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)',
                transition: 'transform 0.25s, box-shadow 0.25s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 28px rgba(15, 23, 42, 0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.18)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TestTube size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>24/7 Diagnostics</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '12px 0' }}>
                100% NABL accredited lab checkups with doorstep sample collection & 24h digital reports.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#38BDF8' }}>
                Book Lab Test <ArrowRight size={14} />
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 2: "Compassionate Care Meets Modern Medicine" (Split Feature Layout inspired by Image) ── */}
        <section style={{ 
          background: '#ffffff', 
          borderRadius: '24px', 
          padding: '40px 32px', 
          border: '1px solid #E2E8F0', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'center'
        }}>
          {/* Left Side: Medical Team Image Showcase */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', minHeight: '340px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.1)' }}>
            <img 
              src="/banner_healthcare_1.png" 
              alt="Compassionate Care Meets Modern Medicine" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '340px', display: 'block' }} 
            />
            {/* Top Left Experience Badge */}
            <div style={{ 
              position: 'absolute', top: '16px', left: '16px', 
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
              color: '#ffffff', padding: '8px 16px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700'
            }}>
              <Award size={16} style={{ color: '#00A896' }} />
              NABH Accredited Care
            </div>
          </div>

          {/* Right Side: Detailed Copy & Highlight Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '2px', width: '24px', background: '#00A896', display: 'inline-block' }}></span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#00A896', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Arvaya Healthcare
              </span>
            </div>

            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Compassionate Care Meets <span style={{ color: '#00A896' }}>Modern Medicine</span>
            </h2>

            <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.65 }}>
              We bring together world-class specialists, state-of-the-art diagnostic technology, and rapid response emergency services to deliver seamless, patient-first care every day.
            </p>

            {/* 4 Feature Points Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PhoneCall size={18} />
                </div>
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0F172A', display: 'block', fontWeight: '700' }}>24/7 Ambulance</b>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>5-min rapid dispatch</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} />
                </div>
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0F172A', display: 'block', fontWeight: '700' }}>Top Specialists</b>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>35+ Specialties</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TestTube size={18} />
                </div>
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0F172A', display: 'block', fontWeight: '700' }}>Doorstep Samples</b>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Digital reports in 24h</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0F172A', display: 'block', fontWeight: '700' }}>100% Genuine</b>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Certified medicine & lab</span>
                </div>
              </div>

            </div>

            <div style={{ marginTop: '12px' }}>
              <button 
                onClick={() => go('/doctors')}
                style={{ 
                  padding: '12px 24px', background: '#0F172A', color: '#ffffff', 
                  border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', 
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(15,23,42,0.2)', transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#00A896'}
                onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}
              >
                <span>Find Your Specialist</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Section 4: "Care Across Every Specialty" Grid ── */}
        <section>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ height: '2px', width: '20px', background: '#00A896', display: 'inline-block' }}></span>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#00A896', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                OUR DEPARTMENTS
              </span>
              <span style={{ height: '2px', width: '20px', background: '#00A896', display: 'inline-block' }}></span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Care Across Every <span style={{ color: '#00A896', fontStyle: 'italic' }}>Speciality</span>
            </h2>
            <button 
              onClick={() => go("/doctors")}
              style={{ 
                background: '#0F172A', border: 'none', borderRadius: '99px', 
                padding: '8px 20px', fontSize: '13px', fontWeight: '700', color: '#ffffff', 
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 10px rgba(15,23,42,0.15)' 
              }}
            >
              View All Specialists <ArrowRight size={14} />
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
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', 
                  transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = spec.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '50%', background: spec.bg, 
                  color: spec.color, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {spec.icon}
                </div>
                <div>
                  <b style={{ fontSize: '14.5px', color: '#0F172A', display: 'block', fontWeight: '700' }}>{spec.name}</b>
                  <span style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', display: 'block' }}>{spec.consults}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 6: "Care Close to You — Across Karnataka & Maharashtra" / Ecosystem Services ── */}
        <section style={{ 
          position: 'relative', 
          width: '100%',
          borderRadius: '24px', 
          background: '#ffffff', 
          padding: '44px 32px', 
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
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
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ height: '2px', width: '20px', background: '#00A896', display: 'inline-block' }}></span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#00A896', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  OUR NETWORK & PLATFORM
                </span>
                <span style={{ height: '2px', width: '20px', background: '#00A896', display: 'inline-block' }}></span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginTop: '4px', marginBottom: '8px' }}>
                Your Health Ecosystem
                 {/* — <span style={{ color: '#00A896', fontStyle: 'italic' }}>Across Karnataka & Maharashtra</span> */}
              </h2>
            </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            {/* Card 1: ABHA Hub */}
            <div 
              onClick={() => go("/abha")}
              style={{ 
                background: '#F8FAFC', borderRadius: '18px', padding: '24px', 
                border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', 
                flexDirection: 'column', justifyContent: 'space-between', gap: '16px',
                transition: 'all 0.25s' 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(15,23,42,0.08)';
                e.currentTarget.style.borderColor = '#00A896';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CreditCard size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>ABHA Hub</h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Create & link your official ABHA ID for instant health data access across all hospital networks.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0F766E' }}>
                Explore <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Arvaya Rewards */}
            <div 
              onClick={() => go("/rewards")}
              style={{ 
                background: 'linear-gradient(145deg, #FFFDF5 0%, #FEF3C7 100%)', borderRadius: '18px', padding: '24px', 
                border: '1.5px solid #FBBF24', cursor: 'pointer', display: 'flex', 
                flexDirection: 'column', justifyContent: 'space-between', gap: '16px',
                position: 'relative', overflow: 'hidden', transition: 'all 0.25s' 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(245,158,11,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#D97706', color: '#ffffff', fontSize: '9.5px', fontWeight: '800', padding: '4px 10px', borderRadius: '0 16px 0 10px', textTransform: 'uppercase' }}>
                FEATURED
              </span>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F59E0B', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Gift size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#78350F', marginBottom: '6px' }}>Arvaya Rewards</h3>
                <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5 }}>
                  Earn reward points on every doctor consultation & lab checkup booking to redeem offers.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#B45309' }}>
                Explore Rewards <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3: Digital Wallet */}
            <div 
              onClick={() => go("/wallet")}
              style={{ 
                background: '#F8FAFC', borderRadius: '18px', padding: '24px', 
                border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', 
                flexDirection: 'column', justifyContent: 'space-between', gap: '16px',
                transition: 'all 0.25s' 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(15,23,42,0.08)';
                e.currentTarget.style.borderColor = '#00A896';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Wallet size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>Digital Wallet</h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Fast, secure digital payments with instant refunds guaranteed on appointment cancellations.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0F766E' }}>
                Explore Wallet <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 4: Health Records */}
            <div 
              onClick={() => go("/records")}
              style={{ 
                background: '#F8FAFC', borderRadius: '18px', padding: '24px', 
                border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', 
                flexDirection: 'column', justifyContent: 'space-between', gap: '16px',
                position: 'relative', overflow: 'hidden', transition: 'all 0.25s' 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(15,23,42,0.08)';
                e.currentTarget.style.borderColor = '#00A896';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#10B981', color: '#ffffff', fontSize: '9.5px', fontWeight: '800', padding: '4px 10px', borderRadius: '0 16px 0 10px', textTransform: 'uppercase' }}>
                ENCRYPTED
              </span>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E6F4F1', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <FileText size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>Health Records</h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Your complete medical history and prescriptions, fully encrypted & accessible anytime.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0F766E' }}>
                View Records <ArrowRight size={14} />
              </div>
            </div>

          </div>
        </div>
      </section>



        {/* ── Section 8: "What Our Patients Say" Testimonials Slider Card ── */}
        <section style={{ 
          position: 'relative',
          width: '100%'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ height: '2px', width: '20px', background: '#00A896', display: 'inline-block' }}></span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#00A896', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  PATIENT TESTIMONIALS
                </span>
                <span style={{ height: '2px', width: '20px', background: '#00A896', display: 'inline-block' }}></span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', marginTop: '4px', marginBottom: '8px' }}>
                What Our <span style={{ color: '#00A896', fontStyle: 'italic' }}>Patients Say</span>
              </h2>
              <p style={{ fontSize: '14.5px', color: '#64748B', margin: 0 }}>Join 1 million+ happy patients across India</p>
            </div>

            {/* Slider Container with Left & Right Arrow Buttons */}
            <div style={{ position: 'relative', width: '100%' }}>
              
              {/* Left Navigation Arrow */}
              <button 
                onClick={() => scrollReviews('left')}
                aria-label="Previous Review"
                style={{ 
                  position: 'absolute', top: '50%', left: '-18px', transform: 'translateY(-50%)',
                  width: '46px', height: '46px', borderRadius: '50%', background: '#ffffff',
                  color: '#0F172A', border: '1px solid #CBD5E1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.14)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0F766E';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#0F766E';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#0F172A';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft size={24} />
              </button>

              {/* Right Navigation Arrow */}
              <button 
                onClick={() => scrollReviews('right')}
                aria-label="Next Review"
                style={{ 
                  position: 'absolute', top: '50%', right: '-18px', transform: 'translateY(-50%)',
                  width: '46px', height: '46px', borderRadius: '50%', background: '#ffffff',
                  color: '#0F172A', border: '1px solid #CBD5E1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.14)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0F766E';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#0F766E';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#0F172A';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight size={24} />
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
                      minWidth: '290px', 
                      scrollSnapAlign: 'start',
                      background: '#ffffff', 
                      padding: '26px 22px', 
                      borderRadius: '20px', 
                      border: '1px solid #E2E8F0', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      gap: '18px',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = '#00A896';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 168, 150, 0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                    }}
                  >
                    {/* Top Decorative Gradient Accent Bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #00A896 0%, #0D766E 100%)' }} />

                    {/* Card Header: Quote Icon & Rating Stars */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ 
                        width: '38px', height: '38px', borderRadius: '12px', 
                        background: '#E6F4F1', color: '#0F766E', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <Quote size={18} />
                      </div>
                      
                      {/* Star Rating & Verified Pill */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[...Array(t.rating || 5)].map((_, starIdx) => (
                            <Star key={starIdx} size={14} fill="#F59E0B" color="#F59E0B" />
                          ))}
                        </div>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '3px', 
                          background: '#ECFDF5', color: '#047857', padding: '2px 8px', 
                          borderRadius: '99px', fontSize: '10.5px', fontWeight: '700', 
                          border: '1px solid #A7F3D0' 
                        }}>
                          <ShieldCheck size={11} /> Verified
                        </span>
                      </div>
                    </div>

                    {/* Testimonial Quote Text */}
                    <p style={{ 
                      fontSize: '14.5px', fontWeight: '500', color: '#334155', 
                      lineHeight: 1.6, flex: 1, margin: 0, fontStyle: 'italic' 
                    }}>
                      "{t.text}"
                    </p>

                    {/* Card Footer: Patient Profile Avatar & Name */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', 
                      paddingTop: '16px', borderTop: '1px solid #F1F5F9', marginTop: 'auto' 
                    }}>
                      <div style={{ 
                        width: '42px', height: '42px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #0F766E 0%, #00A896 100%)', 
                        color: '#ffffff', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontWeight: '800', fontSize: '15px',
                        boxShadow: '0 4px 10px rgba(0, 168, 150, 0.25)', flexShrink: 0
                      }}>
                        {t.name ? t.name.charAt(0).toUpperCase() : "M"}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <b style={{ 
                          fontSize: '14px', fontWeight: '800', color: '#0F172A', 
                          display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                        }}>
                          {t.name}
                        </b>
                        <span style={{ 
                          fontSize: '12px', color: '#64748B', display: 'flex', 
                          alignItems: 'center', gap: '4px', marginTop: '1px' 
                        }}>
                          <MapPin size={11} style={{ color: '#00A896' }} />
                          {t.role || "Verified Patient"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Section 9: "Get the Arvaya App" CTA (Fixed Background Dark Navy Banner) ── */}
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
        {/* Dark Navy Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(13, 56, 63, 0.94) 0%, rgba(13, 56, 63, 0.82) 50%, rgba(13, 56, 63, 0.45) 100%)',
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

      {/* Ambulance Modal Trigger */}
      {showAmbulanceModal && (
        <AmbulanceRequestModal onClose={() => setShowAmbulanceModal(false)} />
      )}
    </main>
  );
}
