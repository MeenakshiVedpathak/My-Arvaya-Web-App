import { useState, useEffect } from "react";
import { Search, ChevronRight, ThumbsUp, MapPin, Calendar, CheckCircle2, Clock, ShieldCheck, Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { getDoctors } from "../services/dataService";
import Avatar from "../components/common/Avatar";

export default function Doctors() {
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const routerLoc = useLocation();
  const searchParams = new URLSearchParams(routerLoc.search);
  const urlQ = searchParams.get("q") || "";
  const urlLoc = searchParams.get("loc") || "";

  const [q, setQ] = useState(urlQ);
  const [currentLoc, setCurrentLoc] = useState(urlLoc);

  useEffect(() => {
    if (urlQ !== q) setQ(urlQ);
    if (urlLoc !== currentLoc) setCurrentLoc(urlLoc);
  }, [urlQ, urlLoc]);

  const fetchDocs = async (page = 1, append = false, overrideFilter = null) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    
    const filterStr = overrideFilter !== null ? overrideFilter : `${q} ${currentLoc}`.trim();
    
    try {
      const res = await getDoctors({
        pageIndex: page,
        pageSize: 10,
        sortKey: "",
        sortValue: "desc",
        filter: filterStr
      });
      if (append) {
        setDoctorList(prev => [...prev, ...(res.list || [])]);
      } else {
        setDoctorList(res.list || []);
      }
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
    }
    
    if (append) setLoadingMore(false);
    else setLoading(false);
  };

  // Handle local search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageIndex(1);
      fetchDocs(1, false, `${q} ${currentLoc}`.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [q, currentLoc]);

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalCount / 10);
    if (newPage >= 1 && newPage <= totalPages) {
      setPageIndex(newPage);
      fetchDocs(newPage, false);
    }
  };
  
  const availableSpecialties = [
    "General Physician", "Physiotherapist", "Pulmonologist", 
    "Orthopaedic Surgeon", "Dietitian", "Urologist", 
    "Anesthesiologist", "Cardiologist", "Dermatologist", "Pediatrician"
  ];
  const availableGenders = ["M", "F"];
  const availableExperiences = ["0-5 Years", "5-10 Years", "10-15 Years", "15+ Years"];
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    type: [],
    fee: [],
    specialty: [],
    rating: []
  });
  const { setDoctor } = useBooking();
  const go = useNavigate();

  const handleFilterToggle = (category, value) => {
    setFilters(prev => {
      if(category === "gender") return { ...prev, gender: prev.gender === value ? "" : value };
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const handleSelect = (doc) => {
    setDoctor(doc);
    go("/doctor");
  };

  const filtered = doctorList.filter(d => {
    // Search query
    if (q && !d.name.toLowerCase().includes(q.toLowerCase()) && !d.specialty.toLowerCase().includes(q.toLowerCase())) return false;
    
    // Specialty filter
    if (filters.specialty.length > 0 && !filters.specialty.includes(d.specialty)) return false;
    
    // Gender filter
    if (filters.gender && d.gender !== filters.gender) return false;

    // Fee filter
    if (filters.fee.length > 0) {
      const match = filters.fee.some(f => {
        if(f === "Free") return d.fee === 0;
        if(f === "₹1 - ₹500") return d.fee > 0 && d.fee <= 500;
        if(f === "₹500+") return d.fee > 500;
        return false;
      });
      if(!match) return false;
    }

    // Rating filter
    if (filters.rating.length > 0) {
      const match = filters.rating.some(r => {
        if(r === "4.5+") return d.rating >= 4.5;
        if(r === "4.0+") return d.rating >= 4.0;
        return false;
      });
      if(!match) return false;
    }

    return true;
  });

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
            <div className="card-elevated styled-scrollbar" style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <b style={{ fontSize: '15px' }}>Filters</b>
                <span className="text-primary cursor-pointer" style={{ fontSize: '12px', fontWeight: '600' }} onClick={() => { setQ(""); setFilters({gender: "", type: [], fee: [], specialty: [], rating: []}); }}>RESET</span>
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
                    {availableGenders.length > 0 ? availableGenders.map(g => (
                      <button key={g} onClick={() => handleFilterToggle("gender", g)} className="badge" style={{ background: filters.gender === g ? 'var(--primary-light)' : 'var(--bg-app)', border: filters.gender === g ? '1px solid var(--primary)' : '1px solid var(--border)', padding: '6px 12px', fontWeight: filters.gender === g ? '600' : 'normal', color: filters.gender === g ? 'var(--primary)' : 'var(--text-main)', transition: 'all 0.2s', cursor: 'pointer' }}>{g === "M" ? "Male" : g === "F" ? "Female" : g}</button>
                    )) : <span className="text-muted" style={{ fontSize: '13px' }}>No data available</span>}
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Consultation Type</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.type.includes("In-Clinic")} onChange={() => handleFilterToggle("type", "In-Clinic")} /> In-Clinic Visit</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.type.includes("Video")} onChange={() => handleFilterToggle("type", "Video")} /> Video Consult</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Consultation Fee</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.fee.includes("Free")} onChange={() => handleFilterToggle("fee", "Free")} /> Free</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.fee.includes("₹1 - ₹500")} onChange={() => handleFilterToggle("fee", "₹1 - ₹500")} /> ₹1 - ₹500</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.fee.includes("₹500+")} onChange={() => handleFilterToggle("fee", "₹500+")} /> ₹500+</label>
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
                    {availableSpecialties.length > 0 ? availableSpecialties.map(spec => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={filters.specialty.includes(spec)} onChange={() => handleFilterToggle("specialty", spec)} /> {spec}
                      </label>
                    )) : <span className="text-muted">No data available</span>}
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Patient Rating</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.rating.includes("4.5+")} onChange={() => handleFilterToggle("rating", "4.5+")} /> 4.5+ ⭐</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.rating.includes("4.0+")} onChange={() => handleFilterToggle("rating", "4.0+")} /> 4.0+ ⭐</label>
                  </div>
                </div>

                <div>
                  <b className="text-main mb-3" style={{ fontSize: '14px', display: 'block' }}>Experience</b>
                  <div className="flex flex-col gap-2 text-muted" style={{ fontSize: '13px' }}>
                    {availableExperiences.length > 0 ? availableExperiences.map(exp => (
                      <label key={exp} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> {exp}</label>
                    )) : <span className="text-muted">No data available</span>}
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

          <div className="flex flex-col gap-4 styled-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '8px', paddingBottom: '16px' }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading doctors...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "white", borderRadius: "16px", border: "1px dashed var(--border)" }}>
                <Search size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p style={{ fontWeight: '600' }}>No doctors found</p>
                <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
              </div>
            ) : (
              filtered.map((d, idx) => (
              <article key={d.id} className="card-elevated doctor-card-main flex animate-fade-in-up" style={{ padding: '0', position: 'relative', borderLeft: `3px solid var(--primary)`, animationDelay: `${idx * 80}ms` }}>
                <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', width: '100%' }}>
                  
                  {/* Left: Avatar */}
                  <Avatar doctor={d} size="80px" />
                  
                  {/* Middle: Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                      <b className="text-primary cursor-pointer flex items-center gap-1" style={{ fontSize: '18px', transition: 'color 0.2s' }} onClick={() => handleSelect(d)} onMouseOver={e => e.currentTarget.style.textDecoration='underline'} onMouseOut={e => e.currentTarget.style.textDecoration='none'}>
                        {d.name}
                      </b>
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted" style={{ fontSize: '13px', flexWrap: 'wrap' }}>
                      {d.specialty && <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{d.specialty}</span>}
                      {d.hospital && <span className="flex items-center gap-1"><MapPin size={14} /> {d.hospital}{d.city ? `, ${d.city}` : ''}</span>}
                      {d.experience && d.experience !== "10+" && <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{d.experienceText}</span>}
                    </div>

                    {(d.rating || d.reviews) ? (
                      <div className="flex items-center gap-4 text-muted mt-1" style={{ fontSize: '12px', flexWrap: 'wrap' }}>
                        {d.rating && <span className="badge badge-success flex items-center gap-1" style={{ background: '#E4EEEF', color: '#2E666E', padding: '4px 8px' }}><ThumbsUp size={12} /> {Math.round(d.rating * 20)}%</span>}
                        {d.reviews && <span><b>{d.reviews}</b> Patient Stories</span>}
                      </div>
                    ) : null}
                  </div>

                  {/* Right: Booking & Price */}
                  <div className="doctor-card-right-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', borderLeft: '1px dashed var(--border)', paddingLeft: '24px', minWidth: '160px' }}>
                    <b style={{ fontSize: '22px', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>{d.consultationFee || 'Free'}</b>
                    <button className="btn btn-accent" onClick={() => handleSelect(d)} style={{ width: '100%', padding: '10px 16px', fontSize: '14px' }}>Book Visit</button>
                  </div>

                </div>
              </article>
            )))}
          </div>
          
          {totalCount > 10 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                className="btn" 
                disabled={pageIndex === 1 || loading}
                onClick={() => handlePageChange(pageIndex - 1)}
                style={{ padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: (pageIndex === 1 || loading) ? 'not-allowed' : 'pointer', opacity: (pageIndex === 1 || loading) ? 0.5 : 1 }}
              >Previous</button>
              
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>
                Page {pageIndex} of {Math.ceil(totalCount / 10)}
              </span>
              
              <button 
                className="btn btn-primary" 
                disabled={pageIndex === Math.ceil(totalCount / 10) || loading}
                onClick={() => handlePageChange(pageIndex + 1)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: (pageIndex === Math.ceil(totalCount / 10) || loading) ? 'not-allowed' : 'pointer', opacity: (pageIndex === Math.ceil(totalCount / 10) || loading) ? 0.5 : 1 }}
              >Next</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

