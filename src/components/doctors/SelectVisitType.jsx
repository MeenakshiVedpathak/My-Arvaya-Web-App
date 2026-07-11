import { Circle, CircleDot } from "lucide-react";

export default function SelectVisitType({ 
  selected, 
  onSelect, 
  onContinue,
  options = [
    { id: "initial", title: "Initial consultation", desc: "First visit for a new concern or symptom" },
    { id: "followup", title: "Follow-up", desc: "Continuing care from a previous visit" },
    { id: "other", title: "Other", desc: "Review an existing diagnosis or treatment" },
  ]
}) {
  return (
    <div className="select-visit-type-container">
      <div className="visit-type-list">
        {options.map((opt) => {
          const isActive = selected === opt.id || selected === opt.title; // accommodate both
          return (
            <div 
              key={opt.id} 
              className={`visit-type-card ${isActive ? 'active' : ''}`} 
              onClick={() => onSelect(opt.id, opt.title)}
            >
              <div className="vt-radio">
                {isActive ? <CircleDot size={20} color="var(--primary)" /> : <Circle size={20} color="var(--border)" />}
              </div>
              <div className="vt-info">
                <h4>{opt.title}</h4>
                <p>{opt.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Optional Sticky Bottom Button */}
      {onContinue && (
        <div className="bottom-fixed-action">
          <button 
            className="pro-btn-primary wizard-action-btn" 
            disabled={!selected}
            onClick={onContinue}
          >
            See available doctors &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
