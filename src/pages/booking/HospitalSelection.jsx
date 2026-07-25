import { useState, useEffect } from "react";
import { Building2, ArrowRight, MapPin, Clock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getHospitalsForLocation } from "../../services/dataService";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";

export default function HospitalSelection() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { globalLocation, bookingHospital, setBookingHospital } = useBooking();

  useEffect(() => {
    async function loadHospitals() {
      if (!globalLocation || !globalLocation.entitylocation) {
        setHospitals([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const fetchedHospitals = await getHospitalsForLocation(globalLocation.entitylocation);
        setHospitals(fetchedHospitals || []);
      } catch (err) {
        console.error("Error loading hospitals", err);
      } finally {
        setLoading(false);
      }
    }
    loadHospitals();
  }, [globalLocation]);

  const handleSelect = (hospital) => {
    setBookingHospital(hospital);
  };

  const handleProceed = () => {
    if (bookingHospital) {
      navigate("/doctors/specialty");
    }
  };

  return (
    <BookingLayout 
      currentStep={0} 
      title="Select Hospital" 
      subtitle="Choose the clinic or hospital location you wish to visit."
    >

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : hospitals.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px', textAlign: 'center' }}>
              <img src="/empty_reports.png" alt="No Hospitals Found" style={{ width: '220px', opacity: 0.8 }} />
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>No Hospitals Found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>We couldn't find any hospitals for the selected location.</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {hospitals.map((hospital) => {
                  const isSelected = bookingHospital?.name === hospital.name;
                  return (
                    <div 
                      key={hospital.id}
                      onClick={() => handleSelect(hospital)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--primary-light)' : 'transparent',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={e => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-surface)' }}
                      onMouseOut={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isSelected ? 'var(--primary)' : 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                        <Building2 size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)' }}>{hospital.name}</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)' }}>{hospital.city}</p>
                      </div>
                      <div style={{ color: isSelected ? 'var(--primary)' : 'transparent', transition: 'color 0.2s' }}>
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Hospital Details Panel */}
              {bookingHospital && (
                <div className="animate-fade-in-up" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    <Building2 size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{bookingHospital.name}</h3>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '14px', flexWrap: 'wrap' }}>
                      {(bookingHospital.address || bookingHospital.address_line_1 || bookingHospital.address1) ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {bookingHospital.address || bookingHospital.address_line_1 || bookingHospital.address1}{bookingHospital.city ? `, ${bookingHospital.city}` : ''}</span>
                      ) : bookingHospital.city ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {bookingHospital.city}</span>
                      ) : null}
                      
                      {(bookingHospital.phone || bookingHospital.mobile || bookingHospital.contact_number || bookingHospital.phone_number || bookingHospital.mobile_number) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> {bookingHospital.phone || bookingHospital.mobile || bookingHospital.contact_number || bookingHospital.phone_number || bookingHospital.mobile_number}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <button 
              className="btn btn-primary"
              disabled={!bookingHospital}
              onClick={handleProceed}
              style={{ padding: '12px 32px', fontSize: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', opacity: bookingHospital ? 1 : 0.5 }}
            >
              Next Step <ArrowRight size={18} />
            </button>
          </div>
    </BookingLayout>
  );
}
