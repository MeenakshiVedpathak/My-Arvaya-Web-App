import { Search, ChevronRight, Activity, FlaskConical, Clock, Heart, ShieldCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLabPackages } from "../services/dataService";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import SelectSlotUI from "../components/doctors/SelectSlotUI";
import Modal from "../components/common/Modal";

export default function Labs() {
  const go = useNavigate();
  const { setBookingType, setLabPackage, setDate, setSlot, setBookingId } = useBooking();
  const { user, openLoginModal } = useAuth();
  
  // Data State
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Booking Modal State
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [visitType, setVisitType] = useState("home"); // home or lab

  useEffect(() => {
    getLabPackages().then(data => {
      setPackages(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => pkg.title.toLowerCase().includes(q.toLowerCase()));
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
    <main className="page" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>Lab Tests & Packages</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Diagnostic Tests & Packages</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Safe, secure, and accurate home sample collection</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px', paddingTop: '24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        
        {/* ── Sidebar ── */}
        <aside>
          <div className="card mb-4" style={{ padding: '16px' }}>
             <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Search Tests</h3>
             <div className="flex items-center gap-2" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
               <Search size={16} className="text-muted" />
               <input 
                 placeholder="Search by test name..." 
                 value={q}
                 onChange={(e) => setQ(e.target.value)}
                 style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
               />
             </div>
          </div>
          
          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Browse by Organs</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-main" style={{ fontSize: '13px' }}><input type="checkbox"/> <Heart size={14} className="text-accent"/> Heart</label>
              <label className="flex items-center gap-2 cursor-pointer text-main" style={{ fontSize: '13px' }}><input type="checkbox"/> <Activity size={14} className="text-primary"/> Liver</label>
              <label className="flex items-center gap-2 cursor-pointer text-main" style={{ fontSize: '13px' }}><input type="checkbox"/> <FlaskConical size={14} className="text-muted"/> Kidney</label>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-md flex items-start gap-3" style={{ background: 'var(--success-bg)', border: '1px solid #bbf7d0' }}>
            <ShieldCheck size={24} className="text-success" />
            <div>
              <b style={{ fontSize: '13px', display: 'block', color: 'var(--success)' }}>100% Safe & Hygienic</b>
              <span className="text-muted" style={{ fontSize: '11px' }}>Phlebotomists follow strict safety protocols</span>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <section>
          {loading ? (
            <div className="text-center text-muted" style={{ padding: "60px 0" }}>
              <div className="loading-spinner mb-4" />
              <p>Loading packages...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredPackages.map((pkg) => (
                <article className="card card-hover flex flex-col" key={pkg.title} style={{ padding: '20px' }}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: 1.3, fontWeight: '700' }}>{pkg.title}</h3>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <span className="badge badge-success" style={{ background: '#e0f2fe', color: '#0284c7' }}><Activity size={12}/> {pkg.tests || "30+ Tests"}</span>
                    <span className="badge" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)' }}><Clock size={12}/> 24 Hrs Report</span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-auto" style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                    <div>
                      {pkg.oldPrice && <span className="text-muted" style={{ fontSize: '12px', display: 'flex', gap: '4px' }}><s>{pkg.oldPrice}</s> <b className="text-success">{pkg.discount}</b></span>}
                      {pkg.price && <b style={{ fontSize: '20px', color: 'var(--text-main)', display: 'block' }}>{pkg.price}</b>}
                    </div>
                    <button 
                      className="btn btn-accent"
                      onClick={() => setSelectedPackage(pkg)}
                      style={{ padding: '10px 20px' }}
                    >
                      Book
                    </button>
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

      {/* Booking Modal */}
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
          <div className="flex gap-4">
            <label style={{ background: visitType === 'home' ? 'var(--primary-light)' : 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: visitType === 'home' ? '2px solid var(--primary)' : '1px solid var(--border)', flex: 1, cursor: 'pointer', transition: 'all 0.2s' }}>
              <input type="radio" name="labVisitType" value="home" checked={visitType === 'home'} onChange={() => setVisitType('home')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: visitType === 'home' ? 'var(--primary-dark)' : 'var(--text-main)', marginBottom: '4px', fontSize: '14px' }}>Home Sample Collection</b>
                <small className="text-muted" style={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>A phlebotomist will visit your home.</small>
              </div>
            </label>
            <label style={{ background: visitType === 'lab' ? 'var(--primary-light)' : 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: visitType === 'lab' ? '2px solid var(--primary)' : '1px solid var(--border)', flex: 1, cursor: 'pointer', transition: 'all 0.2s' }}>
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
      </div>
    </main>
  );
}
