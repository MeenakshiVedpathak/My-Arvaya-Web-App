import { Heart, Headphones, ShieldCheck, Award } from "lucide-react";
export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #edf1f6", padding: "40px 0" }}>
      <div className="container footer" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        {[
          [Heart, "Emergency", "24x7 Assistance", "red"],
          [Headphones, "Support", "We're here to help", "orange"],
          [ShieldCheck, "Secure", "Your data is safe", "green"],
          [Award, "Trusted", "By millions of patients", "blue"],
        ].map(([I, a, b, color]) => (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className={`icon-circle ${color}`}>
              <I size={20} />
            </div>
            <span>
              <b style={{ fontSize: "14px", color: "#4e4e4d", display: "block" }}>{a}</b>
              <small style={{ fontSize: "12px", color: "#718096" }}>{b}</small>
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
}
