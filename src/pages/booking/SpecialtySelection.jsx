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
        // Filter doctors by selected hospital name and city
        const docsAtHospital = docs.filter(d => {
          const loc = d.locations && d.locations[0];
          const hospitalName = loc ? (loc.locname || loc.name || "") : "";
          
          const nameMatch = hospitalName === bookingHospital.name;
          
          let cityMatch = true;
          if (bookingHospital && bookingHospital.city) {
            const hospitalCity = bookingHospital.city.toLowerCase().trim();
            const docCity = (d.city || "").toLowerCase().trim();
            cityMatch = (docCity === hospitalCity) || 
              (d.locations && d.locations.some(l => (l.city || "").toLowerCase().trim() === hospitalCity));
          }
          
          return nameMatch && cityMatch;
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        
        {/* Scrollable Specialties Content */}
        <div className="styled-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '12px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="booking-specialty-container">
              {specialties.map((spec) => {
                const isSelected = bookingSpecialty === spec;
                return (
                  <div 
                    key={spec}
                    onClick={() => handleSelect(spec)}
                    className={`booking-specialty-chip ${isSelected ? 'selected' : ''}`}
                    onMouseOver={e => { if(!isSelected) { e.currentTarget.style.background = '#F2F8F8'; e.currentTarget.style.borderColor = 'var(--primary)'; } }}
                    onMouseOut={e => { if(!isSelected) { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
                  >
                    <Stethoscope size={16} color={isSelected ? "#fff" : "var(--primary)"} />
                    {spec}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned Bottom Action Bar */}
        <div className="booking-action-bar">
          <div>
            {bookingSpecialty ? (
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Selected: <strong style={{ color: 'var(--primary-dark)' }}>{bookingSpecialty}</strong></span>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Choose a specialty above to proceed</span>
            )}
          </div>

          <button 
            className="btn btn-primary"
            disabled={!bookingSpecialty}
            onClick={handleProceed}
            style={{ 
              padding: '12px 28px', 
              fontSize: '15px', 
              fontWeight: '600',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: bookingSpecialty ? 1 : 0.5,
              cursor: bookingSpecialty ? 'pointer' : 'not-allowed',
              boxShadow: bookingSpecialty ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none'
            }}
          >
            Next Step <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </BookingLayout>
  );
}
