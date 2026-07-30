import { FileText, ArrowLeft, HeartPulse, Stethoscope, Filter, Plus, CloudUpload, ChevronRight, Lock, ShieldCheck, Search, Calendar, User, Download, FileJson, Fingerprint, X, Upload, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { getRecords } from "../services/dataService";
import { uploadImage, getImageUrl, fetchImageBlob } from "../services/uploadService";
import { api } from "../services/api";

const iconMap = {
  "Lab Report": { Icon: HeartPulse, color: "#38a169", bg: "#f0fff4" },
  "Diagnostic": { Icon: FileText, color: "#1F4F57", bg: "#DCE9EB" },
  "Prescription": { Icon: Stethoscope, color: "#FB913F", bg: "#FEF0E2" },
};

const getRecordIcon = (type = "") => {
  const norm = String(type).toLowerCase();
  if (norm.includes("lab") || norm.includes("blood")) {
    return { Icon: HeartPulse, color: "#38a169", bg: "#f0fff4" };
  }
  if (norm.includes("prescription") || norm.includes("rx") || norm.includes("medicine")) {
    return { Icon: Stethoscope, color: "#FB913F", bg: "#FEF0E2" };
  }
  return iconMap[type] || { Icon: FileText, color: "#1F4F57", bg: "#DCE9EB" };
};

export default function Records() {
  let go = useNavigate();
  let fileInputRef = useRef(null);

  let [records, setRecords] = useState([]);
  let [count, setCount] = useState(0);
  let [pageIndex, setPageIndex] = useState(1);
  let [loading, setLoading] = useState(true);
  let [loadingMore, setLoadingMore] = useState(false);
  let [activeTab, setActiveTab] = useState("personal");
  let [searchQuery, setSearchQuery] = useState("");
  let [selectedType, setSelectedType] = useState("All Records");

  // Modal & Upload States
  let [showUploadModal, setShowUploadModal] = useState(false);
  let [selectedFile, setSelectedFile] = useState(null);
  let [recordTitle, setRecordTitle] = useState("");
  let [recordType, setRecordType] = useState("Lab Report");
  let [doctorName, setDoctorName] = useState("");
  let [uploading, setUploading] = useState(false);
  let [uploadSuccess, setUploadSuccess] = useState(false);

  // ABHA Linked Status
  const [isAbhaLinked, setIsAbhaLinked] = useState(() => localStorage.getItem("arvaya_abha_linked") === "true");

  useEffect(() => {
    const checkAbhaStatus = () => {
      setIsAbhaLinked(localStorage.getItem("arvaya_abha_linked") === "true");
    };
    checkAbhaStatus();
    window.addEventListener("storage", checkAbhaStatus);
    return () => window.removeEventListener("storage", checkAbhaStatus);
  }, []);

  // ABHA Records State & Fetching
  const [abhaRecords, setAbhaRecords] = useState([]);
  const [loadingAbha, setLoadingAbha] = useState(false);

  const fetchAbhaRecords = () => {
    setLoadingAbha(true);
    const storedUser = localStorage.getItem("arvaya_user");
    let userId = 107609;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userId = parsed?.user_id || parsed?.id || parsed?.app_user_id || 107609;
      } catch(e) {}
    }

    const filterString = ` AND app_user_id = ${userId} AND record_type = 'P' AND status = 1 `;

    getRecords({
      pageIndex: 1,
      pageSize: 20,
      sortKey: "id",
      sortValue: "desc",
      filter: filterString
    }).then(res => {
      setAbhaRecords(res.list || []);
      setLoadingAbha(false);
    }).catch(err => {
      console.error("fetchAbhaRecords error:", err);
      setLoadingAbha(false);
    });
  };

  useEffect(() => {
    if (activeTab === 'abha' && isAbhaLinked) {
      fetchAbhaRecords();
    }
  }, [activeTab, isAbhaLinked]);

  // Download State
  let [downloadingId, setDownloadingId] = useState(null);

  const fetchRecords = (page) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    getRecords({ pageIndex: page, pageSize: 12 }).then(res => {
      setRecords(prev => page === 1 ? (res.list || []) : [...prev, ...(res.list || [])]);
      setCount(res.count || 0);
      setLoading(false);
      setLoadingMore(false);
    }).catch(err => {
      console.error("fetchRecords error:", err);
      setLoading(false);
      setLoadingMore(false);
    });
  };

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal]);

  useEffect(() => {
    fetchRecords(1);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!recordTitle) {
        setRecordTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleViewRecord = async (rec, e) => {
    if (e) e.stopPropagation();
    const targetFile = rec?.filePath || rec?.raw?.file_name || rec?.raw?.file_path || rec?.fileUrl || rec?.raw?.url;

    if (!targetFile || targetFile === "null" || targetFile === "undefined") {
      return;
    }

    try {
      const resolvedBlob = await fetchImageBlob(targetFile, 'HealthRecords');
      const finalUrl = resolvedBlob || getImageUrl(targetFile, 'HealthRecords');
      window.location.href = finalUrl;
    } catch (err) {
      console.error("Failed to load view blob:", err);
      window.location.href = getImageUrl(targetFile, 'HealthRecords');
    }
  };

  const handleDownloadRecord = async (rec, e) => {
    if (e) e.stopPropagation();
    const targetFile = rec?.filePath || rec?.raw?.file_name || rec?.raw?.file_path || rec?.fileUrl || rec?.raw?.url;

    if (!targetFile || targetFile === "null" || targetFile === "undefined") {
      return;
    }

    setDownloadingId(rec.id);
    try {
      const blobUrl = await fetchImageBlob(targetFile, 'HealthRecords');
      const fetchUrl = blobUrl || getImageUrl(targetFile, 'HealthRecords');

      const response = await fetch(fetchUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const pathStr = String(targetFile);
      const ext = pathStr.includes('.') ? pathStr.split('.').pop().split('?')[0] : 'pdf';
      const cleanTitle = (rec.title || "Health_Record").replace(/[^a-zA-Z0-9_-]/g, "_");
      const downloadFileName = `${cleanTitle}.${ext}`;

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (err) {
      console.error("Download error, falling back to direct link:", err);
      const directUrl = getImageUrl(targetFile, 'HealthRecords');
      const link = document.createElement('a');
      link.href = directUrl;
      link.download = rec.title || "Health_Record";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const folderName = 'HealthRecords';
      const fileExt = selectedFile.name.split('.').pop();
      const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // 1. Upload image/file via uploadService to HealthRecords folder
      const uploadRes = await uploadImage(selectedFile, folderName, generatedName);
      const uploadedFileName = uploadRes?.filename || uploadRes?.fileName || generatedName;
      const fileUrl = getImageUrl(uploadedFileName, folderName) || URL.createObjectURL(selectedFile);

      // 2. Save metadata via upsert API if backend endpoint is present
      try {
        const storedUser = localStorage.getItem("arvaya_user");
        let userId = null;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            userId = parsed?.id || parsed?.user_id || parsed?.app_user_id;
          } catch(err) {}
        }
        await api.post("/api/patientHealthRecord/upsert", {
          title: recordTitle || selectedFile.name,
          record_name: recordTitle || selectedFile.name,
          record_type: recordType || "Lab Report",
          type: recordType || "Lab Report",
          doctor_name: doctorName || "Self Uploaded",
          file_name: uploadedFileName,
          file_path: uploadedFileName,
          url: fileUrl,
          ...(userId ? { app_user_id: userId, created_by: userId } : {})
        });
      } catch (err) {
        console.warn("patientHealthRecord upsert notice:", err);
      }

      // 3. Construct new record item
      const newRecord = {
        id: Date.now(),
        title: recordTitle || selectedFile.name,
        doctor: doctorName || "Self Uploaded",
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: recordType || "Lab Report",
        filePath: uploadedFileName,
        fileUrl: fileUrl,
        raw: { file_name: uploadedFileName, file_path: uploadedFileName }
      };

      setRecords(prev => [newRecord, ...prev]);
      setCount(prev => prev + 1);
      setActiveTab("personal");
      setUploadSuccess(true);

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
        setSelectedFile(null);
        setRecordTitle("");
        setDoctorName("");
      }, 1000);

    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
            <button className="btn btn-accent flex items-center gap-2 hover-glow" onClick={() => setShowUploadModal(true)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)' }}>
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
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '12px', color: 'var(--text-main)' }}
                />
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
                      <input
                        type="radio"
                        name="recordType"
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
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
              isAbhaLinked ? (
                loadingAbha ? (
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
                ) : abhaRecords.length === 0 ? (
                  <div className="card-elevated" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--bg-surface)' }}>
                    <img src="/empty_reports.png" alt="No reports found" style={{ height: '120px', marginBottom: '24px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: '700' }}>No ABHA records found</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '400px', margin: '0 auto 24px' }}>Your ABHA account is linked. Synced records from linked hospitals will automatically appear here.</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '27px', top: '40px', bottom: '40px', width: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {abhaRecords.map((rec) => {
                        const { Icon, color, bg } = getRecordIcon(rec.type);
                        const targetFile = rec?.filePath || rec?.fileUrl || rec?.raw?.file_name || rec?.raw?.file_path || rec?.raw?.file_url || rec?.raw?.url || rec?.raw?.file;
                        const hasFile = Boolean(targetFile && targetFile !== "null" && targetFile !== "undefined");
                        return (
                          <article className="hover-glow record-item-card" key={rec.id} style={{ display: 'flex', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border)', gap: '24px', cursor: hasFile ? 'pointer' : 'default', position: 'relative', zIndex: 1 }} onClick={(e) => hasFile && handleViewRecord(rec, e)}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid var(--bg)', boxShadow: '0 0 0 4px var(--bg)' }}>
                              <Icon size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{rec.title}</h4>
                                <span style={{ fontSize: '12px', fontWeight: '600', background: 'var(--bg)', color: 'var(--muted)', padding: '4px 10px', borderRadius: '99px', border: '1px solid var(--border)' }}>{rec.type || "ABHA Record"}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--muted)', fontSize: '14px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Stethoscope size={14} /> {rec.doctor}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {rec.date}</span>
                              </div>
                            </div>
                            <div className="record-item-actions" style={{ display: 'flex', gap: '12px' }}>
                              <button 
                                className="btn hover-glow" 
                                disabled={!hasFile}
                                title={hasFile ? "View Record" : "No document file available"}
                                style={{ 
                                  background: hasFile ? 'var(--primary-light)' : 'var(--bg)', 
                                  color: hasFile ? 'var(--primary)' : 'var(--muted)', 
                                  border: 'none', 
                                  padding: '10px 20px', 
                                  borderRadius: '10px', 
                                  fontSize: '14px', 
                                  fontWeight: '600', 
                                  cursor: hasFile ? 'pointer' : 'not-allowed', 
                                  opacity: hasFile ? 1 : 0.5,
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px' 
                                }} 
                                onClick={(e) => hasFile && handleViewRecord(rec, e)}
                              >
                                View
                              </button>
                              <button 
                                className="btn btn-secondary hover-glow" 
                                disabled={!hasFile || downloadingId === rec.id}
                                title={hasFile ? "Download Record" : "No document file available"}
                                style={{ 
                                  padding: '10px', 
                                  borderRadius: '10px', 
                                  cursor: hasFile ? 'pointer' : 'not-allowed', 
                                  opacity: hasFile ? 1 : 0.5,
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center' 
                                }}
                                onClick={(e) => hasFile && handleDownloadRecord(rec, e)}
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                <div className="card-elevated" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--bg-surface)' }}>
                  <img src="/empty_reports.png" alt="No reports found" style={{ height: '120px', marginBottom: '24px', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: '700' }}>No ABHA records found</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '400px', margin: '0 auto 24px' }}>Link your ABHA ID to sync records from external hospitals and clinics.</p>
                  <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: '600', cursor: 'pointer' }}>Link ABHA ID</button>
                </div>
              )
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
                ) : records.length === 0 ? (
                  <div className="card-elevated" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: '16px' }}>
                    <FileText size={48} color="var(--muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700' }}>No Health Records Found</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '360px', margin: '0 auto 20px' }}>Upload your medical reports or prescriptions to store them securely in your vault.</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '27px', top: '40px', bottom: '40px', width: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {records.filter(rec => {
                      const matchesSearch = !searchQuery || rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) || rec.doctor?.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesType = selectedType === "All Records" ||
                        (selectedType === "Prescriptions" && (rec.type?.toLowerCase().includes("prescription") || rec.type?.toLowerCase().includes("rx"))) ||
                        (selectedType === "Lab Reports" && (rec.type?.toLowerCase().includes("lab") || rec.type?.toLowerCase().includes("blood"))) ||
                        (selectedType === "Diagnostic Scans" && (rec.type?.toLowerCase().includes("diagnostic") || rec.type?.toLowerCase().includes("ecg") || rec.type?.toLowerCase().includes("scan")));
                      return matchesSearch && matchesType;
                    }).map((rec) => {
                      const { Icon, color, bg } = getRecordIcon(rec.type);
                      const targetFile = rec?.filePath || rec?.fileUrl || rec?.raw?.file_name || rec?.raw?.file_path || rec?.raw?.file_url || rec?.raw?.url || rec?.raw?.file;
                      const hasFile = Boolean(targetFile && targetFile !== "null" && targetFile !== "undefined");
                      return (
                        <article className="hover-glow record-item-card" key={rec.id} style={{ display: 'flex', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid var(--border)', gap: '24px', cursor: hasFile ? 'pointer' : 'default', position: 'relative', zIndex: 1 }} onClick={(e) => hasFile && handleViewRecord(rec, e)}>

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
                            <button 
                              className="btn hover-glow" 
                              disabled={!hasFile}
                              title={hasFile ? "View Record" : "No document file available"}
                              style={{ 
                                background: hasFile ? 'var(--primary-light)' : 'var(--bg)', 
                                color: hasFile ? 'var(--primary)' : 'var(--muted)', 
                                border: 'none', 
                                padding: '10px 20px', 
                                borderRadius: '10px', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                cursor: hasFile ? 'pointer' : 'not-allowed', 
                                opacity: hasFile ? 1 : 0.5,
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px' 
                              }} 
                              onClick={(e) => hasFile && handleViewRecord(rec, e)}
                            >
                              View
                            </button>
                            <button 
                              className="btn btn-secondary hover-glow" 
                              disabled={!hasFile || downloadingId === rec.id}
                              title={hasFile ? "Download Record" : "No document file available"}
                              style={{ 
                                padding: '10px', 
                                borderRadius: '10px', 
                                cursor: hasFile ? 'pointer' : 'not-allowed', 
                                opacity: hasFile ? 1 : 0.5,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                minWidth: '40px' 
                              }} 
                              onClick={(e) => hasFile && handleDownloadRecord(rec, e)}
                            >
                              {downloadingId === rec.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
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



      {showUploadModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, margin: 0, padding: '12px', overflow: 'hidden' }}>
          <div className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '370px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <CloudUpload size={18} color="var(--primary)" /> Upload Medical Record
              </h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUploadSubmit} style={{ padding: '12px 16px' }}>
              
              {/* File Dropzone / Selector */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center', background: 'var(--bg-app)', cursor: 'pointer', marginBottom: '10px', transition: 'border-color 0.2s' }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*,.pdf,.doc,.docx" 
                  style={{ display: 'none' }} 
                />
                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--primary)" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '12px' }}>{selectedFile.name}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: 'var(--muted)' }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload size={20} color="var(--primary)" style={{ margin: '0 auto 2px', opacity: 0.8 }} />
                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)', fontSize: '12px' }}>Click or drag file to upload</p>
                    <p style={{ margin: '1px 0 0', fontSize: '10px', color: 'var(--muted)' }}>Supports PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Record Title Input */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '3px' }}>Document Name / Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Blood Test Report, Chest X-Ray..." 
                  value={recordTitle} 
                  onChange={(e) => setRecordTitle(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', outline: 'none', fontSize: '12px' }}
                />
              </div>

              {/* Record Type Selection */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '3px' }}>Record Type</label>
                <select 
                  value={recordType} 
                  onChange={(e) => setRecordType(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', outline: 'none', fontSize: '12px' }}
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Diagnostic">Diagnostic Scan</option>
                </select>
              </div>

              {/* Doctor Name Input */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '3px' }}>Doctor / Clinic Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Priya Sharma, Apollo Clinic" 
                  value={doctorName} 
                  onChange={(e) => setDoctorName(e.target.value)} 
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', outline: 'none', fontSize: '12px' }}
                />
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || !selectedFile || uploadSuccess}
                  className="btn btn-accent hover-glow"
                  style={{ padding: '6px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '12px' }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle2 size={13} /> Uploaded!
                    </>
                  ) : (
                    <>
                      <CloudUpload size={13} /> Upload & Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
