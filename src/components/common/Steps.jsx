export default function Steps({ current, total = 4 }) {
  // Render horizontal dots like screenshot
  // • ─ • ─ • ─ •
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(
      <div key={`dot-${i}`} className={`progress-dot ${i <= current ? 'active' : ''}`} />
    );
    if (i < total - 1) {
      dots.push(
        <div key={`line-${i}`} className={`progress-line ${i < current ? 'active' : ''}`} />
      );
    }
  }

  return (
    <div className="wizard-progress-bar">
      {dots}
    </div>
  );
}
