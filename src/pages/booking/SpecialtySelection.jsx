import { useState, useEffect } from "react";
import { Stethoscope, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../../services/dataService";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";

export default function SpecialtySelection() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { bookingHospital, bookingSpecialty, setBookingSpecialty } = useBooking();

  useEffect(() => {
    if (!bookingHospital) {
      navigate("/doctors");
      return;
    }

    async function loadSpecialties() {
      try {
        const res = await getDoctors({ pageSize: 200, location_key: bookingHospital.entitylocation });
        const docs = Array.isArray(res) ? res : (res.list || res.data || []);
        // Filter doctors by selected hospital
        const docsAtHospital = docs.filter(d => {
          const loc = d.locations && d.locations[0];
          const hospitalName = loc ? (loc.locname || loc.name || "") : "";
          return hospitalName === bookingHospital.name;
        });

        // Extract unique specialties
        const uniqueSpecialties = [...new Set(docsAtHospital.map(d => d.specialty).filter(Boolean))];
        uniqueSpecialties.sort((a, b) => a.localeCompare(b));
        
        // Ensure some specialties are available if mock data returns empty
        const fallback = [
          "General Physician", "Cardiologist", "Dermatologist", 
          "Pediatrician", "Orthopedic", "Gynecologist"
        ];

        setSpecialties(uniqueSpecialties.length > 0 ? uniqueSpecialties : fallback);
      } catch (err) {
        console.error("Error loading specialties", err);
      } finally {
        setLoading(false);
      }
    }
    loadSpecialties();
  }, [bookingHospital, navigate]);

  const handleSelect = (spec) => {
    setBookingSpecialty(spec);
  };

  const handleProceed = () => {
    if (bookingSpecialty) {
      navigate("/doctors/list");
    }
  };

  return (
    <BookingLayout 
      currentStep={1} 
      title="Select Specialty" 
      subtitle={`What do you need help with at ${bookingHospital?.name}?`}
    >

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              {specialties.map((spec) => {
                const isSelected = bookingSpecialty === spec;
                return (
                  <div 
                    key={spec}
                    onClick={() => handleSelect(spec)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '32px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-app)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-surface)' }}
                    onMouseOut={e => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-app)' }}
                  >
                    <Stethoscope size={16} color={isSelected ? "#fff" : "var(--text-muted)"} />
                    {spec}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px', alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              disabled={!bookingSpecialty}
              onClick={handleProceed}
              style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', opacity: bookingSpecialty ? 1 : 0.5 }}
            >
              Next Step <ArrowRight size={18} />
            </button>
          </div>
    </BookingLayout>
  );
}
