import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Phone, Calendar, ArrowRight, Droplet } from "lucide-react";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState("Mrs.");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Female");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [phone, setPhone] = useState(() => searchParams.get("phone") || "");

  const { register, loading, error, setError } = useAuth();
  const go = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Please enter your First Name");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your Last Name");
      return;
    }
    if (!gender) {
      setError("Please select your Gender");
      return;
    }
    if (!dob) {
      setError("Please select your Date of Birth");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your Phone Number");
      return;
    }

    const fullName = `${title}${firstName.trim()} ${lastName.trim()}`;
    const genderCode = gender === "Female" ? "F" : gender === "Male" ? "M" : "O";

    const ok = await register({ 
      name: fullName,
      gender: genderCode, 
      date_of_birth: dob, 
      mobile_number: phone.trim(),
      blood_group: bloodGroup
    });
    if (ok) go("/");
  }

  const inputWrap = {
    display: "flex", alignItems: "center", gap: "8px",
    border: "1.5px solid #edf1f6", borderRadius: "12px", padding: "0 12px",
    background: "#fbfcfc", transition: "all 0.2s", minWidth: 0,
    width: "100%", boxSizing: "border-box"
  };
  const inputStyle = {
    flex: 1, border: "none", outline: "none", padding: "10px 0",
    fontSize: "14px", background: "transparent", color: "#2d3748",
    minWidth: 0, width: "100%"
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 130px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(150deg, var(--bg-app) 0%, #f0f7f7 100%)",
      padding: "20px 16px",
      boxSizing: "border-box"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "530px",
        background: "#ffffff",
        borderRadius: "22px",
        boxShadow: "0 18px 45px rgba(46, 102, 110, 0.12), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid var(--border)",
        padding: "28px 32px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {/* Decorative Top Accent Bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "4px",
          background: "linear-gradient(90deg, var(--accent), var(--primary))",
        }} />

        {/* Card Header */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '12px', display: 'inline-flex', marginBottom: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
            <img src="/logo.png" alt="Arvaya" style={{ height: "30px", objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: "22px", color: "var(--text-main)", margin: "0 0 4px", fontWeight: "800", letterSpacing: "-0.01em" }}>
            Complete Registration
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
            Enter your details to create your Arvaya account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Title, First Name & Last Name in Row */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "5px" }}>
              Full Name *
            </label>
            <div className="signup-name-row" style={{ display: "grid", gridTemplateColumns: "84px 1fr 1fr", gap: "10px", width: "100%" }}>
              {/* Title */}
              <div style={{ minWidth: 0 }}>
                <div style={{ ...inputWrap, padding: "0 8px" }}>
                  <select 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer", fontWeight: "700", color: "var(--primary-dark)" }}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Baby">Baby</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
              </div>

              {/* First Name */}
              <div style={{ minWidth: 0 }}>
                <div style={inputWrap}>
                  <User size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <input value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="First Name" style={inputStyle} />
                </div>
              </div>

              {/* Last Name */}
              <div style={{ minWidth: 0 }}>
                <div style={inputWrap}>
                  <User size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Last Name" style={inputStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "5px" }}>
              Gender *
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["Male", "Female", "Other"].map((g) => {
                const isSel = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "12px",
                      border: isSel ? "2px solid var(--primary)" : "1.5px solid #edf1f6",
                      background: isSel ? "var(--primary-light)" : "#fbfcfc",
                      color: isSel ? "var(--primary-dark)" : "var(--text-muted)",
                      fontWeight: isSel ? "700" : "500",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date of Birth & Blood Group */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "5px" }}>
                Date of Birth *
              </label>
              <div style={inputWrap}>
                <Calendar size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <input
                  type="date"
                  value={dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={e => setDob(e.target.value)}
                  style={{ ...inputStyle, fontFamily: "inherit" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "5px" }}>
                Blood Group *
              </label>
              <div style={{ ...inputWrap, padding: "0 8px" }}>
                <Droplet size={15} color="var(--primary)" style={{ flexShrink: 0, marginLeft: "2px" }} />
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", fontWeight: "600", color: "var(--text-main)" }}
                >
                  {["B+", "A+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "5px" }}>
              Phone Number *
            </label>
            <div style={inputWrap}>
              <Phone size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number" maxLength={10} style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
              padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "500",
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: "linear-gradient(135deg, #2e666e, #1f474d)",
            color: "#ffffff", border: "none", padding: "14px", borderRadius: "12px",
            fontSize: "15px", fontWeight: "700", cursor: loading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: loading ? 0.7 : 1, transition: "all 0.25s", marginTop: "6px",
            boxShadow: "0 6px 18px rgba(46, 102, 110, 0.3)", width: "100%"
          }}>
            {loading ? "Creating Account..." : <span style={{ color: "#ffffff", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>Complete Registration <ArrowRight size={17} color="#ffffff" /></span>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", marginBottom: 0, fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 520px) {
          .signup-name-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
