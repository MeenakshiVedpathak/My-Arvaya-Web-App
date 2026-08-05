import React, { useState, useEffect } from "react";
import { ArrowLeft, Ambulance, Phone, MapPin, Clock, User, AlertTriangle, CheckCircle2, Truck, Navigation, Search, FileX2, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { getAmbulanceRequests, STATUS_FLOW, EMERGENCY_TYPES } from "../services/ambulanceService";
import AmbulanceRequestModal from "../components/ambulance/AmbulanceRequestModal";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AmbulancePage() {
  const go = useNavigate();
  const defaultRequests = [];

  const [requests, setRequests] = useState(defaultRequests);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const data = await getAmbulanceRequests();
    if (Array.isArray(data) && data.length > 0) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getStatusIndex = (status) => {
    if (!status) return 0;
    const s = String(status).trim().toLowerCase().replace(/_/g, " ");
    if (s.includes("cancel") || s.includes("unavailable")) return -1;
    if (s.includes("complete") || s.includes("done")) return 4;
    if (s.includes("arriv") || s.includes("delay")) return 3;
    if (s.includes("dispatch")) return 2;
    if (s.includes("assign")) return 1;
    return 0;
  };

  const getStatusColor = (status) => {
    const s = String(status).trim().toLowerCase().replace(/_/g, " ");
    if (s.includes("cancel") || s.includes("unavailable")) return { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" };
    if (s.includes("delay")) return { bg: "#ffedd5", color: "#ea580c", border: "#fdba74" };
    const idx = getStatusIndex(status);
    switch (idx) {
      case 0: return { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" };
      case 1: return { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" };
      case 2: return { bg: "#e0e7ff", color: "#4f46e5", border: "#a5b4fc" };
      case 3: return { bg: "#ccfbf1", color: "#0d9488", border: "#5eead4" };
      case 4: return { bg: "var(--success-bg)", color: "var(--success)", border: "#86efac" };
      default: return { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" };
    }
  };

  const getStatusIcon = (status) => {
    const s = String(status).trim().toLowerCase().replace(/_/g, " ");
    if (s.includes("cancel") || s.includes("unavailable")) return <FileX2 size={16} />;
    if (s.includes("delay")) return <AlertTriangle size={16} />;
    const idx = getStatusIndex(status);
    switch (idx) {
      case 0: return <Clock size={16} />;
      case 1: return <User size={16} />;
      case 2: return <Truck size={16} />;
      case 3: return <Navigation size={16} />;
      case 4: return <CheckCircle2 size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getEmergencyLabel = (val) => EMERGENCY_TYPES.find(t => t.value === val)?.label || val;

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatTimeShort = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const activeRequests = requests.filter(r => {
    const idx = getStatusIndex(r.status);
    return idx >= 0 && idx < 4;
  });
  const pastRequests = requests.filter(r => {
    const idx = getStatusIndex(r.status);
    return idx === 4 || idx === -1;
  });

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", padding: '24px 0' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = ''}>Home</Link> <ChevronRight size={12} /> <span>Track Ambulance</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="text-h2" style={{ fontSize: '24px', margin: 0 }}>Track Ambulance</h1>
              <p className="text-muted mt-2" style={{ fontSize: '14px', margin: 0 }}>Monitor your emergency ambulance requests.</p>
            </div>
            <button onClick={() => setShowModal(true)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
              <Ambulance size={18} /> Call Ambulance
            </button>
          </div>
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
            <button onClick={() => setShowModal(true)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
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
                        {getStatusIndex(req.status) !== -1 ? (
                          <div style={{ display: "flex", width: "100%", paddingBottom: "32px", marginBottom: "24px" }}>
                            {STATUS_FLOW.map((s, i) => {
                              const idx = getStatusIndex(req.status);
                              const done = i <= idx;
                              const lineDone = i < idx;
                              const isLast = i === STATUS_FLOW.length - 1;
                              const isDelayed = String(req.status).toLowerCase().includes("delay");
                              const stepLabel = (isDelayed && i === 3) ? "Delayed" : s;
                              const stepColor = (isDelayed && i === 3 && done) ? "#ea580c" : (done ? "var(--primary)" : "var(--bg-app)");
                              const textColor = (isDelayed && i === 3 && done) ? "#fff" : (done ? "#fff" : "var(--text-muted)");

                              let stepTime = null;
                              if (i === 0) stepTime = req.createdAt;
                              if (i === 1) stepTime = req.assignedAt;
                              if (i === 2) stepTime = req.dispatchedAt;
                              if (i === 3 && done) stepTime = req.updatedAt;
                              if (i === 4) stepTime = req.completedAt;

                              return (
                                <div key={s} style={{ flex: isLast ? 0 : 1, position: "relative" }}>
                                  {!isLast && (
                                    <div style={{ position: "absolute", top: "13px", left: "28px", right: "0", height: "3px", background: lineDone ? "var(--primary)" : "var(--border)", transition: "all 0.3s" }} />
                                  )}
                                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: stepColor, border: done ? "none" : "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", fontSize: "11px", fontWeight: "700", color: textColor, position: "relative", zIndex: 1 }}>
                                    {done ? <CheckCircle2 size={14} /> : i + 1}
                                  </div>
                                  <div style={{ position: "absolute", top: "36px", left: "14px", transform: "translateX(-50%)", width: "100px", textAlign: "center", fontSize: "10px", fontWeight: "600", color: (isDelayed && i === 3 && done) ? "#ea580c" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    {stepLabel}
                                    {stepTime && (
                                      <div style={{ fontSize: "9px", color: "var(--text-muted)", opacity: 0.7, marginTop: "2px", textTransform: "none", letterSpacing: "normal" }}>
                                        {formatTimeShort(stepTime)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ padding: "16px", background: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "14px", fontWeight: "600", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FileX2 size={18} /> Request {req.status}
                          </div>
                        )}

                        {/* Live Map Tracking */}
                        <div style={{ height: "200px", background: "var(--bg-app)", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "24px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                          {req.pickupLat && req.pickupLng ? (
                            <MapContainer center={[req.pickupLat, req.pickupLng]} zoom={15} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} style={{ height: "100%", width: "100%" }}>
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[req.pickupLat, req.pickupLng]} />
                            </MapContainer>
                          ) : (
                            <>
                              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: "radial-gradient(var(--text-muted) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                              <div style={{ textAlign: "center", zIndex: 1 }}>
                                <Navigation size={32} color="var(--primary)" style={{ margin: "0 auto 8px" }} />
                                <b style={{ color: "var(--text-main)", fontSize: "14px", display: "block" }}>Live Tracking</b>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Ambulance is {req.eta} mins away</span>
                              </div>
                            </>
                          )}
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
                            <a href={`tel:${req.driverPhone}`} style={{ background: "var(--success)", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.15)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>
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

      {/* ── FAB SOS ── */}
      {!showModal && (
        <button onClick={() => setShowModal(true)} style={{ position: "fixed", bottom: "32px", right: "32px", width: "64px", height: "64px", borderRadius: "50%", background: "#dc2626", color: "#fff", border: "none", boxShadow: "0 8px 24px rgba(220,38,38,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1000, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
          <AlertTriangle size={24} />
          <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '2px' }}>SOS</span>
        </button>
      )}

      {/* ── Modal (Used in React) ── */}
      {showModal && (
        <AmbulanceRequestModal onClose={() => { setShowModal(false); load(); }} onSuccess={() => { }} />
      )}

    </main>
  );
}
