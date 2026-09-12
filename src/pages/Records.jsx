import { 
  FileText, 
  Stethoscope, 
  CloudUpload, 
  Search, 
  Calendar, 
  User, 
  Download, 
  Fingerprint, 
  X, 
  Loader2, 
  CheckCircle2, 
  Eye, 
  Check, 
  Archive, 
  ShieldCheck, 
  Plus 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { getRecords, getDocumentTypes } from "../services/dataService";
import { uploadImage, getImageUrl, fetchImageBlob } from "../services/uploadService";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/common/Toast";

export default function Records() {
  const { user, loginMethod, openLoginModal } = useAuth();
  let go = useNavigate();
  let fileInputRef = useRef(null);
  let uploadCancelledRef = useRef(false);

  let [records, setRecords] = useState([]);
  let [count, setCount] = useState(0);
  let [pageIndex, setPageIndex] = useState(1);
  let [loading, setLoading] = useState(true);
  let [loadingMore, setLoadingMore] = useState(false);
  let [activeTab, setActiveTab] = useState("personal");
  let [searchQuery, setSearchQuery] = useState("");

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

  // Validation & Focus & Toast States
  let [errors, setErrors] = useState({});
  let [focusedField, setFocusedField] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ isOpen: true, message, type });

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

    const abhaFilters = [
      { column: "app_user_id", operator: "=", value: Number(userId) || userId },
      { column: "record_type", operator: "=", value: "P" },
      { column: "status", operator: "=", value: 1 },
      { column: "is_active", operator: "=", value: 1 }
    ];

    getRecords({
      pageIndex: 1,
      pageSize: 20,
      sortKey: "id",
      sortValue: "desc",
      filters: abhaFilters
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
  const docTypesFetchedRef = useRef(false);

  const fetchDocumentTypes = async () => {
    if (docTypesFetchedRef.current || documentTypes.length > 0) return;
    docTypesFetchedRef.current = true;

    try {
      const list = await getDocumentTypes();
      if (Array.isArray(list) && list.length > 0) {
        setDocumentTypes(list);
        const firstItem = list[0];
        const firstId = Number(firstItem?.id || firstItem?.document_type_id || firstItem?.value || 1);
        const firstName = firstItem?.name || firstItem?.document_type || firstItem?.type || firstItem?.title || "Lab Report";
        setSelectedDocTypeId(firstId);
        setRecordType(firstName);
      } else {
        docTypesFetchedRef.current = false;
      }
    } catch (err) {
      console.error("fetchDocumentTypes error:", err);
      docTypesFetchedRef.current = false;
    }
  };

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = 'hidden';
      fetchDocumentTypes();
    } else {
      document.body.style.overflow = '';
      setErrors({});
      setFocusedField(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal]);

  const handleCancelUpload = () => {
    uploadCancelledRef.current = true;
    setUploadingFile(false);
    setUploading(false);
    setUploadSuccess(false);
    setSelectedFile(null);
    setUploadedFileName("");
    setRecordTitle("");
    setDoctorName("");
    setErrors({});
    setShowUploadModal(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || "";

    if (!allowedExtensions.includes(fileExt)) {
      showToast("Only PDF, JPG, and PNG file formats are allowed.", "error");
      if (e.target) e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      showToast("File size must not exceed 10MB.", "error");
      if (e.target) e.target.value = "";
      return;
    }

    uploadCancelledRef.current = false;
    setSelectedFile(file);
    setUploadedFileName("");

    setUploadingFile(true);
    try {
      const folderName = 'HealthRecords';
      const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const uploadRes = await uploadImage(file, folderName, generatedName);
      if (uploadCancelledRef.current) return;
      const uploadedName = uploadRes?.filename || uploadRes?.fileName || uploadRes?.result || uploadRes?.data || generatedName;
      setUploadedFileName(uploadedName);
    } catch (err) {
      if (uploadCancelledRef.current) return;
      console.error("Instant file upload error:", err);
    } finally {
      if (!uploadCancelledRef.current) {
        setUploadingFile(false);
      }
    }
  };

  const handleViewRecord = async (rec, e) => {
    if (e) e.stopPropagation();
    const targetFile = rec?.filePath || rec?.raw?.file_name || rec?.raw?.file_path || rec?.fileUrl || rec?.raw?.url;

    if (!targetFile || targetFile === "null" || targetFile === "undefined") {
      showToast("Viewing record document...", "info");
      return;
    }

    try {
      const resolvedBlob = await fetchImageBlob(targetFile, 'HealthRecords');
      const finalUrl = resolvedBlob || getImageUrl(targetFile, 'HealthRecords');
      
      const link = document.createElement('a');
      link.href = finalUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try { document.body.removeChild(link); } catch(err) {}
      }, 100);
    } catch (err) {
      console.error("Failed to load view blob:", err);
      const fallbackUrl = getImageUrl(targetFile, 'HealthRecords');
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try { document.body.removeChild(link); } catch(err) {}
      }, 100);
    }
  };

  const handleDownloadRecord = async (rec, e) => {
    if (e) e.stopPropagation();
    const targetFile = rec?.filePath || rec?.raw?.file_name || rec?.raw?.file_path || rec?.fileUrl || rec?.raw?.url;

    if (!targetFile || targetFile === "null" || targetFile === "undefined") {
      showToast("Downloading record...", "info");
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

    if (!selectedFile && !uploadedFileName) {
      showToast("Please select a file to upload.", "error");
      return;
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      showToast("File size must not exceed 10MB.", "error");
      return;
    }

    if (!recordTitle || !recordTitle.trim()) {
      showToast("Please enter document title", "error");
      return;
    }

    uploadCancelledRef.current = false;
    setUploading(true);
    try {
      let finalFileName = uploadedFileName;
      if (!finalFileName && selectedFile) {
        const folderName = 'HealthRecords';
        const fileExt = selectedFile.name.split('.').pop();
        const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const uploadRes = await uploadImage(selectedFile, folderName, generatedName);
        if (uploadCancelledRef.current) return;
        finalFileName = uploadRes?.filename || uploadRes?.fileName || uploadRes?.result || uploadRes?.data || generatedName;
        setUploadedFileName(finalFileName);
      }

      if (uploadCancelledRef.current) return;

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

      await api.post("/api/patientHealthRecord/upsert", {
        id: 0,
        app_user_id: appUserId,
        file_type: fileExt,
        title: recordTitle.trim(),
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

      if (uploadCancelledRef.current) return;

      setUploadSuccess(true);
      showToast("Medical record saved successfully!", "success");

      await fetchRecords(1);
      setActiveTab("personal");

      setTimeout(() => {
        if (!uploadCancelledRef.current) {
          setShowUploadModal(false);
          setUploadSuccess(false);
          setSelectedFile(null);
          setUploadedFileName("");
          setRecordTitle("");
          setDoctorName("");
          setErrors({});
        }
      }, 1000);

    } catch (err) {
      if (uploadCancelledRef.current) return;
      console.error("Upload & Save error:", err);
      showToast("Failed to save health record. Please try again.", "error");
    } finally {
      if (!uploadCancelledRef.current) {
        setUploading(false);
      }
    }
  };

  // Sample cards matching 100% exact image when no API records are present
  const defaultCards = [
    {
      id: "demo-1",
      title: "Blood Test",
      categoryHeader: "DIAGNOSTIC REPORT",
      badgeLabel: "HealthDocumentRecord",
      verified: true,
      doctorLabel: "Doctor",
      doctorValue: "Dr, Priya",
      date: "04 Sept 2026",
      filePath: null
    },
    {
      id: "demo-2",
      title: "Blood Test",
      categoryHeader: "CONSULTATION SUMMARY",
      badgeLabel: "WellnessRecord",
      verified: true,
      doctorLabel: "Consultant",
      doctorValue: "Consultant",
      date: "04 Sept 2026",
      filePath: null
    }
  ];

  const displayRecords = (records && records.length > 0) ? records : defaultCards;

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: '#F4F7F6', minHeight: '100vh' }}>

      {/* Header Banner */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', link: '/' },
          { label: 'Health Vault' }
        ]}
        title="Health Vault"
        icon={<ShieldCheck size={24} />}
        subtitle="ISO 27001 Certified • 256-bit Encrypted Storage"
        actions={
          <button
            className="btn btn-accent flex items-center gap-2 hover-glow"
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: '#005F56',
              color: '#fff',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CloudUpload size={16} /> Upload Record
          </button>
        }
      />

      <div className="container" style={{ paddingBottom: '50px', paddingTop: '24px' }}>
        
        {/* ── Top Bar Box Matching Image Exactly ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '10px 16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>

          {/* Left Tabs Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('personal')}
              style={{
                background: activeTab === 'personal' ? '#005F56' : 'transparent',
                color: activeTab === 'personal' ? '#FFFFFF' : '#005F56',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'personal' ? '0 2px 6px rgba(0, 95, 86, 0.2)' : 'none'
              }}
            >
              <Archive size={18} />
              My Uploads & Hospital Records
            </button>

            <button
              onClick={() => setActiveTab('abha')}
              style={{
                background: activeTab === 'abha' ? '#005F56' : 'transparent',
                color: activeTab === 'abha' ? '#FFFFFF' : '#005F56',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Fingerprint size={18} color={activeTab === 'abha' ? '#FFFFFF' : '#005F56'} />
              ABHA Network
            </button>
          </div>

          {/* Right Search Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); fetchRecords(1, searchQuery); }} style={{ margin: 0 }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                style={{
                  width: '100%',
                  background: '#F4F7F6',
                  border: '1px solid #E2E8F0',
                  borderRadius: '999px',
                  padding: '9px 38px 9px 16px',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              <Search 
                size={16} 
                color="#94A3B8" 
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </form>

        </div>

        {/* ── Content Grid Section ── */}
        <section style={{ width: '100%' }}>

          {activeTab === 'abha' ? (
            isAbhaLinked ? (
              loadingAbha ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
                      <div className="skeleton skeleton-title" style={{ width: '60%', height: '24px', marginBottom: '16px' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80%', height: '16px' }}></div>
                    </div>
                  ))}
                </div>
              ) : abhaRecords.length === 0 ? (
                <div className="card-elevated" style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '8px', fontWeight: '700' }}>No ABHA records found</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>Your ABHA account is linked. Synced records from linked hospitals will automatically appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {abhaRecords.map((rec) => {
                    const docName = rec.type || "ABHA Record";
                    const isWellness = String(docName).toLowerCase().includes("wellness") || String(docName).toLowerCase().includes("summary");
                    const badgeType = isWellness ? "WellnessRecord" : "HealthDocumentRecord";
                    const categoryText = isWellness ? "CONSULTATION SUMMARY" : "DIAGNOSTIC REPORT";
                    const targetFile = rec?.filePath || rec?.fileUrl || rec?.raw?.file_name;
                    const hasFile = Boolean(targetFile && targetFile !== "null" && targetFile !== "undefined");

                    return (
                      <div
                        key={rec.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          padding: '20px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {/* Top Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{
                              background: '#E6F4F1',
                              color: '#005F56',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#005F56' }}></span>
                              {badgeType}
                            </span>

                            <span style={{
                              background: '#E6F4F1',
                              color: '#005F56',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ✓ Verified
                            </span>
                          </div>

                          {/* Title Block */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '14px',
                              background: '#E6F4F1',
                              color: '#005F56',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <FileText size={22} color="#005F56" />
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', color: '#005F56', textTransform: 'uppercase' }}>
                                {categoryText}
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                                {rec.title || "Health Record"}
                              </div>
                            </div>
                          </div>

                          {/* Gray Details Container */}
                          <div style={{
                            background: '#F8FAFC',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                                <Stethoscope size={15} color="#8B5CF6" /> {isWellness ? "Consultant" : "Doctor"}
                              </span>
                              <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '700' }}>
                                {rec.doctor || "Consultant"}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                                <Calendar size={15} color="#8B5CF6" /> Date
                              </span>
                              <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '700' }}>
                                {rec.date || "04 Sept 2026"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button
                            onClick={(e) => handleViewRecord(rec, e)}
                            style={{
                              flex: 1,
                              height: '44px',
                              background: '#005F56',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Eye size={16} color="#FFFFFF" /> View
                          </button>
                          <button
                            onClick={(e) => handleDownloadRecord(rec, e)}
                            style={{
                              width: '44px',
                              height: '44px',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '50%',
                              color: '#005F56',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            title="Download Record"
                          >
                            <Download size={18} color="#005F56" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="card-elevated" style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '8px', fontWeight: '700' }}>No ABHA records found</h3>
                <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>Link your ABHA ID to sync records from external hospitals and clinics.</p>
                <button onClick={() => openLoginModal("/records", "abha_mobile")} style={{ background: '#005F56', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontWeight: '600', cursor: 'pointer' }}>Link ABHA ID</button>
              </div>
            )
          ) : (
            <>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
                      <div className="skeleton skeleton-title" style={{ width: '60%', height: '24px', marginBottom: '16px' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80%', height: '16px' }}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {displayRecords.map((rec) => {
                    const matchedDocType = documentTypes.find(dt => Number(dt.id || dt.document_type_id || dt.value) === Number(rec.raw?.hi_type || rec.raw?.record_type || rec.type));
                    const docName = rec.document_name || rec.raw?.document_name || rec.raw?.document_type_name || rec.raw?.document_type || matchedDocType?.name || matchedDocType?.document_type || matchedDocType?.title || rec.type || "Diagnostic Report";
                    
                    const isWellness = rec.badgeLabel ? rec.badgeLabel === "WellnessRecord" : (String(docName).toLowerCase().includes("wellness") || String(docName).toLowerCase().includes("consultation") || String(docName).toLowerCase().includes("summary"));
                    const badgeType = rec.badgeLabel || (isWellness ? "WellnessRecord" : "HealthDocumentRecord");
                    const categoryText = rec.categoryHeader || (isWellness ? "CONSULTATION SUMMARY" : (String(docName).toUpperCase().includes("PRESCRIPTION") ? "PRESCRIPTION" : "DIAGNOSTIC REPORT"));
                    
                    const doctorLabel = rec.doctorLabel || (isWellness ? "Consultant" : "Doctor");
                    const doctorValue = rec.doctorValue || rec.doctor || rec.hospital_name || rec.raw?.hospital_name || rec.raw?.lab_name || (isWellness ? "Consultant" : "Dr, Priya");
                    const dateValue = rec.date || "04 Sept 2026";
                    const titleText = rec.title || "Blood Test";

                    return (
                      <div
                        key={rec.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          padding: '20px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        className="hover-glow"
                      >
                        <div>
                          {/* Top Badges Row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{
                              background: '#E6F4F1',
                              color: '#005F56',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#005F56' }}></span>
                              {badgeType}
                            </span>

                            <span style={{
                              background: '#E6F4F1',
                              color: '#005F56',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ✓ Verified
                            </span>
                          </div>

                          {/* Icon & Title Row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '14px',
                              background: '#E6F4F1',
                              color: '#005F56',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <FileText size={22} color="#005F56" />
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', color: '#005F56', textTransform: 'uppercase' }}>
                                {categoryText}
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                                {titleText}
                              </div>
                            </div>
                          </div>

                          {/* Gray Info Container Box */}
                          <div style={{
                            background: '#F8FAFC',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                                <Stethoscope size={15} color="#8B5CF6" /> {doctorLabel}
                              </span>
                              <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '700' }}>
                                {doctorValue}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                                <Calendar size={15} color="#8B5CF6" /> Date
                              </span>
                              <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '700' }}>
                                {dateValue}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button
                            onClick={(e) => handleViewRecord(rec, e)}
                            style={{
                              flex: 1,
                              height: '44px',
                              background: '#005F56',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Eye size={16} color="#FFFFFF" /> View
                          </button>
                          <button
                            onClick={(e) => handleDownloadRecord(rec, e)}
                            disabled={downloadingId === rec.id}
                            style={{
                              width: '44px',
                              height: '44px',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '50%',
                              color: '#005F56',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                            title="Download Record"
                          >
                            {downloadingId === rec.id ? <Loader2 size={18} className="animate-spin" color="#005F56" /> : <Download size={18} color="#005F56" />}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {records.length > 0 && records.length < count && !loading && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <button
                    className="btn hover-glow"
                    onClick={() => {
                      const nextPage = pageIndex + 1;
                      setPageIndex(nextPage);
                      fetchRecords(nextPage);
                    }}
                    style={{ background: '#FFFFFF', color: '#005F56', border: '1.5px solid #005F56', padding: '10px 28px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                  >
                    {loadingMore ? "Loading..." : "Load Older Records"}
                  </button>
                </div>
              )}
            </>
          )}

        </section>

      </div>

      {/* Upload Record Modal (Preserved & Enhanced) */}
      {showUploadModal && createPortal(
        <div 
          onClick={handleCancelUpload}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, margin: 0, padding: '12px', overflow: 'hidden' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in-up" 
            style={{ background: '#FFFFFF', width: '100%', maxWidth: '380px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden' }}
          >
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <CloudUpload size={18} color="#005F56" /> Upload Medical Record
              </h3>
              <button 
                type="button"
                onClick={handleCancelUpload} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '16px' }}>
              
              <div 
                onClick={() => {
                  setFocusedField('file');
                  fileInputRef.current?.click();
                }}
                tabIndex={0}
                onFocus={() => setFocusedField('file')}
                onBlur={() => setFocusedField(null)}
                style={{ 
                  border: focusedField === 'file' 
                    ? '2px dashed #005F56' 
                    : '2px dashed #CBD5E1', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  textAlign: 'center', 
                  background: '#F8FAFC', 
                  cursor: 'pointer', 
                  marginBottom: '12px', 
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" 
                  style={{ display: 'none' }} 
                />
                {uploadingFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={20} color="#005F56" className="animate-spin" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>Uploading to server...</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>Sending file</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FileText size={20} color="#005F56" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>{selectedFile.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: uploadedFileName ? '#005F56' : '#64748B' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB {uploadedFileName ? "• Ready to Save" : "• Click to change"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <CloudUpload size={24} color="#005F56" style={{ margin: '0 auto 4px', opacity: 0.8 }} />
                    <p style={{ margin: 0, fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>Click or drag file to upload *</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>Supports PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Document Name / Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Blood Test, Chest X-Ray..." 
                  value={recordTitle} 
                  onChange={(e) => setRecordTitle(e.target.value)} 
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    border: focusedField === 'title' ? '1.5px solid #005F56' : '1px solid #CBD5E1', 
                    background: '#FFFFFF', 
                    color: '#0F172A', 
                    outline: 'none', 
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Record Type</label>
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
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid #CBD5E1', 
                    background: '#FFFFFF', 
                    color: '#0F172A', 
                    outline: 'none', 
                    fontSize: '13px'
                  }}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>Doctor / Consultant Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Priya, Consultant" 
                  value={doctorName} 
                  onChange={(e) => setDoctorName(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid #CBD5E1', 
                    background: '#FFFFFF', 
                    color: '#0F172A', 
                    outline: 'none', 
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={handleCancelUpload}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'transparent', color: '#0F172A', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || uploadingFile || uploadSuccess}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#005F56', color: '#FFFFFF', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle2 size={14} /> Saved!
                    </>
                  ) : (
                    <>
                      <CloudUpload size={14} /> Save Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
      />
    </main>
  );
}
