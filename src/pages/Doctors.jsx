import { useState } from "react";
import { Search, ChevronRight, ThumbsUp, MapPin, Calendar, CheckCircle2, Clock, ShieldCheck, Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { doctors } from "../mocks/data";
import Avatar from "../components/common/Avatar";

export default function Doctors() {
  const [q, setQ] = useState("");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const { setDoctor } = useBooking();
  const go = useNavigate();

  const handleSelect = (doc) => {
    setDoctor(doc);
    go("/doctor");
  };

  const filtered = q
    ? doctors.filter(d => d.name.toLowerCase().includes(q.toLowerCase()) || d.specialty.toLowerCase().includes(q.toLowerCase()))
    : doctors;

  return (
    <main className="page page-enter" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Breadcrumb & Title ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Doctors in Bangalore</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Top Doctors to Consult in Bangalore</h1>
        </div>
      </div>

      <style>{`
        .doctors-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
        @media (max-width: 768px) { .doctors-layout { grid-template-columns: 1fr; } }
        .doctor-card-main { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border-left: 4px solid transparent; }
        .doctor-card-main:hover { border-left-color: var(--primary); box-shadow: 0 8px 24px rgba(46, 102, 110, 0.12); transform: translateY(-2px); }
      `}</style>

      <div className="container doctors-layout" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
        
        {/* Mobile Filter Toggle */}
        <button className="mobile-filter-toggle" onClick={() => setShowFiltersMobile(!showFiltersMobile)}>
          <span className="flex items-center gap-2"><SlidersHorizontal size={16} color="var(--primary)" /> Filter & Search Doctors</span>
          <ChevronDown size={18} style={{ transform: showFiltersMobile ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* ── Sidebar Filters ── */}
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
                      placeholder="Search doctor or specialty..." 
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
                
                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Gender</b>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <button className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '6px 12px', fontWeight: 'normal', color: 'var(--text-main)', transition: 'all 0.2s', cursor: 'pointer' }}>Male Doctor</button>
                    <button className="badge" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '6px 12px', fontWeight: 'normal', color: 'var(--text-main)', transition: 'all 0.2s', cursor: 'pointer' }}>Female Doctor</button>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Consultation Type</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> In-Clinic Visit</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Video Consult</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Consultation Fee</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Free</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> ₹1 - ₹500</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> ₹500+</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Availability</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Available Today</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Available Tomorrow</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Next 7 Days</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Specialty</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> General Physician</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Cardiologist</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Dermatologist</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Pediatrician</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Experience</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> 0-5 Years</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> 5-10 Years</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> 10-15 Years</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> 15+ Years</label>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Doctor List ── */}
        <section>
          <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <p className="text-main" style={{ fontSize: '14px', fontWeight: '600' }}>{filtered.length} Doctors available in Bangalore</p>
            <div className="flex items-center gap-2">
              <span className="text-muted" style={{ fontSize: '13px' }}>Sort By:</span>
              <select className="input-field" style={{ width: 'auto', padding: '6px 12px', height: 'auto', borderRadius: 'var(--radius-sm)' }}>
                <option>Relevance</option>
                <option>Experience - High to Low</option>
                <option>Fee - Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filtered.map((d, idx) => (
              <article key={d.id} className="card-elevated doctor-card-main flex animate-fade-in-up" style={{ padding: '0', position: 'relative', borderLeft: `3px solid var(--primary)`, animationDelay: `${idx * 80}ms` }}>
                <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', width: '100%' }}>
                  
                  {/* Left: Avatar */}
                  <Avatar doctor={d} size="80px" />
                  
                  {/* Middle: Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                      <b className="text-primary cursor-pointer flex items-center gap-1" style={{ fontSize: '18px', transition: 'color 0.2s' }} onClick={() => handleSelect(d)} onMouseOver={e => e.currentTarget.style.textDecoration='underline'} onMouseOut={e => e.currentTarget.style.textDecoration='none'}>
                        {d.name} <CheckCircle2 size={16} className="text-success" title="Medical Registration Verified" />
                      </b>
                      <div style={{ fontSize: '11px', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <ShieldCheck size={12}/> Medical Reg Verified
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted" style={{ fontSize: '13px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{d.specialty}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {d.hospital}, Bangalore</span>
                      <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{d.experience} Exp.</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted mt-1" style={{ fontSize: '12px', flexWrap: 'wrap' }}>
                      <span className="badge badge-success flex items-center gap-1" style={{ background: '#E4EEEF', color: '#2E666E', padding: '4px 8px' }}><ThumbsUp size={12} /> {Math.round(d.rating * 20)}%</span>
                      <span><b>{d.reviews}</b> Patient Stories</span>
                    </div>
                  </div>

                  {/* Right: Booking & Price */}
                  <div className="doctor-card-right-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px dashed var(--border)', paddingLeft: '24px', minWidth: '160px' }}>
                    <div className="flex items-center gap-1 mb-2" style={{ fontSize: '12px', color: 'var(--success)' }}>
                      <span className="pulse-dot" style={{ width: '6px', height: '6px' }} /> Available Today
                    </div>
                    <b style={{ fontSize: '22px', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>₹{d.fee}</b>
                    <button className="btn btn-accent" onClick={() => handleSelect(d)} style={{ width: '100%', padding: '10px 16px', fontSize: '14px' }}>Book Visit</button>
                  </div>

                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

