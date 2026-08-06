import { Info, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import BookingLayout from "../../components/layout/BookingLayout";

export default function VisitTypeSelection() {
  const navigate = useNavigate();
  const { doctor, bookingVisitType, setBookingVisitType } = useBooking();

  const handleSelect = (type) => {
    setBookingVisitType(type);
  };

  const handleProceed = () => {
    if (bookingVisitType) {
      navigate("/doctors/schedule");
    }
  };

  if (!doctor) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No doctor selected. Redirecting...</p>
        <button onClick={() => navigate("/doctors/list")} className="btn btn-primary">Go back</button>
      </div>
    );
  }

  return (
    <BookingLayout 
      currentStep={3} 
      title="Visit Type" 
      subtitle={`What type of visit is this for Dr. ${doctor.name}?`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        
        {/* Scrollable Content */}
        <div className="styled-scrollbar" style={{ flex: '0 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: '4px', paddingBottom: '8px' }}>
          <div className="booking-visittype-grid">
            
            {/* Option 1: Initial */}
            <div 
              onClick={() => handleSelect("Initial consultation")}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: bookingVisitType === "Initial consultation" ? '#F2F8F8' : 'var(--bg-surface)',
                border: bookingVisitType === "Initial consultation" ? '2px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: bookingVisitType === "Initial consultation" ? '0 4px 12px rgba(46, 102, 110, 0.12)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { if(bookingVisitType !== "Initial consultation") { e.currentTarget.style.borderColor = 'var(--primary)'; } }}
              onMouseOut={e => { if(bookingVisitType !== "Initial consultation") { e.currentTarget.style.borderColor = 'var(--border)'; } }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: bookingVisitType === "Initial consultation" ? '5px solid var(--primary)' : '2px solid var(--border)', background: '#fff', flexShrink: 0, transition: 'all 0.2s', marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '700', color: bookingVisitType === "Initial consultation" ? 'var(--primary-dark)' : 'var(--text-main)' }}>Initial consultation</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>First visit for a new concern or symptom.</p>
              </div>
            </div>

            {/* Option 2: Follow-up */}
            <div 
              onClick={() => handleSelect("Follow-up")}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: bookingVisitType === "Follow-up" ? '#F2F8F8' : 'var(--bg-surface)',
                border: bookingVisitType === "Follow-up" ? '2px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: bookingVisitType === "Follow-up" ? '0 4px 12px rgba(46, 102, 110, 0.12)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { if(bookingVisitType !== "Follow-up") { e.currentTarget.style.borderColor = 'var(--primary)'; } }}
              onMouseOut={e => { if(bookingVisitType !== "Follow-up") { e.currentTarget.style.borderColor = 'var(--border)'; } }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: bookingVisitType === "Follow-up" ? '5px solid var(--primary)' : '2px solid var(--border)', background: '#fff', flexShrink: 0, transition: 'all 0.2s', marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '700', color: bookingVisitType === "Follow-up" ? 'var(--primary-dark)' : 'var(--text-main)' }}>Follow-up</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Continuing care from a previous recent visit.</p>
              </div>
            </div>

          </div>

          {/* Info Alert */}
          <div style={{ padding: '10px 14px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Info size={16} color="#ea580c" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: '#9a3412', margin: 0, lineHeight: 1.4 }}>
              Select <strong>Follow-up Consultation</strong> only if you have consulted the same doctor within the last 7 days.
            </p>
          </div>
        </div>

        {/* Pinned Bottom Action Bar */}
        <div className="booking-action-bar">
          <div>
            {bookingVisitType ? (
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Selected: <strong style={{ color: 'var(--primary-dark)' }}>{bookingVisitType}</strong></span>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Choose visit type above to proceed</span>
            )}
          </div>

          <button 
            className="btn btn-primary"
            disabled={!bookingVisitType}
            onClick={handleProceed}
            style={{ 
              padding: '12px 28px', 
              fontSize: '15px', 
              fontWeight: '600',
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              opacity: bookingVisitType ? 1 : 0.5,
              cursor: bookingVisitType ? 'pointer' : 'not-allowed',
              boxShadow: bookingVisitType ? '0 4px 14px rgba(46, 102, 110, 0.25)' : 'none'
            }}
          >
            Next Step <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </BookingLayout>
  );
}
