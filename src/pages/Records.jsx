import { FileText, ArrowLeft, HeartPulse, Stethoscope, Filter, Plus, CloudUpload, ChevronRight, Lock, ShieldCheck, Search, Calendar, User, Download, FileJson, Fingerprint } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getRecords } from "../services/dataService";

const iconMap = {
  "Lab Report": { Icon: HeartPulse, color: "#38a169", bg: "#f0fff4" },
  "Diagnostic": { Icon: FileText, color: "#1F4F57", bg: "#DCE9EB" },
  "Prescription": { Icon: Stethoscope, color: "#FB913F", bg: "#FEF0E2" },
};

export default function Records() {
  let go = useNavigate();
  let [records, setRecords] = useState([
    { id: 1, title: "Blood Report", doctor: "Dr. Priya Sharma", date: "10 Jul 2026", type: "Lab Report" },
    { id: 2, title: "ECG Report", doctor: "Dr. Arjun Verma", date: "05 Jul 2026", type: "Diagnostic" },
    { id: 3, title: "Prescription", doctor: "Dr. Neha Kapoor", date: "01 Jul 2026", type: "Prescription" },
  ]);
  let [count, setCount] = useState(3);
  let [pageIndex, setPageIndex] = useState(1);
  let [loading, setLoading] = useState(false);
  let [loadingMore, setLoadingMore] = useState(false);
  let [activeTab, setActiveTab] = useState("personal");

  const fetchRecords = (page) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    getRecords({ pageIndex: page, pageSize: 12 }).then(res => {
      setRecords(prev => page === 1 ? res.list : [...prev, ...res.list]);
      setCount(res.count);
      setLoading(false);
      setLoadingMore(false);
    }).catch(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  };

  useEffect(() => {
    fetchRecords(1);
  }, []);

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)', minHeight: '100vh' }}>

      {/* ── Vault Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>Health Vault</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="text-h2" style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={28} color="var(--primary)" /> Health Vault
              </h1>
              <p className="text-muted mt-2" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={14} /> ISO 27001 Certified • 256-bit Encrypted Storage
              </p>
            </div>
            <button className="btn btn-accent flex items-center gap-2 hover-glow" onClick={() => alert("Upload dialog opened")} style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)' }}>
              <CloudUpload size={18} /> Upload Record
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }} className="vault-layout">

          {/* ── Left Sidebar (Filters) ── */}
          <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '100px' }} className="vault-sidebar">

            {/* Search */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Search size={18} color="var(--muted)" />
                <input type="text" placeholder="Search records..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '12px', color: 'var(--text-main)' }} />
              </div>
            </div>

            {/* Filter Group: Members */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> Family Members</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Self (Rahul)', 'Spouse (Priya)', 'Child (Aarav)'].map((member, i) => (
                  <li key={i}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', color: 'var(--text-main)', padding: '6px 0' }}>
                      <input type="checkbox" defaultChecked={i === 0} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                      {member}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter Group: Record Type */}
            <div>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileJson size={16} /> Record Type</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['All Records', 'Prescriptions', 'Lab Reports', 'Diagnostic Scans'].map((type, i) => (
                  <li key={i}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', color: 'var(--text-main)', padding: '6px 0' }}>
                      <input type="radio" name="recordType" defaultChecked={i === 0} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                      {type}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter Group: Admission Type */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16} /> Admission Type</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Both', 'Inpatient (IP)', 'Outpatient (OP)'].map((type, i) => (
                  <li key={i}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '15px', color: 'var(--text-main)', padding: '6px 0' }}>
                      <input type="radio" name="admissionType" defaultChecked={i === 0} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                      {type}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Right Content (Vault List) ── */}
          <section style={{ flex: 1, width: '100%' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                style={{ background: 'transparent', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'personal' ? 'var(--primary)' : 'var(--muted)', borderBottom: activeTab === 'personal' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px' }}
                onClick={() => setActiveTab('personal')}
              >
                My Uploads & Hospital Records
              </button>
              <button
                style={{ background: 'transparent', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: '600', color: activeTab === 'abha' ? 'var(--primary)' : 'var(--muted)', borderBottom: activeTab === 'abha' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('abha')}
              >
                <Fingerprint size={18} /> ABHA Network
              </button>
            </div>

            {activeTab === 'abha' ? (
              <div className="card-elevated" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--bg-surface)' }}>
                <img src="/empty_reports.png" alt="No reports found" style={{ height: '120px', marginBottom: '24px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: '700' }}>No ABHA records found</h3>
                <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '400px', margin: '0 auto 24px' }}>Link your ABHA ID to sync records from external hospitals and clinics.</p>
                <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: '600', cursor: 'pointer' }}>Link ABHA ID</button>
              </div>
            ) : (
              <>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div className="skeleton skeleton-avatar" style={{ width: '56px', height: '56px', borderRadius: '16px' }}></div>
                        <div style={{ flex: 1 }}>
                          <div className="skeleton skeleton-title" style={{ width: '50%' }}></div>
                          <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div className="skeleton skeleton-btn" style={{ width: '80px' }}></div>
                          <div className="skeleton skeleton-btn" style={{ width: '40px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '27px', top: '40px', bottom: '40px', width: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {records.map((rec) => {
                      const { Icon, color, bg } = iconMap[rec.type] || iconMap["Lab Report"];
                      return (
                        <article className="hover-glow record-item-card" key={rec.id} style={{ display: 'flex', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border)', gap: '24px', cursor: 'pointer', position: 'relative', zIndex: 1 }} onClick={() => alert("Opening record...")}>

                          {/* Icon Block */}
                          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid var(--bg)', boxShadow: '0 0 0 4px var(--bg)' }}>
                            <Icon size={24} />
                          </div>

                          {/* Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{rec.title}</h4>
                              <span style={{ fontSize: '12px', fontWeight: '600', background: 'var(--bg)', color: 'var(--muted)', padding: '4px 10px', borderRadius: '99px', border: '1px solid var(--border)' }}>{rec.type || "Report"}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--muted)', fontSize: '14px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Stethoscope size={14} /> {rec.doctor}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {rec.date}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="record-item-actions" style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn hover-glow" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => { e.stopPropagation(); alert("Opening report: " + rec.title); }}>
                              View
                            </button>
                            <button className="btn btn-secondary hover-glow" style={{ padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Download" onClick={(e) => { e.stopPropagation(); alert("Downloading..."); }}>
                              <Download size={18} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                    </div>
                  </div>
                )}

                {records.length < count && !loading && (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button
                      className="btn hover-glow"
                      onClick={() => {
                        const nextPage = pageIndex + 1;
                        setPageIndex(nextPage);
                        fetchRecords(nextPage);
                      }}
                      style={{ background: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)', padding: '12px 32px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
                    >
                      {loadingMore ? "Loading..." : "Load Older Records"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
