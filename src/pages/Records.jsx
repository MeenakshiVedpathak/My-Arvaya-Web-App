import { FileText, ArrowLeft, HeartPulse, Stethoscope, Filter, Plus, CloudUpload, ChevronRight } from "lucide-react";
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

    getRecords({ pageIndex: page, pageSize: 9 }).then(res => {
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
        <div className="internal-page-hero">
          <div className="container">
            <div className="internal-breadcrumbs">
              <Link to="/">Home</Link> <ChevronRight size={14} /> <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setView("list")}>Records</span> <ChevronRight size={14} /> <span>Upload</span>
            </div>
            <h1 className="internal-hero-title">Upload Health Record</h1>
            <p className="internal-hero-subtitle">Securely store your medical documents.</p>
          </div>
        </div>
        
        <div className="container" style={{ paddingBottom: '60px' }}>
        
        <div className="upload-view-container">
          <img src="/upload_illustration.png" alt="Upload Illustration" className="upload-view-illustration" />
          
          <div className="upload-dropzone" onClick={() => alert("File explorer opened")}>
            <CloudUpload size={48} color="var(--primary)" />
            <h3>Select Report from device</h3>
            <p>Supported formats: JPEG, PNG, PDF, DICOM</p>
          </div>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="internal-page-hero">
        <div className="container">
          <div className="internal-breadcrumbs">
            <Link to="/">Home</Link> <ChevronRight size={14} /> <span>Health Records</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="internal-hero-title">Your Health Records</h1>
              <p className="internal-hero-subtitle">Access and manage all your medical history.</p>
            </div>
            <div className="reports-actions">
              <button className="filter-btn" onClick={() => alert("Filter drawer opened")}>
                <Filter size={20} />
              </button>
              <button className="pro-btn-primary" style={{ gap: '8px' }} onClick={() => setView("add")}>
                <Plus size={18} /> Add Record
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '60px' }}>

      {/* Tabs */}
      <div className="reports-tabs-container">
        <div className="custom-tab-toggle">
          <button 
            className={`tab-toggle-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal
          </button>
          <button 
            className={`tab-toggle-btn ${activeTab === 'abha' ? 'active' : ''}`}
            onClick={() => setActiveTab('abha')}
          >
            Abha
          </button>
        </div>
      </div>

      {activeTab === 'abha' ? (
        <div className="empty-reports-state">
          <img src="/empty_reports.png" alt="No reports found" />
          <h3>No reports found</h3>
          <p>You have not added any health reports yet.</p>
        </div>
      ) : (
        <>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#718096" }}>
              <div className="loading-spinner" />
              <p>Loading records...</p>
            </div>
          ) : (
            <div className="records-grid">
              {records.map((rec) => {
                const { Icon, color, bg } = iconMap[rec.type] || iconMap["Lab Report"];
                return (
                  <article className="web-record-card" key={rec.id}>
                    <div className="wrc-header">
                      <div className="wrc-type-badge" style={{ background: bg, color: color }}>
                        <Icon size={14} /> {rec.type || "Lab Report"}
                      </div>
                      <div className="wrc-date">{rec.date}</div>
                    </div>
                    
                    <div className="wrc-body">
                      <h4>{rec.title}</h4>
                      <p>
                        <Stethoscope size={14} color="#94a3b8" />
                        {rec.doctor}
                      </p>
                    </div>

                    <div className="wrc-footer">
                      <button className="wrc-action-btn" style={{ color: "var(--primary)" }} onClick={() => alert("Opening report: " + rec.title)}>
                        <FileText size={16} /> View Report
                      </button>
                      <button className="wrc-icon-btn" title="Download PDF" onClick={() => alert("Downloading: " + rec.title + ".pdf")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          
          {records.length < count && !loading && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button 
                onClick={() => {
                  const nextPage = pageIndex + 1;
                  setPageIndex(nextPage);
                  fetchRecords(nextPage);
                }} 
                style={{ background: 'var(--bg)', color: 'var(--primary)', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {loadingMore ? "Loading..." : "View More Records"}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </main>
  );
}
