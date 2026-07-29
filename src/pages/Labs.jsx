import { Search, ChevronRight, Activity, FlaskConical, Clock, Heart, ShieldCheck, Sparkles, Droplets, Bone, Brain, Baby, Eye, Ribbon, Flame, Wind, Pill, Syringe, Scissors, Apple, Zap, Users, Dumbbell, Beaker, Microscope, TestTube, Stethoscope, CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLabPackages } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { packages as defaultPackages } from "../mocks/data";
import SelectSlotUI from "../components/doctors/SelectSlotUI";
import Modal from "../components/common/Modal";

/* ─── Static Data ─── */
const quickCategories = [
  { name: "Diabetes", icon: <Droplets size={26} />, color: "#e74c3c", bg: "#fde8e8" },
  { name: "Brain", icon: <Brain size={26} />, color: "#8e44ad", bg: "#f3e8fd" },
  { name: "Immunity", icon: <ShieldCheck size={26} />, color: "#27ae60", bg: "#e8fde8" },
  { name: "Pregnancy", icon: <Baby size={26} />, color: "#e91e8c", bg: "#fde8f5" },
  { name: "Heart", icon: <Heart size={26} />, color: "#e74c3c", bg: "#fde8e8" },
  { name: "Thyroid", icon: <Activity size={26} />, color: "#2980b9", bg: "#e8f0fd" },
];

const allCategories = [
  { name: "For Women", icon: <Users size={28} />, color: "#e91e8c", bg: "#fde8f5" },
  { name: "For Men", icon: <Dumbbell size={28} />, color: "#2e86de", bg: "#e8f0fd" },
  { name: "Diabetes", icon: <Droplets size={28} />, color: "#e74c3c", bg: "#fde8e8" },
  { name: "Lifestyle", icon: <Apple size={28} />, color: "#27ae60", bg: "#e8fde8" },
  { name: "Senior Citizen", icon: <Heart size={28} />, color: "#f39c12", bg: "#fef5e7" },
  { name: "Fitness", icon: <Zap size={28} />, color: "#8e44ad", bg: "#f3e8fd" },
  { name: "Blood", icon: <Droplets size={28} />, color: "#e74c3c", bg: "#fde8e8" },
  { name: "Full Body Checkups", icon: <Stethoscope size={28} />, color: "#2e666e", bg: "#e4eeef" },
  { name: "Pregnancy", icon: <Baby size={28} />, color: "#e91e8c", bg: "#fde8f5" },
  { name: "Immunity", icon: <ShieldCheck size={28} />, color: "#27ae60", bg: "#e8fde8" },
  { name: "Hormone Health", icon: <Activity size={28} />, color: "#9b59b6", bg: "#f3e8fd" },
  { name: "Hairfall", icon: <Scissors size={28} />, color: "#e67e22", bg: "#fef5e7" },
  { name: "Vitamin & Nutrition", icon: <Apple size={28} />, color: "#2ecc71", bg: "#e8fde8" },
  { name: "Thyroid", icon: <Activity size={28} />, color: "#2980b9", bg: "#e8f0fd" },
  { name: "Brain", icon: <Brain size={28} />, color: "#8e44ad", bg: "#f3e8fd" },
  { name: "Bones & Joints", icon: <Bone size={28} />, color: "#795548", bg: "#f0ebe8" },
  { name: "Cardiac", icon: <Heart size={28} />, color: "#e74c3c", bg: "#fde8e8" },
  { name: "Liver", icon: <FlaskConical size={28} />, color: "#16a085", bg: "#e8fdf8" },
  { name: "Cancer", icon: <Ribbon size={28} />, color: "#c0392b", bg: "#fde8e8" },
  { name: "Fever", icon: <Flame size={28} />, color: "#e74c3c", bg: "#fde8e8" },
  { name: "Respiratory Issues", icon: <Wind size={28} />, color: "#e91e63", bg: "#fde8f0" },
  { name: "Kidney", icon: <Beaker size={28} />, color: "#9b59b6", bg: "#f3e8fd" },
];

const mockLabAppointments = [
  { id: 1, date: "June 27, 2025", status: "Upcoming", name: "Complete Blood Count", lab: "LifeCare Diagnostics", time: "10:30 AM" },
  { id: 2, date: "July 5, 2025", status: "Upcoming", name: "Thyroid Profile", lab: "MediTest Labs", time: "2:15 PM" },
  { id: 3, date: "July 12, 2025", status: "Scheduled", name: "Lipid Profile", lab: "PathCare Labs", time: "9:00 AM" },
];

