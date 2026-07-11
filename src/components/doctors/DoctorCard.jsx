import { Calendar } from "lucide-react";
import Avatar from "../common/Avatar";

export default function DoctorCard({ d, onClickBook }) {
  return (
    <article className="doctor-card-pro">
      <div className="dc-top">
        <Avatar doctor={d} big />
        <div className="dc-info">
          <b className="dc-name">{d.name}</b>
          {d.specialty && <span className="dc-badge">{d.specialty}</span>}
          {d.qualification && <span className="dc-text">🎓 {d.qualification}</span>}
          {d.hospital && <span className="dc-text">📍 {d.hospital}</span>}
        </div>
      </div>
      <div className="dc-bottom">
        <span className="dc-text">🏥 {d.hospital}</span>
        <button className="dc-book-btn" onClick={(e) => {
          e.stopPropagation();
          if (onClickBook) onClickBook();
        }}>
          <Calendar size={16} /> Book Now
        </button>
      </div>
    </article>
  );
}
