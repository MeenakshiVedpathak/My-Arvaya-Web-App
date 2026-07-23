import React, { useState, useEffect } from "react";
import { ArrowLeft, Ambulance, Phone, MapPin, Clock, User, AlertTriangle, CheckCircle2, Truck, Navigation, Search, FileX2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAmbulanceRequests, STATUS_FLOW, EMERGENCY_TYPES } from "../services/ambulanceService";
import AmbulanceRequestModal from "../components/ambulance/AmbulanceRequestModal";

export default function AmbulancePage() {
  const go = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getAmbulanceRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested":  return { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" };
      case "Dispatched": return { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" };
      case "En Route":   return { bg: "#e0e7ff", color: "#4f46e5", border: "#a5b4fc" };
      case "Arrived":    return { bg: "var(--success-bg)", color: "var(--success)", border: "#86efac" };
      default:           return { bg: "var(--bg-app)", color: "var(--text-muted)", border: "var(--border)" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Requested":  return <Clock size={16} />;
      case "Dispatched": return <Truck size={16} />;
      case "En Route":   return <Navigation size={16} />;
      case "Arrived":    return <CheckCircle2 size={16} />;
      default:           return <Clock size={16} />;
    }
  };

  const getEmergencyLabel = (val) => EMERGENCY_TYPES.find(t => t.value === val)?.label || val;

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const activeRequests = requests.filter(r => r.status !== "Arrived");
  const pastRequests   = requests.filter(r => r.status === "Arrived");

  return (
    <main className="page page-enter" style={{ padding: 0 }}>
      {/* ── Header ── */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => go(-1)} style={{ background: "var(--bg-app)", border: "1px solid var(--border)", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="var(--border)"} onMouseLeave={e => e.currentTarget.style.background="var(--bg-app)"}>
            <ArrowLeft size={18} color="var(--text-main)" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)", margin: 0, fontFamily: "var(--font-display)" }}>Track Ambulance</h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "2px 0 0" }}>Monitor your emergency ambulance requests</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }} onMouseEnter={e => e.currentTarget.style.filter="brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter="none"}>
            <Ambulance size={18} /> Call Ambulance
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            Loading requests…
          </div>
        ) : requests.length === 0 ? (
          /* ── Empty State ── */
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", border: "1px solid var(--border)" }}>
              <FileX2 size={48} color="var(--text-muted)" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px", fontFamily: "var(--font-display)" }}>No Ambulance Requests Found</h2>
            <p style={{ fontSize: "15px", color: "var(--text-muted)", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px", lineHeight: 1.6 }}>
              You haven't made any ambulance requests yet. In case of a medical emergency, click the button below to request one immediately.
            </p>
            <button onClick={() => setShowModal(true)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }} onMouseEnter={e => e.currentTarget.style.filter="brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter="none"}>
              <Ambulance size={20} /> Call Ambulance Now
            </button>
          </div>
        ) : (
          <>
            {/* ── Active Requests ── */}
            {activeRequests.length > 0 && (
              <section style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "20px", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#dc2626", animation: "pulse-dot 1.5s infinite" }} />
                  Active Requests
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {activeRequests.map(req => {
                    const sc = getStatusColor(req.status);
                    return (
                      <div key={req.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-sm)", borderLeft: "4px solid #dc2626" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)", fontFamily: "monospace", marginBottom: "4px" }}>{req.id}</div>
                            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-main)", fontFamily: "var(--font-display)" }}>{req.patientName}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "20px", background: sc.bg, color: sc.color, fontSize: "13px", fontWeight: "700", border: `1px solid ${sc.border}` }}>
                            {getStatusIcon(req.status)} {req.status}
                          </div>
                        </div>

                        {/* Status progress */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}>
                          {STATUS_FLOW.map((s, i) => {
                            const idx = STATUS_FLOW.indexOf(req.status);
                            const done = i <= idx;
                            return (
                              <React.Fragment key={s}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? "var(--primary)" : "var(--bg-app)", border: done ? "none" : "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", fontSize: "11px", fontWeight: "700", color: done ? "#fff" : "var(--text-muted)" }}>
                                  {done ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                {i < STATUS_FLOW.length - 1 && (
                                  <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: i < idx ? "var(--primary)" : "var(--border)", transition: "all 0.3s" }} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
                          {STATUS_FLOW.map((s, i) => <span key={s} style={{ flex: 1, textAlign: "center", fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s}</span>)}
                        </div>

                        {/* Details grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", background: "var(--bg-app)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <AlertTriangle size={16} color="var(--accent)" style={{ marginTop: "2px" }} />
                            <div>
                              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Emergency</div>
                              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{getEmergencyLabel(req.emergencyType)}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <Clock size={16} color="var(--primary)" style={{ marginTop: "2px" }} />
                            <div>
                              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>ETA</div>
                              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent)" }}>{req.eta} min</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <Truck size={16} color="var(--primary)" style={{ marginTop: "2px" }} />
                            <div>
                              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Ambulance</div>
                              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{req.ambulanceId}</div>
                            </div>
                          </div>
                        </div>

                        {/* Address + driver */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: "12px" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--text-muted)", maxWidth: "100%" }}>
                            <MapPin size={14} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.pickupAddress}</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)" }}>{req.driverName}</span>
                            <a href={`tel:${req.driverPhone}`} style={{ background: "var(--success)", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.filter="brightness(1.15)"} onMouseLeave={e => e.currentTarget.style.filter="none"}>
                              <Phone size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Past Requests ── */}
            {pastRequests.length > 0 && (
              <section>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "20px", fontFamily: "var(--font-display)" }}>Request History</h2>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                  <div className="table-responsive-wrapper">
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-app)", borderBottom: "1px solid var(--border)" }}>
                          {["Request ID", "Patient", "Emergency", "Address", "Date", "Status"].map(h => (
                            <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pastRequests.map(req => (
                          <tr key={req.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600", color: "var(--text-main)", fontFamily: "monospace" }}>{req.id}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-main)" }}>{req.patientName}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-main)" }}>{getEmergencyLabel(req.emergencyType)}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.pickupAddress}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-muted)" }}>{formatTime(req.createdAt)}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ background: "var(--success-bg)", color: "var(--success)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>Completed</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── FAB ── */}
      {!showModal && (
        <button onClick={() => setShowModal(true)} style={{ position: "fixed", bottom: "32px", right: "32px", width: "64px", height: "64px", borderRadius: "50%", background: "#dc2626", color: "#fff", border: "none", boxShadow: "0 8px 24px rgba(220,38,38,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
          <Phone size={26} />
        </button>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <AmbulanceRequestModal onClose={() => { setShowModal(false); load(); }} onSuccess={() => {}} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </main>
  );
}
