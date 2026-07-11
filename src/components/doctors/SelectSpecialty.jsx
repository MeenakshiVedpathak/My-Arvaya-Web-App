import { Stethoscope } from "lucide-react";

export default function SelectSpecialty({ specialties, onSelect }) {
  return (
    <div className="select-specialty-container">
      <p className="step-prompt">What do you need help with?</p>
      <div className="specialty-grid">
        {specialties.map((spec, i) => (
          <div key={i} className="specialty-card" onClick={() => onSelect(spec)}>
            <div className="specialty-icon">
              <Stethoscope size={24} />
            </div>
            <span>{spec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
