import { Search, ArrowLeft, ChevronRight } from "lucide-react";
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
    <main className="page">
      <div className="internal-page-hero">
        <div className="container">
          <div className="internal-breadcrumbs">
            <Link to="/">Home</Link> <ChevronRight size={14} /> <span>Lab Tests & Packages</span>
          </div>
          <h1 className="internal-hero-title">Book Lab Tests</h1>
          <p className="internal-hero-subtitle">Comprehensive health checkups at the comfort of your home.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '60px' }}>
        <div className="search wide" style={{ marginBottom: '32px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Search />
        <input 
          placeholder="Search for tests & packages..." 
          style={{ background: 'transparent' }} 
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          <div className="loading-spinner" />
          <p>Loading packages...</p>
        </div>
      ) : (
        <div className="doctorlist-grid">
          {filteredPackages.map((pkg) => (
            <article className="pro-card" key={pkg.title} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {pkg.img && <img src={pkg.img} alt={pkg.title} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '16px', color: 'var(--blue)' }}>{pkg.title}</b>
                </div>
                {pkg.tests && <small style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', display: 'block' }}>{pkg.tests}</small>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {pkg.price && <b style={{ fontSize: '16px', color: 'var(--blue)', marginRight: '8px' }}>{pkg.price}</b>}
                    {pkg.oldPrice && <s style={{ fontSize: '13px', color: 'var(--muted)' }}>{pkg.oldPrice}</s>}
                  </div>
                  <button 
                    className="primary" 
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filteredPackages.length === 0 && (
            <p style={{ color: "var(--muted)" }}>No packages found matching your criteria.</p>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <Modal 
        isOpen={!!selectedPackage} 
        onClose={() => setSelectedPackage(null)}
        title="Schedule Lab Test"
        maxWidth="700px"
      >
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }}>
            Select Visit Type
          </label>
          <div style={{ display: "flex", gap: "16px" }}>
            <label className="filter-radio-label" style={{ background: visitType === 'home' ? '#f0fdfa' : '#f8fafc', padding: '16px', borderRadius: '12px', border: visitType === 'home' ? '1px solid var(--primary)' : '1px solid #e2e8f0', flex: 1 }}>
              <input type="radio" name="labVisitType" value="home" checked={visitType === 'home'} onChange={() => setVisitType('home')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: 'var(--primary)', marginBottom: '4px' }}>Home Collection</b>
                <small style={{ color: '#64748b' }}>A phlebotomist will visit your home to collect samples.</small>
              </div>
            </label>
            <label className="filter-radio-label" style={{ background: visitType === 'lab' ? '#f0fdfa' : '#f8fafc', padding: '16px', borderRadius: '12px', border: visitType === 'lab' ? '1px solid var(--primary)' : '1px solid #e2e8f0', flex: 1 }}>
              <input type="radio" name="labVisitType" value="lab" checked={visitType === 'lab'} onChange={() => setVisitType('lab')} style={{ display: 'none' }} />
              <div>
                <b style={{ display: 'block', color: 'var(--primary)', marginBottom: '4px' }}>Visit Lab Center</b>
                <small style={{ color: '#64748b' }}>You will visit the nearest diagnostic center.</small>
              </div>
            </label>
          </div>
        </div>

        <SelectSlotUI onConfirm={confirmBooking} />
      </Modal>
      </div>
    </main>
  );
}
