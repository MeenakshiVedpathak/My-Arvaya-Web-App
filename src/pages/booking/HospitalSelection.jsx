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
              <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="104" height="100" viewBox="0 0 120 116" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <ellipse cx="60" cy="106" rx="48" ry="5" fill="var(--primary)" opacity="0.1" />

                  {/* left wing */}
                  <rect x="12" y="56" width="32" height="44" rx="3" fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="2.5" />
                  <rect x="8" y="48" width="40" height="11" rx="5.5" fill="var(--primary)" />
                  <rect x="21" y="63" width="18" height="10" rx="2" fill="#ffffff" stroke="var(--primary)" strokeWidth="1.5" />
                  <rect x="24" y="66.5" width="12" height="3" rx="1.5" fill="#bfe3ee" />
                  <rect x="21" y="78" width="18" height="10" rx="2" fill="#ffffff" stroke="var(--primary)" strokeWidth="1.5" />
                  <rect x="24" y="81.5" width="12" height="3" rx="1.5" fill="#bfe3ee" />

                  {/* right wing */}
                  <rect x="76" y="56" width="32" height="44" rx="3" fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="2.5" />
                  <rect x="72" y="48" width="40" height="11" rx="5.5" fill="var(--primary)" />
                  <rect x="81" y="63" width="18" height="10" rx="2" fill="#ffffff" stroke="var(--primary)" strokeWidth="1.5" />
                  <rect x="84" y="66.5" width="12" height="3" rx="1.5" fill="#bfe3ee" />
                  <rect x="81" y="78" width="18" height="10" rx="2" fill="#ffffff" stroke="var(--primary)" strokeWidth="1.5" />
                  <rect x="84" y="81.5" width="12" height="3" rx="1.5" fill="#bfe3ee" />

                  {/* center tower */}
                  <rect x="44" y="34" width="32" height="66" rx="3" fill="#ffffff" stroke="var(--primary)" strokeWidth="2.5" />
                  <rect x="40" y="24" width="40" height="13" rx="6.5" fill="var(--primary-dark)" />

                  {/* cross */}
                  <path d="M57 42 H63 V47.5 H68.5 V53.5 H63 V59 H57 V53.5 H51.5 V47.5 H57 Z" fill="var(--accent)" />

                  {/* signage lines */}
                  <rect x="52" y="64" width="16" height="2.6" rx="1.3" fill="var(--primary-light)" />
                  <rect x="52" y="70" width="16" height="2.6" rx="1.3" fill="var(--primary-light)" />

                  {/* glass door */}
                  <rect x="51" y="78" width="18" height="22" rx="1.5" fill="var(--primary-dark)" />
                  <rect x="53" y="80" width="6.5" height="18" rx="1" fill="#bfe3ee" />
                  <rect x="60.5" y="80" width="6.5" height="18" rx="1" fill="#bfe3ee" />
                </svg>
              </div>
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
