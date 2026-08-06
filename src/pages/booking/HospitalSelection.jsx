import { useState, useEffect } from "react";
import { Building2, ArrowRight, MapPin, Phone, CheckCircle2, ShieldCheck } from "lucide-react";
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
      title="Select Hospital & Clinic Location" 
      subtitle="Choose your preferred medical center to view available specialists and book an appointment."
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        
        {/* Scrollable Hospital List Content */}
        <div className="styled-scrollbar" style={{ flex: '0 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '8px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : hospitals.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '16px', textAlign: 'center' }}>
              <img src="/empty_reports.png" alt="No Hospitals Found" style={{ width: '180px', opacity: 0.8 }} />
              <div>
                <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '6px' }}>No Hospitals Found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '320px', margin: '0 auto' }}>We couldn't find any hospitals for the selected location.</p>
              </div>
            </div>
          ) : (
            <div className="booking-hospital-grid">
              {hospitals.map((hospital) => {
                const isSelected = bookingHospital?.name === hospital.name;
                const addressText = hospital.address || hospital.address_line_1 || hospital.address1 || hospital.city || "Kolhapur";
                const phoneText = hospital.phone || hospital.mobile || hospital.contact_number || hospital.phone_number || hospital.mobile_number;

                return (
                  <div 
                    key={hospital.id || hospital.name}
                    onClick={() => handleSelect(hospital)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      background: isSelected ? '#F2F8F8' : 'var(--bg-surface)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      boxShadow: isSelected ? '0 4px 16px rgba(46, 102, 110, 0.12)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}
                    onMouseOver={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(46, 102, 110, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.02)';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    {/* Top Row: Icon, Title & Radio Selection */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: isSelected ? 'var(--primary)' : 'rgba(46, 102, 110, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : 'var(--primary)', flexShrink: 0, transition: 'all 0.2s' }}>
                        <Building2 size={20} />
                      </div>
                      
                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--primary)', background: 'rgba(46, 102, 110, 0.1)', padding: '1px 6px', borderRadius: '10px' }}>
                            <ShieldCheck size={10} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
                            Verified Facility
                          </span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)', lineHeight: 1.25 }}>
                          {hospital.name}
                        </h4>
                      </div>

                      {/* Selection Radio Badge */}
                      <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: isSelected ? '5px solid var(--primary)' : '2px solid var(--border)', background: '#fff', transition: 'all 0.2s' }} />
                      </div>
                    </div>

                    {/* Bottom Metadata: Address & Phone */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed var(--border)', paddingTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{addressText}</span>
                      </div>
                      
                      {phoneText && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
                          <span>{phoneText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned Action Bar */}
        <div className="booking-action-bar">
          <div>
            {bookingHospital ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Selected: <strong style={{ color: 'var(--primary-dark)' }}>{bookingHospital.name}</strong></span>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select a hospital location above to proceed</span>
            )}
          </div>

          <button 
            className="btn btn-primary"
            disabled={!bookingHospital}
            onClick={handleProceed}
            style={{ 
              padding: '12px 28px', 
              fontSize: '15px', 
              fontWeight: '600',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: bookingHospital ? 1 : 0.5,
              cursor: bookingHospital ? 'pointer' : 'not-allowed',
              boxShadow: bookingHospital ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none'
            }}
          >
            Next Step <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </BookingLayout>
  );
}
