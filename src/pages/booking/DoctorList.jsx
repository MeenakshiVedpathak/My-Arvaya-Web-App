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
        
        setDoctors(allDocs);
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
      d.specialty?.toLowerCase().includes(q)
    );
  });

  return (
    <BookingLayout 
      currentStep={2} 
      title="Select a Doctor" 
      subtitle={`${bookingSpecialty}s at ${bookingHospital?.name}`}
    >
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', marginBottom: '32px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search doctors by name..." 
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', paddingLeft: '12px', color: 'var(--text-main)' }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {displayedDocs.map(doc => (
                <div 
                  key={doc.doctor_id || doc.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.border = '1px solid var(--border)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; }}
                >
                  
                  {/* Avatar */}
                  {doc.image && !doc.image.includes('ui-avatars') ? (
                    <img src={doc.image} alt={doc.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--bg-app)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {getInitials(doc.name)}
                    </div>
                  )}
                  
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>{doc.name}</h3>
                    <div style={{ marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <GraduationCap size={14} />
                      {doc.qualification || "M.B.B.S"}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
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
                      style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
              {displayedDocs.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No doctors found matching your search.
                </div>
              )}
            </div>
          )}
    </BookingLayout>
  );
}
