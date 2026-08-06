import { Building2, Stethoscope, User, FileText, CalendarDays, CheckCircle2, ClipboardCheck, ChevronRight } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 0, title: "Hospital", icon: Building2, path: "/doctors" },
  { id: 1, title: "Specialty", icon: Stethoscope, path: "/doctors/specialty" },
  { id: 2, title: "Doctor", icon: User, path: "/doctors/list" },
  { id: 3, title: "Type", icon: FileText, path: "/doctors/visit-type" },
  { id: 4, title: "Time", icon: CalendarDays, path: "/doctors/schedule" },
  { id: 5, title: "Review", icon: ClipboardCheck, path: "/doctors/review" },
];

export default function BookingLayout({ currentStep, title, subtitle, children }) {
  const { bookingHospital, bookingSpecialty, doctor, date, slot } = useBooking();
  const navigate = useNavigate();

  const handleStepClick = (step) => {
    if (step.id < currentStep) {
      navigate(step.path);
    }
  };

  const breadcrumbParts = [];
  if (bookingHospital && currentStep >= 1) breadcrumbParts.push({ label: bookingHospital.name, bold: false });
  if (bookingSpecialty && currentStep >= 2) breadcrumbParts.push({ label: bookingSpecialty, bold: false });
  if (doctor && currentStep >= 3) breadcrumbParts.push({ label: doctor.name, bold: true, color: 'var(--primary-dark)' });
  if (date && slot && currentStep >= 5) breadcrumbParts.push({ label: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${slot}`, bold: true, color: 'var(--primary)' });

  return (
    <main className="page booking-page-layout animate-fade-in-up">
      <div className="container booking-main-container">
        
        {/* Top Fixed Section: Stepper, Summary & Title */}
        <div style={{ flexShrink: 0, paddingBottom: '8px' }}>
          
          {/* Horizontal Progress Stepper */}
          <div className="booking-stepper">
            {/* Connecting Line */}
            <div className="booking-stepper-line" />
            
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;
              const canClick = step.id < currentStep;
              
              let iconBg = 'var(--bg-app)';
              let iconColor = 'var(--text-muted)';
              let iconBorder = '2px solid var(--border)';
              
              if (isCompleted) {
                iconBg = 'var(--primary)';
                iconColor = '#fff';
                iconBorder = '2px solid var(--primary)';
              } else if (isCurrent) {
                iconBg = 'var(--bg-surface)';
                iconColor = 'var(--primary)';
                iconBorder = '2px solid var(--primary)';
              }

              return (
                <div 
                  key={step.id} 
                  onClick={() => handleStepClick(step)}
                  className="booking-step-item"
                  style={{ 
                    cursor: canClick ? 'pointer' : 'default',
                    opacity: (isCompleted || isCurrent) ? 1 : 0.45
                  }}
                >
                  <div className="booking-step-icon" style={{ background: iconBg, border: iconBorder, color: iconColor }}>
                    {isCompleted ? <CheckCircle2 size={15} /> : <Icon size={14} />}
                  </div>
                  <div className="booking-step-title" style={{ fontWeight: isCurrent ? '700' : '600', color: isCurrent ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Summary Pill */}
          {breadcrumbParts.length > 0 && currentStep < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 18px', borderRadius: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-main)', flexWrap: 'wrap' }}>
                {breadcrumbParts.map((p, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {i > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
                    <span style={{ fontWeight: p.bold ? '700' : '600', color: p.color || 'inherit' }}>{p.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Header Title & Subtitle */}
          <div style={{ textAlign: 'center' }}>
            <h1 className="booking-header-title">
              {title}
            </h1>
            {subtitle && (
              <p className="booking-header-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable & Pinned Step Content Area */}
        <div className="booking-content-area">
          {children}
        </div>

      </div>
    </main>
  );
}
