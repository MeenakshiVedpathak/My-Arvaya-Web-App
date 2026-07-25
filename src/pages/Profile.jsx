import { useState, useEffect } from "react";
import { Edit2, Check, Shield, Camera, Plus, Trash2, ChevronRight, User, HeartPulse, FileText, Users, Loader2, X, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getPatients, getFamilyDetails, upsertFamilyDetails } from "../services/dataService";

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

  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: "Jane Doe", relation: "Spouse", age: 38 },
    { id: 2, name: "Jimmy Doe", relation: "Son", age: 12 }
  ]);

  const handleMemberFormChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemberForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const appUserId = user?.user_id || user?.id || user?.app_user_id || user?.userKey || 1;
      const res = await getFamilyDetails({ app_user_id: appUserId, client_id: user?.client_id || 1 });
      
      let list = Array.isArray(res) ? res : res?.data || res?.list || [];
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((item, idx) => {
          let age = item.age;
          if (!age && item.dob) {
            const birthYear = new Date(item.dob).getFullYear();
            const currentYear = new Date().getFullYear();
            age = Math.max(0, currentYear - birthYear);
          }
          return {
            id: item.id || item.family_detail_id || idx + 1,
            name: item.name || "",
            relation: item.relation || "",
            dob: item.dob || "",
            bloodGroup: item.blood_group || item.bloodGroup || "",
            gender: item.gender || "",
            mobile: item.mobile_number || item.mobile || "",
            weight: item.weight || "",
            height: item.height || "",
            profileImage: item.profile_image || item.profileImage || "",
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
      const appUserId = user?.user_id || user?.id || user?.app_user_id || user?.userKey || 1;
      const payload = {
        app_user_id: appUserId,
        name: memberForm.name.trim(),
        relation: memberForm.relation,
        dob: memberForm.dob,
        blood_group: memberForm.bloodGroup,
        gender: memberForm.gender,
        mobile_number: memberForm.mobile,
        is_active: 1,
        weight: memberForm.weight,
        height: memberForm.height,
        profile_image: memberForm.profileImage,
        abha_number: memberForm.abhaNumber,
        client_id: user?.client_id || 1
      };

      await upsertFamilyDetails(payload);

      // Refresh list from API
      await fetchFamilyMembers();

      setIsMemberModalOpen(false);
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
        abhaNumber: ""
      });
    } catch (err) {
      console.error("Failed to save family member:", err);
    } finally {
      setSavingMember(false);
    }
  };

  useEffect(() => {
    document.title = "Patient Profile | Arvaya Patient Portal";

    async function loadPatientProfile() {
      setLoadingData(true);
      try {
        const mobile = user?.phone || user?.mobile_number || user?.mobile;
        const filters = mobile ? { mobile_number: mobile } : {};
        const res = await getPatients(filters);

        let patientData = null;
        if (Array.isArray(res) && res.length > 0) {
          patientData = res.find(p => (p.mobile_number || p.phone || p.mobile) === mobile) || res[0];
        } else if (res && typeof res === "object" && !Array.isArray(res) && (res.name || res.full_name || res.first_name || res.mobile_number || res.phone)) {
          patientData = res;
        }

        if (patientData) {
          let fullName = patientData.name || patientData.full_name || patientData.fullName || patientData.user_name;
          if (!fullName && (patientData.first_name || patientData.last_name)) {
            const title = patientData.title ? patientData.title.trim() + " " : "";
            fullName = `${title}${patientData.first_name || ""} ${patientData.last_name || ""}`.trim();
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
            bloodGroup: patientData.blood_group || patientData.bloodGroup || prev.bloodGroup
          }));
        }
        await fetchFamilyMembers();
      } catch (err) {
        console.error("Error loading patient profile data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadPatientProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
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
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              style={{ padding: '10px 20px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
            >
              {isEditing ? <><Check size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Sticky Profile Card */}
          <aside style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-elevated" style={{ padding: '32px 24px', textAlign: 'center', borderRadius: '16px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div className="animate-scale-in" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', boxShadow: '0 8px 24px rgba(46,102,110,0.2)', margin: '0 auto' }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <button className="hover-glow" style={{ position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} title="Change Avatar">
                    <Camera size={16} />
                  </button>
                )}
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
                { id: 'medical', label: 'Medical History', icon: HeartPulse },
                { id: 'insurance', label: 'Insurance Details', icon: FileText },
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Full Name</label>
                      <input name="name" value={profile.name} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Email Address</label>
                      <input name="email" value={profile.email} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Phone Number</label>
                      <input name="phone" value={profile.phone} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Date of Birth</label>
                      <input type="date" name="dob" value={profile.dob} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Gender</label>
                      <select name="gender" value={profile.gender} onChange={handleChange} disabled={!isEditing} className="input-field" style={{...inputStyle, appearance: !isEditing ? 'none' : 'auto'}}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
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
                      <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} disabled={!isEditing} className="input-field" style={{...inputStyle, appearance: !isEditing ? 'none' : 'auto'}}>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Height (cm)</label>
                      <input name="height" type="number" value={profile.height} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Weight (kg)</label>
                      <input name="weight" type="number" value={profile.weight} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Allergies</label>
                      <input name="allergies" value={profile.allergies} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} placeholder="E.g., Peanuts, Dust" />
                    </div>
                    <div className="flex flex-col gap-2" style={{ gridColumn: '1 / -1' }}>
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Chronic Diseases</label>
                      <input name="chronicDiseases" value={profile.chronicDiseases} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} placeholder="E.g., Asthma, Diabetes" />
                    </div>
                    <div className="flex flex-col gap-2" style={{ gridColumn: '1 / -1' }}>
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Current Medications</label>
                      <input name="medications" value={profile.medications} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
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
                      <input name="insuranceProvider" value={profile.insuranceProvider} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Policy Number</label>
                      <input name="policyNumber" value={profile.policyNumber} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Validity Date</label>
                      <input name="validity" type="date" value={profile.validity} onChange={handleChange} readOnly={!isEditing} className="input-field" style={inputStyle} />
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
                      onClick={() => setIsMemberModalOpen(true)}
                      style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}
                    >
                      <Plus size={16} /> Add Member
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {familyMembers.map(member => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-app)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-soft))', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', overflow: 'hidden' }}>
                            {member.profileImage ? (
                              <img src={member.profileImage} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              member.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{member.name}</h4>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              {member.relation} • {member.age} yrs {member.bloodGroup ? `• ${member.bloodGroup}` : ''} {member.mobile ? `• ${member.mobile}` : ''}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost" style={{ padding: '8px', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                          <button className="btn btn-ghost" onClick={() => setFamilyMembers(prev => prev.filter(m => m.id !== member.id))} style={{ padding: '8px', color: 'var(--danger, #dc2626)' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    
                    {familyMembers.length === 0 && (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        No family members added yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Add Family Member Modal ── */}
      {isMemberModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div className="animate-scale-in" style={{
            background: 'var(--bg-surface, #ffffff)', borderRadius: '24px', width: '100%', maxWidth: '640px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Add Family Member</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Enter dependent/family member details</p>
              </div>
              <button 
                onClick={() => setIsMemberModalOpen(false)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
              
              {/* Profile Image Field */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-soft))', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
                  {memberForm.profileImage ? (
                    <img src={memberForm.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (memberForm.name.trim().charAt(0) || "F").toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Profile Image</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={14} /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>JPG, PNG or GIF</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Name *</label>
                  <input required name="name" value={memberForm.name} onChange={handleMemberFormChange} placeholder="Full Name" className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
                </div>

                {/* Relation */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Relation *</label>
                  <select name="relation" value={memberForm.relation} onChange={handleMemberFormChange} className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }}>
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

                {/* Dob */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Date of Birth</label>
                  <input type="date" name="dob" value={memberForm.dob} max={new Date().toISOString().split('T')[0]} onChange={handleMemberFormChange} className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Gender</label>
                  <select name="gender" value={memberForm.gender} onChange={handleMemberFormChange} className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Blood Group</label>
                  <select name="bloodGroup" value={memberForm.bloodGroup} onChange={handleMemberFormChange} className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }}>
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

                {/* Mobile number */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Mobile Number</label>
                  <input type="tel" name="mobile" value={memberForm.mobile} onChange={handleMemberFormChange} placeholder="10-digit mobile number" maxLength={10} className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
                </div>

                {/* Height */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Height (cm)</label>
                  <input type="number" name="height" value={memberForm.height} onChange={handleMemberFormChange} placeholder="E.g., 170" className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Weight (kg)</label>
                  <input type="number" name="weight" value={memberForm.weight} onChange={handleMemberFormChange} placeholder="E.g., 65" className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
                </div>

                {/* Abha Number */}
                <div className="flex flex-col gap-1.5" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>ABHA Number / Address</label>
                  <input name="abhaNumber" value={memberForm.abhaNumber} onChange={handleMemberFormChange} placeholder="E.g., 919876543210@sbx or 14-digit ABHA" className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
                </div>

              </div>

              {/* Form Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)} style={{ padding: '10px 20px', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingMember} className="btn btn-primary flex items-center gap-2" style={{ padding: '10px 24px', fontSize: '14px' }}>
                  {savingMember ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Member"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </main>
  );
}
