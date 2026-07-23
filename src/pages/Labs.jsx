import { Search, ChevronRight, Activity, FlaskConical, Clock, Heart, ShieldCheck, Sparkles, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLabPackages } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { packages as defaultPackages } from "../mocks/data";
import SelectSlotUI from "../components/doctors/SelectSlotUI";
import Modal from "../components/common/Modal";

const borderColors = ['var(--primary)', 'var(--accent)', '#3D7A83', '#1F4F57'];

export default function Labs() {
  const go = useNavigate();
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId } = useBooking();
  const { user, openLoginModal } = useAuth();
  
  // Data State
  const [packages, setPackages] = useState(defaultPackages || []);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // Booking Modal State
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [visitType, setVisitType] = useState("home"); // home or lab

  useEffect(() => {
    getLabPackages().then(data => {
      if (Array.isArray(data) && data.length > 0) setPackages(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPackages = useMemo(() => {
    return (packages || []).filter(pkg => (pkg.title || "").toLowerCase().includes(q.toLowerCase()));
  }, [packages, q]);

  const confirmBooking = (slotData) => {
    setBookingType("lab");
    setLabPackage(selectedPackage);
    setDate(new Date(slotData.date));
    setSlot(slotData.time);
    if (!user) return openLoginModal("/confirmed");
    setBookingId("LAB" + Math.floor(Math.random() * 100000000));
    go("/confirmed");
  };

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Lab Tests & Packages</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Diagnostic Tests & Packages</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Safe, secure, and accurate home sample collection</p>
        </div>
      </div>

      <style>{`
        .labs-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
        @media (max-width: 768px) { .labs-layout { grid-template-columns: 1fr; } }
        .lab-card { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .lab-card:hover { box-shadow: 0 12px 32px rgba(46, 102, 110, 0.12); transform: translateY(-3px); }
      `}</style>

      <div className="container labs-layout" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
        
        {/* Mobile Filter Toggle */}
        <button className="mobile-filter-toggle" onClick={() => setShowFiltersMobile(!showFiltersMobile)}>
          <span className="flex items-center gap-2"><SlidersHorizontal size={16} color="var(--primary)" /> Filter Diagnostic Packages</span>
          <ChevronDown size={18} style={{ transform: showFiltersMobile ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* ── Sidebar ── */}
        <div className={`collapsible-sidebar-mobile ${showFiltersMobile ? 'open' : ''}`}>
          <aside>
            <div className="card-elevated styled-scrollbar" style={{ position: 'sticky', top: '180px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <b style={{ fontSize: '15px' }}>Filters</b>
                <span className="text-primary cursor-pointer" style={{ fontSize: '12px', fontWeight: '600' }} onClick={() => setQ("")}>RESET</span>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--bg-app)' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46, 102, 110, 0.1)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <Search size={16} className="text-muted" />
                    <input 
                      placeholder="Search by test name..." 
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Browse by Organs</b>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-main" style={{ fontSize: '13px' }}><input type="checkbox"/> <Heart size={14} className="text-accent"/> Heart</label>
                    <label className="flex items-center gap-2 cursor-pointer text-main" style={{ fontSize: '13px' }}><input type="checkbox"/> <Activity size={14} className="text-primary"/> Liver</label>
                    <label className="flex items-center gap-2 cursor-pointer text-main" style={{ fontSize: '13px' }}><input type="checkbox"/> <FlaskConical size={14} className="text-muted"/> Kidney</label>
                  </div>
                </div>

                <div style={{ background: 'var(--success-bg)', border: '1px solid #bbf7d0', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <ShieldCheck size={24} className="text-success" style={{ flexShrink: 0 }} />
                  <div>
                    <b style={{ fontSize: '13px', display: 'block', color: 'var(--success)' }}>100% Safe & Hygienic</b>
                    <span className="text-muted" style={{ fontSize: '11px' }}>Phlebotomists follow strict safety protocols</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Main Content ── */}
        <section>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <article key={i} className="card-elevated flex flex-col" style={{ padding: '0', minHeight: '320px', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: '120px', borderRadius: 0 }}></div>
                  <div style={{ padding: '20px' }}>
                    <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                    <div className="flex gap-2 mb-4 mt-4">
                      <div className="skeleton skeleton-text" style={{ width: '80px', borderRadius: '99px', height: '24px' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80px', borderRadius: '99px', height: '24px' }}></div>
                    </div>
                    <div className="flex justify-between items-end mt-auto" style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                      <div className="skeleton skeleton-text" style={{ width: '60px', height: '24px' }}></div>
                      <div className="skeleton skeleton-btn" style={{ width: '80px' }}></div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {filteredPackages.map((pkg, idx) => (
                <article className="card-elevated lab-card flex flex-col" key={pkg.title} style={{ padding: '0', position: 'relative', borderLeft: `3px solid ${borderColors[idx % borderColors.length]}` }}>
                  {idx === 0 && <div className="ribbon" style={{ display: 'flex', alignItems: 'center', zIndex: 10, fontSize: '10px', padding: '4px 8px' }}><Sparkles size={10} style={{ marginRight: '4px' }} /> Most Booked</div>}
                  
                  {/* Package Image */}
                  {pkg.img && (
                    <div style={{ height: '120px', overflow: 'hidden', background: 'var(--primary-light)', borderRadius: '12px 12px 0 0' }}>
                      <img 
                        src={pkg.img} 
                        alt={pkg.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                  )}

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.3, fontWeight: '700' }}>{pkg.title}</h3>
                    </div>
                    <div style={{ fontSize: '10px', color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <ShieldCheck size={10}/> NABL Accredited
                    </div>
                    
                    <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
                      <span className="badge badge-success" style={{ background: '#E4EEEF', color: '#2E666E', padding: '2px 6px', fontSize: '11px' }}><Activity size={10}/> {pkg.tests || "30+ Tests"} Included</span>
                      <span className="badge" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)', padding: '2px 6px', fontSize: '11px' }}><Clock size={10}/> 24 Hrs Report</span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto" style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                      <div>
                        {pkg.oldPrice && <span className="text-muted" style={{ fontSize: '11px', display: 'flex', gap: '4px' }}><s>{pkg.oldPrice}</s> <b className="text-success">{pkg.discount}</b></span>}
                        {pkg.price && <b style={{ fontSize: '18px', color: 'var(--text-main)', display: 'block' }}>{pkg.price}</b>}
                      </div>
                      <button 
                        className="btn btn-accent"
                        onClick={() => setSelectedPackage(pkg)}
                        style={{ padding: '6px 14px', fontSize: '13px', minHeight: '32px' }}
                      >
                        Book
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
        </section>

      {/* Booking Modal (Used in React & pre-rendered for static HTML) */}
      <Modal 
        isOpen={!!selectedPackage} 
        onClose={() => setSelectedPackage(null)}
        title="Schedule Lab Test"
        maxWidth="700px"
      >
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

      {/* Static Pre-rendered Lab Test Booking Modal for static HTML */}
      <div id="static-lab-modal" className="modal-backdrop" style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(8px)', zIndex: 9999, alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '700px', padding: '32px', position: 'relative', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)', maxHeight: '90vh', overflowY: 'auto' }}>
          <button id="close-static-lab-modal" style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-app)', border: '1px solid var(--border)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
          
          <h3 id="static-lab-modal-title" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '20px' }}>Schedule Lab Test</h3>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px" }}>
              Select Visit Type
            </label>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="lab-visit-option active" style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary)', flex: 1, minWidth: '220px', cursor: 'pointer' }}>
                <b style={{ display: 'block', color: 'var(--primary-dark)', marginBottom: '4px', fontSize: '14px' }}>Home Sample Collection</b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>A phlebotomist will visit your home.</small>
              </div>
              <div className="lab-visit-option" style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1, minWidth: '220px', cursor: 'pointer' }}>
                <b style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>Visit Diagnostic Center</b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>Walk-in to the nearest partner lab.</small>
              </div>
            </div>
          </div>

          <div className="select-slot-container">
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>Select Collection Date & Time</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:30 PM"].map((t, idx) => (
                <button key={t} className={`time-slot-btn static-lab-slot ${idx === 1 ? 'active' : ''}`} style={{ padding: '10px', borderRadius: '8px', border: idx === 1 ? '2px solid var(--primary)' : '1px solid var(--border)', background: idx === 1 ? 'var(--primary)' : 'var(--bg-app)', color: idx === 1 ? '#fff' : 'var(--text-main)', fontWeight: '600', cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>

            <button id="confirm-static-lab-booking" className="btn btn-accent" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700', borderRadius: '12px' }}>
              Confirm Sample Collection Schedule →
            </button>
          </div>

        </div>
      </div>
      </div>
    </main>
  );
}

