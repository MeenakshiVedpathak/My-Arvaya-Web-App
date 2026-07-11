import { Link } from "react-router-dom";
export default function Brand() {
  return (
    <Link className="brand" to="/" style={{ display: "flex", alignItems: "center" }}>
      <img src="/logo.png" alt="Arvaya Health & Wellness" style={{ height: "40px", mixBlendMode: "multiply" }} />
    </Link>
  );
}
