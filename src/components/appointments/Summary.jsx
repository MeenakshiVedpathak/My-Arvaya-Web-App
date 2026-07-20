import Avatar from "../common/Avatar";

export default function Summary({ doctor, date, slot, action, onAction }) {
  const formattedDate = date && date instanceof Date
    ? date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : "";

  return (
    <aside className="card-elevated" style={{ padding: '24px', background: 'var(--bg-surface)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 24px 0' }}>Booking Summary</h3>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <Avatar doctor={doctor} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <b style={{ fontSize: '15px', color: 'var(--text-main)' }}>{doctor.name}</b>
          <small style={{ fontSize: '13px', color: 'var(--muted)' }}>{doctor.specialty}</small>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <Row a="Date" b={formattedDate || "--"} />
        <Row a="Time" b={slot || "--"} />
        <Row a="Consultation Mode" b="In-clinic" />
        <Row a="Consultation Fee" b={`₹${doctor.fee || "TBD"}`} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>Total Payable</span>
        <b style={{ fontSize: '20px', color: 'var(--text-main)' }}>₹{doctor.fee || "0"}</b>
      </div>

      {action && (
        <button
          className="btn hover-glow"
          onClick={onAction}
          disabled={!date || !slot}
          style={{
            background: (!date || !slot) ? 'var(--bg-app)' : 'var(--primary)',
            color: (!date || !slot) ? 'var(--muted)' : '#fff',
            border: 'none',
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: (!date || !slot) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {action}
        </button>
      )}
    </aside>
  );
}

function Row({ a, b }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
      <span style={{ color: 'var(--muted)' }}>{a}</span>
      <b style={{ color: 'var(--text-main)', fontWeight: '600' }}>{b}</b>
    </div>
  );
}
