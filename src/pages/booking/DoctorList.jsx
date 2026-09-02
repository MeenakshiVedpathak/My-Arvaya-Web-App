import { useState, useEffect } from "react";
import { Search, GraduationCap, MapPin, Building2, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../../services/dataService";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";

export default function DoctorList() {
  const navigate = useNavigate();
  const { bookingHospital, bookingSpecialty, setDoctor } = useBooking();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    if (!bookingHospital || !bookingSpecialty) {
      navigate("/doctors/specialty");
      return;
    }
    
    async function fetchDocs() {
      try {
        setLoading(true);
        // Fetch docs for the selected hospital and specialty
        const res = await getDoctors({ 
          pageSize: 100, 
          location_key: bookingHospital.entitylocation,
          filter: bookingSpecialty 
        });
        const allDocs = Array.isArray(res) ? res : (res.list || res.data || []);
        // Filter by specialty and hospital city on frontend to ensure strict match
        const specialtyDocs = allDocs.filter(d => {
          const specialtyMatch = d.specialty === bookingSpecialty;
          
          let cityMatch = true;
          if (bookingHospital && bookingHospital.city) {
            const hospitalCity = bookingHospital.city.toLowerCase().trim();
            const docCity = (d.city || "").toLowerCase().trim();
            
            // Check if primary city matches or if any of the doctor's locations match
            cityMatch = (docCity === hospitalCity) || 
              (d.locations && d.locations.some(loc => (loc.city || "").toLowerCase().trim() === hospitalCity));
          }
          
          return specialtyMatch && cityMatch;
        });
        
        setDoctors(specialtyDocs);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [bookingHospital, bookingSpecialty, navigate]);

  const handleBook = (doc) => {
    setDoctor(doc);
    navigate("/doctors/visit-type");
  };

  const getInitials = (name) => {
    if (!name) return "DR";
    const cleanName = name.replace(/^Dr\.\s*/i, '').trim();
    if (!cleanName) return "DR";
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2 && parts[1].length > 0) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  const displayedDocs = doctors.filter(d => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.qualification?.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q)
    );
  });

  return (
    <BookingLayout 
      currentStep={2} 
      title="Select a Doctor" 
      subtitle={`${bookingSpecialty}s at ${bookingHospital?.name}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        
        {/* Fixed Search Box inside Step */}
        <div style={{ flexShrink: 0, marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <Search size={18} color="var(--primary)" />
            <input 
              type="text" 
              placeholder="Search doctors by name or qualification..." 
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', paddingLeft: '12px', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        {/* Scrollable Doctor Cards List */}
        <div className="styled-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '16px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="booking-doctor-grid">
              {displayedDocs.map(doc => (
                <div 
                  key={doc.doctor_id || doc.id} 
                  className="booking-doctor-card"
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(46, 102, 110, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'none'; }}
                >
                  
                  {/* Avatar */}
                  {doc.image && !doc.image.includes('ui-avatars') ? (
                    <img src={doc.image} alt={doc.name} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(46, 102, 110, 0.08)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--primary)', flexShrink: 0 }}>
                      {getInitials(doc.name)}
                    </div>
                  )}
                  
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{doc.name}</h3>
                    <div style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={13} color="var(--primary)" />
                      {doc.qualification || "M.B.B.S"}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>
                      {doc.specialty || bookingSpecialty}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {doc.consultationFee || `₹${doc.fee || 500}`}
                    </div>
                    <button 
                      onClick={() => handleBook(doc)}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}
                    >
                      Select <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                </div>
              ))}
              {displayedDocs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', width: '100%', padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No doctors found matching your search.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </BookingLayout>
  );
}
