import Avatar from "../common/Avatar";
export default function Summary({ doctor, date, slot, action, onAction }) {
  const formattedDate = date && date instanceof Date 
    ? date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : "";

  return (
    <aside className="panel summary">
      <h3>Your appointment</h3>
      <div className="minidoc">
        <Avatar doctor={doctor} />
        <span>
          <b>{doctor.name}</b>
          <small>{doctor.specialty}</small>
        </span>
      </div>
      <Row a="Date" b={formattedDate} />
      <Row a="Time" b={slot} />
      <Row a="Mode" b="In-clinic" />
      <Row a="Consultation Fee" b={`₹${doctor.fee}`} />
      {action && (
        <button className="primary full" onClick={onAction}>
          {action}
        </button>
      )}
    </aside>
  );
}
function Row({ a, b }) {
  return (
    <div className="row">
      <span>{a}</span>
      <b>{b}</b>
    </div>
  );
}
