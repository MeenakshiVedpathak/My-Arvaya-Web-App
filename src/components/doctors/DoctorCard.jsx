import { Calendar } from "lucide-react";
import Avatar from "../common/Avatar";

export default function DoctorCard({ d, onClickBook }) {
  return (
    <article className="doctor-card-pro" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '20px', 
      padding: '20px',
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '16px',
      boxShadow: '0 1px 4px rgba(46, 125, 123, 0.05)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(46, 125, 123, 0.1)';
      e.currentTarget.style.borderColor = 'var(--primary-light)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 1px 4px rgba(46, 125, 123, 0.05)';
      e.currentTarget.style.borderColor = '#e2e8f0';
    }}
    >
      <Avatar doctor={d} big />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <b style={{ fontSize: '18px', color: '#0f172a' }}>{d.name}</b>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {d.specialty && <span style={{ background: '#e6f4f1', color: 'var(--primary)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>{d.specialty}</span>}
          {d.qualification && <span style={{ fontSize: '13px', color: '#64748b' }}>🎓 {d.qualification}</span>}
        </div>
        {d.hospital && <span style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>📍 {d.hospital}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        <button style={{ 
          background: 'var(--primary)', 
          color: '#fff', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          fontWeight: '600', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(46, 125, 123, 0.2)'
        }} onClick={(e) => {
          e.stopPropagation();
          if (onClickBook) onClickBook();
        }}>
          <Calendar size={18} /> Book Appointment
        </button>
      </div>
    </article>
  );
}
