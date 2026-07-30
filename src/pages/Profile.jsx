import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Edit2, Check, Shield, Camera, Plus, Trash2, ChevronRight, User, HeartPulse, FileText, Users, Loader2, X, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getPatients, getFamilyDetails, upsertFamilyDetails, updateAppUser } from "../services/dataService";
import { uploadImage, getImageUrl, fetchImageBlob } from "../services/uploadService";

function formatGender(g) {
  if (!g) return "Male";
  const code = String(g).trim().toUpperCase();
  if (code === "F" || code.startsWith("FEMALE")) return "Female";
  if (code === "M" || code.startsWith("MALE")) return "Male";
  if (code === "O" || code.startsWith("OTHER")) return "Other";
  return g;
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [loadingData, setLoadingData] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const userImageInputRef = useRef(null);
  const [uploadingUserImage, setUploadingUserImage] = useState(false);
  const [userDisplayImage, setUserDisplayImage] = useState("");

  // Add Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: "",
    relation: "Spouse",
    dob: "",
    bloodGroup: "B+",
    gender: "Male",
    mobile: "",
    weight: "",
    height: "",
    profileImage: "",
    imageFile: null,
    abhaNumber: ""
  });
  
  const [profile, setProfile] = useState(() => ({
    name: user?.name || user?.full_name || user?.fullName || "John Doe",
    phone: user?.phone || user?.mobile_number || user?.mobile || "+91 9876543210",
    email: user?.email || "john.doe@example.com",
    dob: user?.date_of_birth || user?.dob || "1985-05-15",
    gender: formatGender(user?.gender),
    patientId: user?.patientId || user?.user_id || user?.id || `ARV-${Math.floor(1000 + Math.random() * 9000)}`,
    
    bloodGroup: user?.blood_group || user?.bloodGroup || "O+",
    height: user?.height || "175",
    weight: user?.weight || "72",
    allergies: user?.allergies || "Penicillin, Peanuts",
    chronicDiseases: user?.chronicDiseases || "None",
    medications: user?.medications || "Vitamin D3",
    
    insuranceProvider: user?.insuranceProvider || "HDFC Ergo General",
    policyNumber: user?.policyNumber || "POL-98765432100",
    validity: user?.validity || "2027-12-31",
    
    emergencyName: user?.emergencyName || "Jane Doe",
    emergencyRelation: user?.emergencyRelation || "Spouse",
    emergencyPhone: user?.emergencyPhone || "+91 9876500000"
  }));

  const [editingMemberId, setEditingMemberId] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  const handleMemberFormChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMemberForm(prev => ({
        ...prev,
        displayImage: reader.result,
        imageFile: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingMemberId(null);
    setMemberForm({
      name: "",
      relation: "Spouse",
      dob: "",
      bloodGroup: "B+",
      gender: "Male",
      mobile: "",
      weight: "",
      height: "",
      profileImage: "",
      displayImage: "",
      imageFile: null,
      abhaNumber: ""
    });
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMemberId(member.family_detail_id || member.id);
    setMemberForm({
      name: member.name || "",
      relation: member.relation || "Spouse",
      dob: member.dob || "",
      bloodGroup: member.bloodGroup || "B+",
      gender: formatGender(member.gender),
      mobile: member.mobile || "",
      weight: member.weight || "",
      height: member.height || "",
      profileImage: member.profileImage || "",
      displayImage: member.displayImage || "",
      imageFile: null,
      abhaNumber: member.abhaNumber || ""
    });
    setIsMemberModalOpen(true);
  };

  const fetchFamilyMembers = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("arvaya_user") || "{}");
      const appUserId = user?.app_user_id || user?.user_id || user?.id || storedUser?.app_user_id || storedUser?.user_id || storedUser?.id || 107602;
      const clientId = user?.client_id || storedUser?.client_id || 1;

      const payload = {
        app_user_id: appUserId,
        client_id: clientId,
        filter: ` AND app_user_id = ${appUserId}`
      };

      const res = await getFamilyDetails(payload);
      
      let list = Array.isArray(res) ? res : res?.data || res?.list || res?.familyDetails || res?.result || [];
      if (Array.isArray(list)) {
        const mapped = list.map((item, idx) => {
          let age = item.age;
          if (!age && item.dob) {
            const birthYear = new Date(item.dob).getFullYear();
            const currentYear = new Date().getFullYear();
            age = Math.max(0, currentYear - birthYear);
          }
          const rawImg = item.profile_image || item.profileImage || item.image || item.family_profile_image || item.photo || "";
          let resolvedDisplayImg = "";
          if (rawImg) {
            resolvedDisplayImg = (rawImg.startsWith("data:") || rawImg.startsWith("blob:") || rawImg.startsWith("http"))
              ? rawImg
              : getImageUrl(rawImg, 'familyProfileImage');
          }
          return {
            id: item.id || item.family_detail_id || idx + 1,
            family_detail_id: item.family_detail_id || item.id,
            name: item.name || "",
            relation: item.relation || "",
            dob: item.dob || "",
            bloodGroup: item.blood_group || item.bloodGroup || "",
            gender: item.gender || "",
            mobile: item.mobile_number || item.mobile || "",
            weight: item.weight || "",
            height: item.height || "",
            profileImage: rawImg,
            displayImage: resolvedDisplayImg,
            abhaNumber: item.abha_number || item.abhaNumber || "",
            age: age !== undefined && age !== "" ? age : 25
          };
        });
        setFamilyMembers(mapped);
      }
    } catch (err) {
      console.error("fetchFamilyMembers error:", err);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;

    setSavingMember(true);
    try {
      let finalImageUrl = memberForm.profileImage;

      if (memberForm.imageFile) {
        const folderName = 'familyProfileImage';
        const fileExt = memberForm.imageFile.name.split('.').pop();
        const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
        try {
          const uploadRes = await uploadImage(memberForm.imageFile, folderName, generatedName);
          if (uploadRes) {
            finalImageUrl = generatedName;
          }
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
        }
      }

      let genderCode = memberForm.gender || "M";
      const lowerG = String(genderCode).trim().toLowerCase();
      if (lowerG.startsWith("f")) genderCode = "F";
      else if (lowerG.startsWith("m")) genderCode = "M";
      else if (lowerG.startsWith("o")) genderCode = "O";

      const appUserId = user?.user_id || user?.id || user?.app_user_id || user?.userKey || 1;
      const payload = {
        app_user_id: appUserId,
        name: memberForm.name.trim(),
        relation: memberForm.relation,
        dob: memberForm.dob,
        blood_group: memberForm.bloodGroup,
        gender: genderCode,
        mobile_number: memberForm.mobile,
        is_active: 1,
        weight: memberForm.weight,
        height: memberForm.height,
        profile_image: finalImageUrl,
        abha_number: memberForm.abhaNumber,
        client_id: user?.client_id || 1
      };

      if (editingMemberId) {
        payload.family_detail_id = editingMemberId;
        payload.id = editingMemberId;
      }

      await upsertFamilyDetails(payload);

      // Refresh list from API (hitting /api/familyDetails/get after add or edit)
      await fetchFamilyMembers();

      setIsMemberModalOpen(false);
      setEditingMemberId(null);
      setMemberForm({
        name: "",
        relation: "Spouse",
        dob: "",
        bloodGroup: "B+",
        gender: "Male",
        mobile: "",
        weight: "",
        height: "",
        profileImage: "",
        imageFile: null,
        abhaNumber: ""
      });
    } catch (err) {
      console.error("Failed to save family member:", err);
    } finally {
      setSavingMember(false);
    }
  };

  const loadPatientProfile = async () => {
    setLoadingData(true);
    try {
      const storedUser = localStorage.getItem("arvaya_user");
      let storedUserId = user?.id || user?.user_id || user?.app_user_id;
      if (!storedUserId && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          storedUserId = parsed?.id || parsed?.user_id || parsed?.app_user_id;
        } catch (e) {}
      }

      const mobile = user?.phone || user?.mobile_number || user?.mobile;
      const filters = {
        ...(storedUserId ? { id: storedUserId, filterQuery: ` AND id=${storedUserId}` } : {}),
        ...(mobile ? { mobile_number: mobile } : {})
      };
      const res = await getPatients(filters);

      let patientData = null;
      if (Array.isArray(res) && res.length > 0) {
        patientData = res.find(p => String(p.id || p.user_id || p.app_user_id) === String(storedUserId)) 
          || res.find(p => (p.mobile_number || p.phone || p.mobile) === mobile) 
          || res[0];
      } else if (res && typeof res === "object" && !Array.isArray(res) && (res.name || res.full_name || res.first_name || res.mobile_number || res.phone || res.id || res.user_id)) {
        patientData = res;
      }

      if (patientData) {
        let fullName = patientData.name || patientData.full_name || patientData.fullName || patientData.user_name;
        if (!fullName && (patientData.first_name || patientData.last_name)) {
          const title = patientData.title ? patientData.title.trim() + " " : "";
          fullName = `${title}${patientData.first_name || ""} ${patientData.last_name || ""}`.trim();
        }

        const parsedHeight = patientData.height ?? patientData.height_cm ?? patientData.heightCm ?? patientData.user_height;
        const parsedWeight = patientData.weight ?? patientData.weight_kg ?? patientData.weightKg ?? patientData.user_weight;
        const userImgRaw = patientData.profile_image || patientData.profileImage || patientData.photo || patientData.image || "";

        if (userImgRaw) {
          const resolvedBlob = await fetchImageBlob(userImgRaw, "patientProfileImage") || getImageUrl(userImgRaw, "patientProfileImage");
          if (resolvedBlob) setUserDisplayImage(resolvedBlob);
        }

        setProfile(prev => ({
          ...prev,
          ...patientData,
          name: fullName || prev.name,
          phone: patientData.mobile_number || patientData.phone || patientData.mobile || patientData.mobile_no || prev.phone,
          email: patientData.email || prev.email,
          dob: patientData.date_of_birth || patientData.dob || prev.dob,
          gender: formatGender(patientData.gender || prev.gender),
          patientId: patientData.patientId || patientData.user_id || patientData.id || prev.patientId,
          bloodGroup: patientData.blood_group || patientData.bloodGroup || prev.bloodGroup,
          height: (parsedHeight !== null && parsedHeight !== undefined && String(parsedHeight).trim() !== "") ? String(parsedHeight) : prev.height,
          weight: (parsedWeight !== null && parsedWeight !== undefined && String(parsedWeight).trim() !== "") ? String(parsedWeight) : prev.weight,
          profile_image: userImgRaw || prev.profile_image || ""
        }));
      }
    } catch (err) {
      console.error("Error loading patient profile data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    document.title = "Patient Profile | Arvaya Patient Portal";
    loadPatientProfile();
  }, [user]);

  useEffect(() => {
    if (isMemberModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMemberModalOpen]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleStartEdit = () => {
    setActiveTab("personal");
    setIsEditing(true);
  };

  const handleUserProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserDisplayImage(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingUserImage(true);
    try {
      const folderName = 'patientProfileImage';
      const fileExt = file.name.split('.').pop();
      const generatedName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // 1. Instantly trigger upload API
      const uploadRes = await uploadImage(file, folderName, generatedName);
      const filenameToSend = uploadRes?.filename || uploadRes?.fileName || generatedName;

      setProfile(prev => ({
        ...prev,
        profile_image: filenameToSend
      }));

      // 2. Instantly send uploaded image in payload of api/appUser/upsert
      const storedUser = localStorage.getItem("arvaya_user");
      let appUserId = user?.id || user?.user_id || user?.app_user_id;
      if (!appUserId && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          appUserId = parsed?.id || parsed?.user_id || parsed?.app_user_id;
        } catch (err) {}
      }

      let genderCode = profile.gender || "M";
      const lowerG = String(genderCode).trim().toLowerCase();
      if (lowerG.startsWith("f")) genderCode = "F";
      else if (lowerG.startsWith("m")) genderCode = "M";
      else if (lowerG.startsWith("o")) genderCode = "O";

      const payload = {
        id: appUserId,
        app_user_id: appUserId,
        name: profile.name,
        email: profile.email,
        mobile_number: profile.phone,
        date_of_birth: profile.dob,
        gender: genderCode,
        blood_group: profile.bloodGroup,
        height: String(profile.height || ""),
        weight: String(profile.weight || ""),
        profile_image: filenameToSend,
        client_id: user?.client_id || 1
      };

      await updateAppUser(payload);

      // 3. Retrieve image from backend folder patientProfileImage
      const blobUrl = await fetchImageBlob(filenameToSend, folderName);
      if (blobUrl) {
        setUserDisplayImage(blobUrl);
      }

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const updatedUser = {
            ...parsed,
            profile_image: filenameToSend
          };
          localStorage.setItem("arvaya_user", JSON.stringify(updatedUser));
        } catch (err) {}
      }

      window.dispatchEvent(new Event("arvaya_profile_updated"));
    } catch (uploadErr) {
      console.error("User profile image upload error:", uploadErr);
    } finally {
      setUploadingUserImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const storedUser = localStorage.getItem("arvaya_user");
      let appUserId = user?.id || user?.user_id || user?.app_user_id;
      if (!appUserId && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          appUserId = parsed?.id || parsed?.user_id || parsed?.app_user_id;
        } catch (e) {}
      }

      let genderCode = profile.gender || "M";
      const lowerG = String(genderCode).trim().toLowerCase();
      if (lowerG.startsWith("f")) genderCode = "F";
      else if (lowerG.startsWith("m")) genderCode = "M";
      else if (lowerG.startsWith("o")) genderCode = "O";

      const payload = {
        id: appUserId,
        app_user_id: appUserId,
        name: profile.name,
        email: profile.email,
        mobile_number: profile.phone,
        date_of_birth: profile.dob,
        gender: genderCode,
        blood_group: profile.bloodGroup,
        height: String(profile.height || ""),
        weight: String(profile.weight || ""),
        profile_image: profile.profile_image || "",
        client_id: user?.client_id || 1
      };

      // Trigger /api/appUser/upsert
      await updateAppUser(payload);

      // Immediately trigger /api/appUser/get to refresh profile from backend
      await loadPatientProfile();

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const updatedUser = {
            ...parsed,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            mobile_number: profile.phone,
            gender: profile.gender,
            blood_group: profile.bloodGroup,
            height: profile.height,
            weight: profile.weight,
            profile_image: profile.profile_image || ""
          };
          localStorage.setItem("arvaya_user", JSON.stringify(updatedUser));
        } catch (e) {}
      }

      window.dispatchEvent(new Event("arvaya_profile_updated"));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile via appUser/upsert:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const inputStyle = !isEditing ? { background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' } : { padding: '12px 16px' };

  return (
    <main id="profile-page-main" className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Patient Profile</span>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 id="profile-heading" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Patient Profile</h1>
              <p className="text-muted mt-1" style={{ fontSize: '14px' }}>Manage your personal, medical, and insurance records.</p>
            </div>
            <button 
              id="profile-edit-btn"
              className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'} hover-glow`}
              onClick={isEditing ? handleSaveProfile : handleStartEdit}
              disabled={savingProfile}
              style={{ padding: '10px 20px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
            >
              {savingProfile ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : isEditing ? (
                <><Check size={16} /> Save Changes</>
              ) : (
                <><Edit2 size={16} /> Edit Profile</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Sticky Profile Card */}
          <aside className="profile-sidebar" style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-elevated" style={{ padding: '32px 24px', textAlign: 'center', borderRadius: '16px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div 
                  className="animate-scale-in" 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', boxShadow: '0 8px 24px rgba(46,102,110,0.2)', margin: '0 auto', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                  onClick={() => userImageInputRef.current?.click()}
                  title="Click to upload profile photo"
                >
                  {userDisplayImage || profile.profile_image ? (
                    <img 
                      src={userDisplayImage || getImageUrl(profile.profile_image, 'patientProfileImage')} 
                      alt={profile.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }} 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={() => userImageInputRef.current?.click()}
                  className="hover-glow" 
                  style={{ position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 2 }} 
                  title="Upload Profile Image"
                >
                  {uploadingUserImage ? <Loader2 size={16} className="animate-spin text-primary" /> : <Camera size={16} />}
                </button>
                <input 
                  type="file" 
                  ref={userImageInputRef} 
                  accept="image/*" 
                  onChange={handleUserProfileImageUpload} 
                  style={{ display: 'none' }} 
                />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>{profile.name}</h2>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '13px' }}><Shield size={14} /> KYC Verified</span>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient ID</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px', fontFamily: 'monospace' }}>{profile.patientId}</div>
              </div>

              {/* Quick Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--primary-dark)', fontWeight: '600' }}>Blood Group</div>
                  <div style={{ fontSize: '16px', color: 'var(--primary-dark)', fontWeight: '800', marginTop: '2px' }}>{profile.bloodGroup}</div>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Height / Weight</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '700', marginTop: '2px' }}>{profile.height}cm / {profile.weight}kg</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Horizontal Tabs */}
            <div className="card-elevated styled-scrollbar" style={{ padding: '8px', borderRadius: '16px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {[
                { id: 'personal', label: 'Personal Details', icon: User },
                { id: 'family', label: 'Family Members', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'family') {
                        fetchFamilyMembers();
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: isActive ? '700' : '600',
                      color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      flex: '1', justifyContent: 'center'
                    }}
                    onMouseOver={e => { if(!isActive) e.currentTarget.style.background = 'var(--bg-app)'; }}
                    onMouseOut={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={16} className={isActive ? 'text-primary' : 'text-muted'} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Form Content */}
            <div className="card-elevated" style={{ padding: '32px', borderRadius: '16px', background: 'var(--bg-surface)' }}>
              {activeTab === 'personal' && (
                <div className="animate-fade-in-up">
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} className="text-primary" /> Personal Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Row 1: Full Name & Email Address */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Full Name</label>
                        <input name="name" value={profile.name} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Email Address</label>
                        <input name="email" value={profile.email} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                      </div>
                    </div>

                    {/* Row 2: Phone Number & Date of Birth */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Phone Number</label>
                        <input name="phone" value={profile.phone} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Date of Birth</label>
                        <input type="date" name="dob" value={profile.dob} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                      </div>
                    </div>

                    {/* Row 3: Gender, Blood Group, Height (cm), Weight (kg) in 1 Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Gender</label>
                        <select name="gender" value={profile.gender} onChange={handleChange} disabled={!isEditing} className="input-field" style={{...inputStyle, appearance: !isEditing ? 'none' : 'auto'}}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Blood Group</label>
                        <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} disabled={!isEditing} className="input-field" style={{...inputStyle, appearance: !isEditing ? 'none' : 'auto'}}>
                          <option value="B+">B+</option>
                          <option value="A+">A+</option>
                          <option value="O+">O+</option>
                          <option value="AB+">AB+</option>
                          <option value="A-">A-</option>
                          <option value="B-">B-</option>
                          <option value="O-">O-</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Height (cm)</label>
                        <input name="height" type="number" value={profile.height} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} placeholder="E.g., 175" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Weight (kg)</label>
                        <input name="weight" type="number" value={profile.weight} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} placeholder="E.g., 70" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medical' && (
                <div className="animate-fade-in-up">
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartPulse size={20} className="text-primary" /> Medical History
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Blood Group</label>
                      <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} disabled={true} className="input-field" style={{...inputStyle, appearance: 'none'}}>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Height (cm)</label>
                      <input name="height" type="number" value={profile.height} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Weight (kg)</label>
                      <input name="weight" type="number" value={profile.weight} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Allergies</label>
                      <input name="allergies" value={profile.allergies} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} placeholder="E.g., Peanuts, Dust" />
                    </div>
                    <div className="flex flex-col gap-2" style={{ gridColumn: '1 / -1' }}>
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Chronic Diseases</label>
                      <input name="chronicDiseases" value={profile.chronicDiseases} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} placeholder="E.g., Asthma, Diabetes" />
                    </div>
                    <div className="flex flex-col gap-2" style={{ gridColumn: '1 / -1' }}>
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Current Medications</label>
                      <input name="medications" value={profile.medications} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="animate-fade-in-up">
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} className="text-primary" /> Primary Insurance
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Provider Name</label>
                      <input name="insuranceProvider" value={profile.insuranceProvider} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Policy Number</label>
                      <input name="policyNumber" value={profile.policyNumber} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Validity</label>
                      <input type="date" name="validity" value={profile.validity} onChange={handleChange} readOnly={true} className="input-field" style={{ background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)', padding: '12px 16px' }} />
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '24px' }}>
                    Emergency Contact
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Contact Name</label>
                      <input name="emergencyName" value={profile.emergencyName} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Relationship</label>
                      <input name="emergencyRelation" value={profile.emergencyRelation} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Phone Number</label>
                      <input name="emergencyPhone" value={profile.emergencyPhone} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'family' && (
                <div className="animate-fade-in-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} className="text-primary" /> Family Members
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Manage profiles for your dependents and family members.</p>
                    </div>
                    <button 
                      className="btn btn-secondary hover-glow flex items-center gap-1.5" 
                      onClick={handleOpenAddModal}
                      style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}
                    >
                      <Plus size={16} /> Add Member
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {familyMembers.map(member => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-app)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-soft))', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', overflow: 'hidden', position: 'relative' }}>
                            {member.displayImage ? (
                              <img 
                                src={member.displayImage} 
                                alt={member.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }} 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {(member.name || "M").charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{member.name}</h4>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              {member.relation} • {member.age} yrs {member.bloodGroup ? `• ${member.bloodGroup}` : ''} {member.mobile ? `• ${member.mobile}` : ''}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost" onClick={() => handleEditMember(member)} style={{ padding: '8px', color: 'var(--text-muted)' }} title="Edit Member"><Edit2 size={16} /></button>
                          <button className="btn btn-ghost" onClick={() => setFamilyMembers(prev => prev.filter(m => m.id !== member.id))} style={{ padding: '8px', color: 'var(--danger, #dc2626)' }} title="Delete Member"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    
                    {familyMembers.length === 0 && (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        No family members added yet. Click "Add Member" or click tab to refresh.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Family Member Modal ── */}
      {isMemberModalOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999999, padding: '16px', overflow: 'hidden'
        }}>
          <div className="animate-scale-in" style={{
            background: 'var(--bg-surface, #ffffff)', borderRadius: '16px', width: '100%', maxWidth: '540px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  {editingMemberId ? "Edit Family Member" : "Add Family Member"}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                  {editingMemberId ? "Update dependent/family member details" : "Enter dependent/family member details"}
                </p>
              </div>
              <button 
                onClick={() => { setIsMemberModalOpen(false); setEditingMemberId(null); }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} style={{ padding: '14px 18px' }}>
              
              {/* Profile Image Field */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', padding: '6px 12px', background: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-soft))', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
                  {memberForm.displayImage ? (
                    <img src={memberForm.displayImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (memberForm.name.trim().charAt(0) || "F").toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Profile Image</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={12} /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>JPG, PNG</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Row 1: Name & Relation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Name *</label>
                    <input required name="name" value={memberForm.name} onChange={handleMemberFormChange} placeholder="Full Name" className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }} />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Relation *</label>
                    <select name="relation" value={memberForm.relation} onChange={handleMemberFormChange} className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }}>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Date of Birth & Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Date of Birth</label>
                    <input type="date" name="dob" value={memberForm.dob} max={new Date().toISOString().split('T')[0]} onChange={handleMemberFormChange} className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }} />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Gender</label>
                    <select name="gender" value={memberForm.gender} onChange={handleMemberFormChange} className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Blood Group, Height, Weight (in one row) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Blood Group</label>
                    <select name="bloodGroup" value={memberForm.bloodGroup} onChange={handleMemberFormChange} className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }}>
                      <option value="B+">B+</option>
                      <option value="A+">A+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="O-">O-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Height (cm)</label>
                    <input type="number" name="height" value={memberForm.height} onChange={handleMemberFormChange} placeholder="E.g., 170" className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }} />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Weight (kg)</label>
                    <input type="number" name="weight" value={memberForm.weight} onChange={handleMemberFormChange} placeholder="E.g., 65" className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }} />
                  </div>
                </div>

                {/* Row 4: Mobile Number & ABHA Number (in one row) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Mobile Number</label>
                    <input type="tel" name="mobile" value={memberForm.mobile} onChange={handleMemberFormChange} placeholder="10-digit mobile" maxLength={10} className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }} />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>ABHA Number / Address</label>
                    <input name="abhaNumber" value={memberForm.abhaNumber} onChange={handleMemberFormChange} placeholder="E.g., 919876543210@sbx" className="input-field" style={{ padding: '6px 10px', fontSize: '13px' }} />
                  </div>
                </div>

              </div>

              {/* Form Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)} style={{ padding: '6px 16px', fontSize: '13px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingMember} className="btn btn-primary flex items-center gap-2" style={{ padding: '6px 18px', fontSize: '13px' }}>
                  {savingMember ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Member"}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .profile-sidebar { position: relative !important; top: 0 !important; }
        }
      `}} />
    </main>
  );
}
