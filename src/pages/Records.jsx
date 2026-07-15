import { FileText, ArrowLeft, HeartPulse, Stethoscope, Filter, Plus, CloudUpload, ChevronRight, Lock, ShieldCheck, Search, Calendar, User, Download, FileJson, Fingerprint } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getRecords } from "../services/dataService";

const iconMap = {
  "Lab Report": { Icon: HeartPulse, color: "#38a169", bg: "#f0fff4" },
  "Diagnostic": { Icon: FileText, color: "#805ad5", bg: "#faf5ff" },
  "Prescription": { Icon: Stethoscope, color: "#ed8936", bg: "#fff5eb" },
};

export default function Records() {
  let go = useNavigate();
  let [records, setRecords] = useState([]);
  let [count, setCount] = useState(0);
  let [pageIndex, setPageIndex] = useState(1);
  let [loading, setLoading] = useState(true);
  let [loadingMore, setLoadingMore] = useState(false);
  let [activeTab, setActiveTab] = useState("personal");
  let [view, setView] = useState("list"); // 'list' | 'add'

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

  if (view === "add") {
    return (
      <main className="page">
        <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
              <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setView("list")}>Records</span> <ChevronRight size={12} /> <span>Upload</span>
            </div>
            <h1 className="text-h2" style={{ fontSize: '24px' }}>Upload Health Record</h1>
            <p className="text-muted mt-2" style={{ fontSize: '15px' }}>Securely store your medical documents with 256-bit encryption.</p>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-surface)', padding: '48px 40px', borderRadius: '24px', border: '1px dashed var(--primary)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }} onClick={() => alert("File explorer opened")} className="hover-lift">
            <div style={{ width: '100px', height: '100px', background: 'var(--primary-light)', borderRadius: '50%', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudUpload size={48} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Drag and drop your report here</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>Supported formats: JPEG, PNG, PDF, DICOM (Max 15MB)</p>
            
            <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '12px' }}>
              Browse Files
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>

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
            <div className="reports-actions">
              <button className="btn btn-primary hover-lift flex items-center gap-2" style={{ boxShadow: 'var(--shadow-md)' }} onClick={() => setView("add")}>
                <Plus size={18} /> Upload Record
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

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
          </aside>

          {/* ── Right Content (Vault List) ── */}
          <section style={{ flex: 1 }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
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
              <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--surface)' }}>
                <img src="/empty_reports.png" alt="No reports found" style={{ height: '120px', marginBottom: '24px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: '700' }}>No ABHA records found</h3>
                <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '400px', margin: '0 auto 24px' }}>Link your ABHA ID to sync records from external hospitals and clinics.</p>
                <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: '600', cursor: 'pointer' }}>Link ABHA ID</button>
              </div>
            ) : (
              <>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
                    <div className="loading-spinner" />
                    <p style={{ marginTop: '16px' }}>Decrypting vault...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {records.map((rec) => {
                      const { Icon, color, bg } = iconMap[rec.type] || iconMap["Lab Report"];
                      return (
                        <article className="hover-lift" key={rec.id} style={{ display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)', gap: '24px', cursor: 'pointer' }} onClick={() => alert("Opening record...")}>

                          {/* Icon Block */}
                          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={28} />
                          </div>

                          {/* Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                              <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{rec.title}</h4>
                              <span style={{ fontSize: '12px', fontWeight: '600', background: 'var(--bg)', color: 'var(--muted)', padding: '4px 10px', borderRadius: '99px', border: '1px solid var(--border)' }}>{rec.type || "Report"}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--muted)', fontSize: '14px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Stethoscope size={14} /> {rec.doctor}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {rec.date}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="hover-lift" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => { e.stopPropagation(); alert("Opening report: " + rec.title); }}>
                              View
                            </button>
                            <button className="hover-lift" style={{ background: 'var(--surface-alt)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Download" onClick={(e) => { e.stopPropagation(); alert("Downloading..."); }}>
                              <Download size={18} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {records.length < count && !loading && (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button
                      className="hover-lift"
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