export default function Labs({ forceModalOpen = false }) {
  const go = useNavigate();
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId } = useBooking();
  const { user, openLoginModal } = useAuth();

  const [packages, setPackages] = useState(defaultPackages || []);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [visitType, setVisitType] = useState("home");
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);

  useEffect(() => {
    getLabPackages().then(data => {
      if (Array.isArray(data) && data.length > 0) setPackages(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPackages = useMemo(() => {
    return (packages || []).filter(pkg => {
      const matchQuery = (pkg.title || "").toLowerCase().includes(q.toLowerCase());
      if (!matchQuery) return false;
      if (activeQuickFilter) {
        return (pkg.title || "").toLowerCase().includes(activeQuickFilter.toLowerCase()) ||
               (pkg.organs || []).some(o => o.toLowerCase().includes(activeQuickFilter.toLowerCase()));
      }
      return true;
    });
  }, [packages, q, activeQuickFilter]);

  const confirmBooking = (slotData) => {
    setBookingType("lab");
    setLabPackage(selectedPackage);
    setDate(new Date(slotData.date));
    setSlot(slotData.time);
    if (!user) return openLoginModal("/confirmed");
    setBookingId("LAB" + Math.floor(Math.random() * 100000000));
    go("/confirmed");
  };

  /* ─── Reusable Section Header ─── */
  const SectionHeader = ({ title, actionText, onAction }) => (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-h2" style={{ margin: 0 }}>{title}</h2>
      {actionText && (
        <button className="btn btn-secondary flex items-center gap-2" onClick={onAction} style={{ background: 'none', border: 'none', padding: 0 }}>
          {actionText} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );

  /* ─── Circular Icon Item ─── */
  const CircleIcon = ({ item, size = 64, onClick }) => (
    <div
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s', minWidth: size + 16 }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: size, height: size, borderRadius: '50%', background: item.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
        border: '2px solid transparent', transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}22`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      >
        {item.icon}
      </div>
      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-main)', textAlign: 'center', lineHeight: 1.3, maxWidth: size + 16 }}>{item.name}</span>
    </div>
  );

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)' }}>

      {/* ── Embedded Styles ── */}
      <style>{`
        .labs-scroll-row { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .labs-scroll-row::-webkit-scrollbar { display: none; }
        .labs-scroll-row > * { scroll-snap-align: start; flex-shrink: 0; }
        .labs-pkg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .labs-appt-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; min-width: 300px; transition: all 0.3s; }
        .labs-appt-card:hover { box-shadow: 0 8px 24px rgba(46,102,110,0.1); transform: translateY(-2px); }
        .labs-pkg-card { background: #fff; border-radius: 16px; border: 1px solid var(--border); transition: all 0.3s; display: flex; flex-direction: column; position: relative; }
        .labs-pkg-card:hover { box-shadow: 0 12px 30px rgba(0,0,0,0.06); transform: translateY(-4px); border-color: rgba(46,102,110,0.2); }
        .labs-section { padding: 56px 0; }
        .labs-section-alt { padding: 56px 0; background: var(--bg-surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .labs-quick-chip { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 16px; transition: all 0.2s; min-width: 80px; }
        .labs-quick-chip:hover { background: var(--bg-app); }
        .labs-quick-chip.active { background: var(--primary-light); }
        .labs-quick-chip.active .labs-quick-icon { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(46,102,110,0.15); }
        .labs-condition-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 24px; justify-items: center; }
        @media (min-width: 769px) {
          .labs-scroll-row { justify-content: center; }
        }
        @media (max-width: 900px) {
          .labs-pkg-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
        }
        @media (max-width: 600px) {
          .labs-condition-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .labs-pkg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Hero / Search Section ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0 32px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Lab Tests & Packages</span>
          </div>
          
          <h1 className="text-h2" style={{ fontSize: '24px', marginBottom: '8px' }}>Diagnostic Tests & Packages</h1>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Book lab tests with home sample collection • Reports in 24 hrs</p>

          {/* Search Bar */}
          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', display: 'flex', alignItems: 'center', maxWidth: '600px', transition: 'border-color 0.2s, box-shadow 0.2s' }} 
               onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46, 102, 110, 0.1)'; }} 
               onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--text-muted)" />
            </div>
            <input
              placeholder="Search for tests, packages, health conditions..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: 'var(--text-main)', padding: '10px 0' }}
            />
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="labs-section labs-section-alt">
        <div className="container">
          <SectionHeader title="Categories" />
          <div className="labs-condition-grid">
            {allCategories.map((item) => (
              <CircleIcon key={item.name} item={item} size={68} onClick={() => setActiveQuickFilter(item.name)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Health Packages ── */}
      <div className="labs-section">
        <div className="container">
          <SectionHeader title="Health Packages" actionText="View All" onAction={() => {}} />

          {loading ? (
            <div className="labs-pkg-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="labs-pkg-card" style={{ minHeight: '300px' }}>
                  <div className="skeleton" style={{ height: '140px', borderRadius: 0 }} />
                  <div style={{ padding: '20px' }}>
                    <div className="skeleton skeleton-title" style={{ width: '80%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '8px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="labs-pkg-grid">
              {filteredPackages.map((pkg, idx) => (
                <article className="labs-pkg-card" key={pkg.title + idx}>
                  {idx === 0 && <div className="ribbon" style={{ display: 'flex', alignItems: 'center', zIndex: 10, fontSize: '10px', padding: '4px 8px' }}><Sparkles size={10} style={{ marginRight: '4px' }} /> Most Booked</div>}

                  {pkg.img && (
                    <div style={{ height: '160px', overflow: 'hidden', background: 'var(--primary-light)', position: 'relative', borderRadius: '16px 16px 0 0' }}>
                      <img
                        src={pkg.img}
                        alt={pkg.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {pkg.discount && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                          {pkg.discount}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: 1.3, fontWeight: '700', marginBottom: '8px' }}>{pkg.title}</h3>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <ShieldCheck size={10} /> NABL Accredited
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <TestTube size={10} /> {pkg.tests || "30+ Tests"}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> 24 Hrs Report
                      </span>
                    </div>

                    {pkg.trend && <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '600', marginBottom: '12px' }}>{pkg.trend}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                      <div>
                        {pkg.oldPrice && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}><s>{pkg.oldPrice}</s></span>}
                        {pkg.price && <b style={{ fontSize: '20px', color: 'var(--text-main)', display: 'block', lineHeight: 1.2 }}>{pkg.price}</b>}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>onwards</span>
                      </div>
                      <button
                        className="btn btn-accent"
                        onClick={() => setSelectedPackage(pkg)}
                        style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '700', borderRadius: '10px' }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filteredPackages.length === 0 && (
                <div className="text-center text-muted" style={{ gridColumn: '1 / -1', padding: '60px 0' }}>
                  <Search size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                  <p>No packages found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* ── Your Appointments ── */}
      {user && (
        <div className="labs-section">
          <div className="container">
            <SectionHeader title="Your Appointments" actionText="View All" onAction={() => go('/my-appointments')} />
            <div className="labs-scroll-row" style={{ gap: '16px' }}>
              {mockLabAppointments.map((appt) => (
                <div key={appt.id} className="labs-appt-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{appt.date}</span>
                    <span style={{
                      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: appt.status === 'Upcoming' ? '#dcfce7' : 'var(--primary-light)',
                      color: appt.status === 'Upcoming' ? '#16a34a' : 'var(--primary-dark)'
                    }}>
                      {appt.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{appt.name}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} /> {appt.lab}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} /> {appt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Trust Banner ── */}
      <div style={{ padding: '32px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: <ShieldCheck size={24} />, title: "NABL Accredited", sub: "100% certified labs", color: "var(--success)" },
              { icon: <Clock size={24} />, title: "24 Hr Reports", sub: "Fast digital delivery", color: "var(--primary)" },
              { icon: <Microscope size={24} />, title: "Home Collection", sub: "Safe & hygienic", color: "var(--accent)" },
              { icon: <Stethoscope size={24} />, title: "Expert Review", sub: "Doctor verified", color: "#8e44ad" },
            ].map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${v.color}11`, color: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.icon}
                </div>
                <div>
                  <b style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>{v.title}</b>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Booking Modal ── */}
      <Modal
        isOpen={!!selectedPackage || forceModalOpen}
        onClose={() => setSelectedPackage(null)}
        title="Schedule Lab Test"
        maxWidth="700px"
      >
        {selectedPackage && (
          <div style={{ marginBottom: "24px", padding: '16px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{selectedPackage.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{selectedPackage.tests}</p>

            <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Detailed Test Inclusion</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {["Complete Blood Count", "Thyroid Profile (T3, T4, TSH)", "Lipid Profile", "Liver Function Test", "Kidney Function Test", "Blood Sugar Fasting"].map((test, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                  <ShieldCheck size={14} className="text-success" /> {test}
                </div>
              ))}
            </div>
            {selectedPackage.tags && selectedPackage.tags.includes("Fasting Required") && (
              <div style={{ marginTop: '16px', padding: '8px 12px', background: 'rgba(251, 145, 63, 0.1)', color: 'var(--accent)', borderRadius: '8px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} /> Fasting of 10-12 hours is required for this package.
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px" }}>
            Select Visit Type
          </label>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <label style={{ background: visitType === 'home' ? 'var(--primary-light)' : 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: visitType === 'home' ? '2px solid var(--primary)' : '1px solid var(--border)', flex: 1, minWidth: '220px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <input type="radio" name="labVisitType" value="home" checked={visitType === 'home'} onChange={() => setVisitType('home')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'home' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>Home Sample Collection</b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>A phlebotomist will visit your home.</small>
              </div>
            </label>
            <label style={{ background: visitType === 'lab' ? 'var(--primary-light)' : 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: visitType === 'lab' ? '2px solid var(--primary)' : '1px solid var(--border)', flex: 1, minWidth: '220px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <input type="radio" name="labVisitType" value="lab" checked={visitType === 'lab'} onChange={() => setVisitType('lab')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'lab' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>Visit Diagnostic Center</b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>Walk-in to the nearest partner lab.</small>
              </div>
            </label>
          </div>
        </div>

        <SelectSlotUI onConfirm={confirmBooking} type="lab" />
      </Modal>
    </main>
  );
}
