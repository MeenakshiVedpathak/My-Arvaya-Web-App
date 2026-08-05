import { FileText, ArrowLeft, HeartPulse, Stethoscope, Filter, Plus, CloudUpload, ChevronRight, Lock, ShieldCheck, Search, Calendar, User, Download, FileJson, Fingerprint, X, Upload, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { getRecords } from "../services/dataService";
import { uploadImage, getImageUrl, fetchImageBlob } from "../services/uploadService";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  const { user, loginMethod, openLoginModal } = useAuth();
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
  let [uploadedFileName, setUploadedFileName] = useState("");
  let [uploadingFile, setUploadingFile] = useState(false);
  let [recordTitle, setRecordTitle] = useState("");
  let [recordType, setRecordType] = useState("Lab Report");
  let [selectedDocTypeId, setSelectedDocTypeId] = useState(1);
  let [doctorName, setDoctorName] = useState("");
  let [uploading, setUploading] = useState(false);
  let [uploadSuccess, setUploadSuccess] = useState(false);

  // ABHA Linked Status
  const [isAbhaLinked, setIsAbhaLinked] = useState(() => {
    const method = localStorage.getItem("arvaya_login_method");
    const linked = localStorage.getItem("arvaya_abha_linked");
    if (method === "user_verify_otp" && linked !== "true") return false;
    return linked === "true";
  });

  useEffect(() => {
    const checkAbhaStatus = () => {
      const method = localStorage.getItem("arvaya_login_method") || loginMethod;
      const linked = localStorage.getItem("arvaya_abha_linked");
      const hasAbhaData = Boolean(user?.abhaAddress || user?.abha_address || user?.abhaNumber || user?.abha_number);

      if (method === "user_verify_otp" && !hasAbhaData) {
        setIsAbhaLinked(false);
      } else {
        setIsAbhaLinked(linked === "true" || hasAbhaData);
      }
    };
    checkAbhaStatus();
    window.addEventListener("storage", checkAbhaStatus);
    window.addEventListener("arvaya_profile_updated", checkAbhaStatus);
    return () => {
      window.removeEventListener("storage", checkAbhaStatus);
      window.removeEventListener("arvaya_profile_updated", checkAbhaStatus);
    };
  }, [loginMethod, user]);

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
    if (activeTab === 'personal') {
      fetchRecords(1);
    } else if (activeTab === 'abha' && isAbhaLinked) {
      fetchAbhaRecords();
    }
  }, [activeTab, isAbhaLinked]);

  // Download State
  let [downloadingId, setDownloadingId] = useState(null);

  const fetchRecords = async (page = 1, query = searchQuery) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const storedUser = localStorage.getItem("arvaya_user");
      let userId = 107609;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed?.user_id || parsed?.id || parsed?.app_user_id || 107609;
        } catch(e) {}
      }

      let filterString = ` AND app_user_id = ${userId} AND status = 1 `;
      if (query && query.trim()) {
        const cleanQuery = query.trim().replace(/'/g, "''");
        filterString += ` AND (title LIKE '%${cleanQuery}%' OR hospital_name LIKE '%${cleanQuery}%' OR lab_name LIKE '%${cleanQuery}%') `;
      }

      const res = await getRecords({
        pageIndex: page,
        pageSize: 12,
        sortKey: "id",
        sortValue: "desc",
        filter: filterString
      });
      setRecords(prev => page === 1 ? (res.list || []) : [...prev, ...(res.list || [])]);
      setCount(res.count || 0);
    } catch (err) {
      console.error("fetchRecords error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length === 0) {
      fetchRecords(1, "");
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchRecords(1, searchQuery);
    }
  };

  // Document Types State & Fetching
  const [documentTypes, setDocumentTypes] = useState([]);

  const fetchDocumentTypes = async () => {
    try {
      let res;
      try {
        res = await api.post("/api/documentType/get", {});
      } catch (err) {
        res = await api.get("/api/documentType/get");
      }
      const list = res?.data || res?.list || res?.records || res?.result || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        setDocumentTypes(list);
        const firstItem = list[0];
        const firstId = Number(firstItem?.id || firstItem?.document_type_id || firstItem?.value || 1);
        const firstName = firstItem?.name || firstItem?.document_type || firstItem?.type || firstItem?.title || "Lab Report";
        setSelectedDocTypeId(firstId);
        setRecordType(firstName);
      }
    } catch (err) {
      console.error("fetchDocumentTypes error:", err);
    }
  };

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = 'hidden';
      fetchDocumentTypes();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadedFileName("");
    if (!recordTitle) {
      setRecordTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    // Instantly trigger upload to HealthRecords folder
    setUploadingFile(true);
    try {
      const folderName = 'HealthRecords';
      const fileExt = file.name.split('.').pop();
      const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const uploadRes = await uploadImage(file, folderName, generatedName);
      const uploadedName = uploadRes?.filename || uploadRes?.fileName || uploadRes?.result || uploadRes?.data || generatedName;
      setUploadedFileName(uploadedName);
    } catch (err) {
      console.error("Instant file upload error:", err);
    } finally {
      setUploadingFile(false);
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
    if (!selectedFile && !uploadedFileName) return;

    setUploading(true);
    try {
      let finalFileName = uploadedFileName;
      if (!finalFileName && selectedFile) {
        const folderName = 'HealthRecords';
        const fileExt = selectedFile.name.split('.').pop();
        const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const uploadRes = await uploadImage(selectedFile, folderName, generatedName);
        finalFileName = uploadRes?.filename || uploadRes?.fileName || uploadRes?.result || uploadRes?.data || generatedName;
        setUploadedFileName(finalFileName);
      }

      const storedUser = localStorage.getItem("arvaya_user");
      let parsedUser = {};
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch(err) {}
      }

      const appUserId = Number(user?.app_user_id || user?.user_id || user?.id || parsedUser?.app_user_id || parsedUser?.user_id || parsedUser?.id || 107609);
      const clientId = Number(user?.client_id || parsedUser?.client_id || 1);
      const fileExt = selectedFile?.name ? selectedFile.name.split('.').pop() : (finalFileName ? finalFileName.split('.').pop() : "jpg");
      const currentDate = new Date().toISOString();

      const matchedDocType = documentTypes.find(dt => Number(dt.id || dt.document_type_id || dt.value) === Number(selectedDocTypeId));
      const docTypeName = matchedDocType?.name || matchedDocType?.document_type || matchedDocType?.type || matchedDocType?.title || recordType || "DiagnosticReport";
      const hiTypeId = Number(selectedDocTypeId || matchedDocType?.id || 1);

      // 1. Trigger /api/patientHealthRecord/upsert API with integer hi_type & id record_type
      await api.post("/api/patientHealthRecord/upsert", {
        id: 0,
        app_user_id: appUserId,
        file_type: fileExt,
        title: recordTitle || selectedFile?.name || "Health Record",
        status: 1,
        hospital_name: doctorName || "",
        lab_name: doctorName || "",
        hi_type: hiTypeId,
        creation_date: currentDate,
        composition_data: "",
        file_url: finalFileName,
        description: "",
        summary_data: "",
        report_date: currentDate,
        is_synced_abha: 0,
        tags: "",
        record_type: hiTypeId,
        client_id: clientId
      });

      setUploadSuccess(true);

      // 2. Fetch latest records via /api/patientHealthRecord/get API
      await fetchRecords(1);
      setActiveTab("personal");

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
        setSelectedFile(null);
        setUploadedFileName("");
        setRecordTitle("");
        setDoctorName("");
      }, 1000);

    } catch (err) {
      console.error("Upload & Save error:", err);
      alert("Failed to save health record. Please try again.");
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
            <button
              className={`btn btn-accent flex items-center gap-2 ${activeTab === 'abha' ? '' : 'hover-glow'}`}
              disabled={activeTab === 'abha'}
              onClick={() => setShowUploadModal(true)}
              title={activeTab === 'abha' ? "Upload is disabled in ABHA Network view" : "Upload Record"}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                opacity: activeTab === 'abha' ? 0.5 : 1,
                cursor: activeTab === 'abha' ? 'not-allowed' : 'pointer'
              }}
            >
              <CloudUpload size={18} /> Upload Record
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
        {/* ── Control Bar: Tabs + Top Search Bar ── */}
        <div className="vault-control-bar">
          
          {/* Tabs */}
          <div className="vault-tabs">
            <button
              className={`vault-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              My Uploads & Hospital Records
            </button>
            <button
              className={`vault-tab-btn ${activeTab === 'abha' ? 'active' : ''}`}
              onClick={() => setActiveTab('abha')}
            >
              <Fingerprint size={18} /> ABHA Network
            </button>
          </div>

          {/* Top Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); fetchRecords(1, searchQuery); }} className="vault-search-form">
            <div className="vault-search-box">
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-main)', fontSize: '13.5px' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    fetchRecords(1, "");
                  }}
                  title="Clear search"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0 4px', display: 'flex', alignItems: 'center' }}
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                title="Search records"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: searchQuery ? 'var(--primary)' : 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center', marginLeft: '4px' }}
              >
                <Search size={16} />
              </button>
            </div>
          </form>

        </div>

        <style>{`
          .vault-control-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            margin-bottom: 24px;
            gap: 16px;
          }

          .vault-tabs {
            display: flex;
            gap: 24px;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .vault-tabs::-webkit-scrollbar {
            display: none;
          }

          .vault-tab-btn {
            background: transparent;
            border: none;
            padding: 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--muted);
            border-bottom: 2px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: -1px;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .vault-tab-btn.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
          }

          .vault-search-form {
            margin: 0;
            padding-bottom: 8px;
          }

          .vault-search-box {
            display: flex;
            align-items: center;
            background: var(--bg-surface);
            padding: 8px 14px;
            border-radius: 10px;
            border: 1px solid var(--border);
            width: 320px;
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }

          @media (max-width: 768px) {
            .vault-control-bar {
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
              border-bottom: none;
            }

            .vault-tabs {
              gap: 16px;
              width: 100%;
              border-bottom: 1px solid var(--border);
              padding-bottom: 2px;
            }

            .vault-tab-btn {
              font-size: 14px;
              padding: 8px 0;
            }

            .vault-search-form {
              width: 100%;
              padding-bottom: 0;
            }

            .vault-search-box {
              width: 100%;
            }
          }
        `}</style>

        {/* ── Content Section ── */}
        <section style={{ width: '100%' }}>

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
                  <button onClick={() => openLoginModal("/records", "abha_mobile")} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: '600', cursor: 'pointer' }}>Link ABHA ID</button>
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
                    {records.map((rec) => {
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
                {uploadingFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={20} color="var(--primary)" className="animate-spin" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '12px' }}>Uploading to HealthRecords...</p>
                      <p style={{ margin: 0, fontSize: '10px', color: 'var(--muted)' }}>Sending file to server</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--primary)" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '12px' }}>{selectedFile.name}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: uploadedFileName ? 'var(--primary)' : 'var(--muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB {uploadedFileName ? "• Uploaded (HealthRecords)" : "• Click to change"}
                      </p>
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
                  value={selectedDocTypeId} 
                  onChange={(e) => {
                    const selId = Number(e.target.value);
                    setSelectedDocTypeId(selId);
                    const matched = documentTypes.find(dt => Number(dt.id || dt.document_type_id || dt.value) === selId);
                    if (matched) {
                      setRecordType(matched.name || matched.document_type || matched.type || matched.title || "");
                    }
                  }}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', outline: 'none', fontSize: '12px' }}
                >
                  {documentTypes.length > 0 ? (
                    documentTypes.map((dt, idx) => {
                      const idVal = Number(dt.id || dt.document_type_id || dt.value || idx + 1);
                      const label = dt.name || dt.document_type || dt.label || dt.title || dt.type || `Type ${idVal}`;
                      return <option key={idVal} value={idVal}>{label}</option>;
                    })
                  ) : (
                    <>
                      <option value={1}>Diagnostic Report</option>
                      <option value={2}>Prescription</option>
                      <option value={3}>Discharge Summary</option>
                    </>
                  )}
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
                  disabled={uploading || uploadingFile}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || uploadingFile || (!selectedFile && !uploadedFileName) || uploadSuccess}
                  className="btn btn-accent hover-glow"
                  style={{ padding: '6px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '12px' }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle2 size={13} /> Saved!
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
