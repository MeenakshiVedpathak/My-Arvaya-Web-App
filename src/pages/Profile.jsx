import { useState, useEffect } from "react";
import { Edit2, Check, Shield, Camera, Plus, Trash2, ChevronRight, User, HeartPulse, FileText, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  const [profile, setProfile] = useState({
    name: user?.name || "John Doe",
    phone: user?.phone || "+91 9876543210",
    email: user?.email || "john.doe@example.com",
    dob: "1985-05-15",
    gender: "Male",
    patientId: user?.patientId || `ARV-${Math.floor(1000 + Math.random() * 9000)}`,
    
    bloodGroup: "O+",
    height: "175",
    weight: "72",
    allergies: "Penicillin, Peanuts",
    chronicDiseases: "None",
    medications: "Vitamin D3",
    
    insuranceProvider: "HDFC Ergo General",
    policyNumber: "POL-98765432100",
    validity: "2027-12-31",
    
    emergencyName: "Jane Doe",
    emergencyRelation: "Spouse",
    emergencyPhone: "+91 9876500000"
  });

  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: "Jane Doe", relation: "Spouse", age: 38 },
    { id: 2, name: "Jimmy Doe", relation: "Son", age: 12 }
  ]);

  useEffect(() => {
    document.title = "Patient Profile | Arvaya Patient Portal";
  }, []);

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
            <div className="card-elevated" style={{ padding: '8px', borderRadius: '16px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }} className="styled-scrollbar">
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
                    onClick={() => setActiveTab(tab.id)}
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
                    <button className="btn btn-secondary hover-glow" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}>
                      <Plus size={16} /> Add Member
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {familyMembers.map(member => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-app)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--primary-soft))', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700' }}>
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{member.name}</h4>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{member.relation} • {member.age} yrs</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost" style={{ padding: '8px', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                          <button className="btn btn-ghost" style={{ padding: '8px', color: 'var(--danger, #dc2626)' }}><Trash2 size={16} /></button>
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
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </main>
  );
}
