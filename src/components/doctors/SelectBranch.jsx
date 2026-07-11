import { Building2, ChevronRight, Phone } from "lucide-react";

export default function SelectBranch({ branches, onSelect }) {
  return (
    <div className="select-branch-container">
      <p className="step-prompt">Choose a branch near you</p>
      <div className="branch-list">
        {branches.map((branch, i) => (
          <div key={i} className="branch-card" onClick={() => onSelect(branch)}>
            <div className="branch-card-header">
              <div className="branch-icon">
                <Building2 size={24} />
              </div>
              <div className="branch-info">
                <h4>{branch.name}</h4>
                <p>{branch.address}</p>
              </div>
              <ChevronRight className="branch-arrow" size={20} />
            </div>
            {branch.phone && (
              <div className="branch-card-footer">
                <Phone size={16} />
                <span>{branch.phone}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
