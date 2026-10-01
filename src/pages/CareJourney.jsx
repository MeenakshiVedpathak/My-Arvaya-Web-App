import { ChevronLeft, Building2, AlertTriangle, Activity, ChevronRight, CalendarCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CareJourney() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)', minHeight: '100vh', position: 'relative' }}>
      {/* HEADER HERO */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} className="hover-glow" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '6px 12px', fontSize: '13px', fontWeight: '700', borderRadius: '8px' }}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            {/* PATIENT INFO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', flexShrink: 0, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                SM
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0', textTransform: 'uppercase', lineHeight: 1.2 }}>Mrs. Shoba Manjunath Madiwalar</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <span>29 yrs</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                  <span>Female</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                  <span style={{ color: 'var(--text-main)', background: 'var(--bg-app)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>UHID: 1072</span>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: '#eef4fd', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '10px', color: '#1565c0', boxShadow: '0 2px 8px rgba(21,101,192,0.1)' }}>
                  <Building2 size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#1565c0', lineHeight: 1 }}>1</div>
                  <div style={{ fontSize: '12px', color: '#1565c0', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Visits</div>
                </div>
              </div>
              
              <div style={{ background: '#fdeded', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '10px', color: '#c62828', boxShadow: '0 2px 8px rgba(198,40,40,0.1)' }}>
                  <AlertTriangle size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#c62828', lineHeight: 1 }}>0</div>
                  <div style={{ fontSize: '12px', color: '#c62828', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical Records</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 0 100px', display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '48px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: VISITS */}
        <aside style={{ position: 'sticky', top: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Visits</h3>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-light)', padding: '6px 14px', borderRadius: '20px' }}>1 Total</span>
          </div>

          <div className="card hover-glow" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarCheck size={28} strokeWidth={2} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0' }}>Thu, Mar 26, 2026</h4>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '0 0 20px 0', fontWeight: '600' }}>Cardiology Department</p>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1565c0', background: '#eef4fd', padding: '8px 14px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                   <Activity size={16} /> Latest Visit
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: CARE JOURNEY TIMELINE */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Care Journey Documents</h3>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2e7d32', background: '#e8f5e9', padding: '6px 14px', borderRadius: '20px' }}>24 Documents</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Timeline Item 1 */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '64px', flexShrink: 0 }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>26</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', margin: '6px 0 20px', textAlign: 'center' }}>Mar<br/>2026</div>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ed6c02', marginBottom: '12px', boxShadow: '0 0 0 6px #fff3e0' }}></div>
                <div style={{ width: '2px', flex: 1, background: 'var(--border)' }}></div>
              </div>
              <div className="card hover-glow" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', flex: 1, marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#1b5e20', background: '#e8f5e9', padding: '8px 16px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admission Slip</span>
                  <button onClick={() => setIsModalOpen(true)} className="btn hover-glow" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', color: '#ed6c02', fontSize: '14px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '10px 16px', borderRadius: '12px' }}>
                    View Document <ChevronRight size={18} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Cardiology</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Dr. Seema</div>
                  </div>
                </div>
                
                <div style={{ padding: '20px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontWeight: '500' }}>
                    This document is an admission slip for Mrs. Shobha Manjunath Madiwalar. She was admitted to the Cardiology department under the care of Dr. Seema on March 26, 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '64px', flexShrink: 0 }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>26</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', margin: '6px 0 20px', textAlign: 'center' }}>Mar<br/>2026</div>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ed6c02', marginBottom: '12px', boxShadow: '0 0 0 6px #fff3e0' }}></div>
                <div style={{ width: '2px', flex: 1, background: 'var(--border)' }}></div>
              </div>
              <div className="card hover-glow" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', flex: 1, marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#1b5e20', background: '#e8f5e9', padding: '8px 16px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MRD Deficiency Checklist</span>
                  <button onClick={() => setIsModalOpen(true)} className="btn hover-glow" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', color: '#ed6c02', fontSize: '14px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '10px 16px', borderRadius: '12px' }}>
                    View Document <ChevronRight size={18} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Cardiology</div>
                  </div>
                </div>
                
                <div style={{ padding: '20px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontWeight: '500' }}>
                    This document is an MRD deficiency checklist for Mrs. Shobha Manjunath Madiwalar. It notes the required medical records documentation that is currently pending or deficient.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '64px', flexShrink: 0 }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>25</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', margin: '6px 0 20px', textAlign: 'center' }}>Mar<br/>2026</div>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--text-muted)', marginBottom: '12px', boxShadow: '0 0 0 6px var(--border)' }}></div>
              </div>
              <div className="card hover-glow" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#1b5e20', background: '#e8f5e9', padding: '8px 16px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nursing Notes</span>
                  <button onClick={() => setIsModalOpen(true)} className="btn hover-glow" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', color: '#ed6c02', fontSize: '14px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '10px 16px', borderRadius: '12px' }}>
                    View Document <ChevronRight size={18} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Cardiology</div>
                  </div>
                </div>
                
                <div style={{ padding: '20px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontWeight: '500' }}>
                    This document contains nursing assessment notes taken during admission triage. Patient vitals were stable and initial history was recorded.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in-up" style={{ background: '#ffffff', width: '100%', maxWidth: '850px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '95vh', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1a1a1a', padding: '4px' }}>
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>Report Details</h2>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#2a7c88', fontSize: '14px', fontWeight: '500' }}>Report Date :</span>
                  <span style={{ color: '#333333', fontSize: '14px', fontWeight: '400' }}>Thu, Mar 26, 2026</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#2a7c88', fontSize: '14px', fontWeight: '500' }}>Department :</span>
                  <span style={{ color: '#333333', fontSize: '14px', fontWeight: '400' }}>Cardiology</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#2a7c88', fontSize: '14px', fontWeight: '500' }}>Document Type :</span>
                  <span style={{ color: '#333333', fontSize: '14px', fontWeight: '400', textTransform: 'uppercase' }}>Radiology Reports</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#2a7c88', fontSize: '14px', fontWeight: '500' }}>Doctor Name :</span>
                  <span style={{ color: '#333333', fontSize: '14px', fontWeight: '400' }}>Dr. Vishwanath Kumbar</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#90a4ae', fontWeight: '700', fontSize: '13px' }}>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-gray-700">Previous</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-gray-700">Next</span>
              </div>

              {/* Report Image Placeholder */}
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: '#fcfcfc', minHeight: '600px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                {/* A simulated document image look */}
                <div style={{ padding: '32px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#444' }}>Radiology Reports</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#111', lineHeight: 1 }}>SeCURE<br/><span style={{ fontSize: '10px', fontWeight: '600' }}>HOSPITALS</span></div>
                  </div>
                  <hr style={{ borderTop: '2px solid #333' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: '#333' }}>
                    <span>Patient Name: Smt. Shobha Manjunath Madiwalar</span>
                    <span>Age/Sex: 29Y/F</span>
                    <span>ID. NO -1072</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: '#333' }}>
                    <span>Referred By: Dr. Seema Bhairi</span>
                    <span>Date: 26/03/2026</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', marginTop: '10px', textDecoration: 'underline' }}>
                    OBSTETRIC ULTRA SOUND REPORT<br/>(GROWTH SCAN)
                  </div>
                  <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.6, flex: 1 }}>
                    <p><strong>Single, intra uterine foetus with cephalic presentation (at the time of scan) noted.</strong></p>
                    <p><strong>FETAL MEASUREMENTS</strong><br/>
                    BPD Measures &nbsp;&nbsp;&nbsp;&nbsp; 8.53 cms &nbsp;&nbsp;&nbsp;&nbsp; Corresponding to 34 weeks 3 days<br/>
                    Foetal H.C. Measured &nbsp;&nbsp;&nbsp;&nbsp; 30.88 cms &nbsp;&nbsp;&nbsp;&nbsp; Corresponding to 34 weeks 3 days<br/>
                    A.C. Measured &nbsp;&nbsp;&nbsp;&nbsp; 30.15 cms &nbsp;&nbsp;&nbsp;&nbsp; Corresponding to 34 weeks 1 days<br/>
                    Foetal Femur Measured &nbsp;&nbsp;&nbsp;&nbsp; 6.59 cms &nbsp;&nbsp;&nbsp;&nbsp; Corresponding to 34 weeks 0 days
                    </p>
                    <p><strong>Expected Due Date of Delivery: 05/05/2026</strong><br/>
                    <strong>Fetal weight: 2355 +/- 349 Gms.</strong><br/>
                    <strong>Average ultrasound age (AUA) : 34 Weeks 2 Days.</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
