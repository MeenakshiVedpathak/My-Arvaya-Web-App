import { useState, useEffect } from "react";
import { Edit2, Check, Shield, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || "John Doe",
    phone: user?.phone || "+91 9876543210",
    email: user?.email || "john.doe@example.com",
    dob: "1985-05-15",
    patientId: user?.patientId || `ARV-${Math.floor(1000 + Math.random() * 9000)}`
  });

  useEffect(() => {
    document.title = "Account Settings | Arvaya Patient Portal";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "description";
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    meta.content = "Manage your Arvaya healthcare profile and personal information.";
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <main id="profile-page-main" className="container page animate-fade-in-up" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '800px' }}>
      
      {/* Modern Header */}
      <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 id="profile-heading" style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Account Settings</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>Manage your personal profile and preferences.</p>
        </div>
        <button 
          id="profile-edit-btn"
          className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          style={{ transition: 'all 0.2s', padding: '10px 20px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}
        >
          {isEditing ? <><Check size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
        </button>
      </div>

      <div className="card-elevated" style={{ padding: '32px', borderRadius: '16px', background: 'var(--bg-surface)' }}>
        
        {/* Profile Header section */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div className="animate-scale-in" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', boxShadow: '0 8px 24px rgba(46,102,110,0.2)' }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <button className="hover-glow" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} title="Change Avatar">
                <Camera size={14} />
              </button>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{profile.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
               <span className="badge badge-success" style={{ padding: '4px 10px' }}><Shield size={12} /> KYC Verified</span>
               <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Patient ID: {profile.patientId}</span>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="profile-name" className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Full Name</label>
            <input 
              id="profile-name" name="name" 
              value={profile.name} onChange={handleChange} 
              readOnly={!isEditing}
              className="input-field" 
              style={!isEditing ? { background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)' } : {}}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-email" className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Email Address</label>
            <input 
              id="profile-email" name="email" 
              value={profile.email} onChange={handleChange} 
              readOnly={!isEditing}
              className="input-field" 
              style={!isEditing ? { background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)' } : {}}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-phone" className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Phone Number</label>
            <input 
              id="profile-phone" name="phone" 
              value={profile.phone} onChange={handleChange} 
              readOnly={!isEditing}
              className="input-field" 
              style={!isEditing ? { background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)' } : {}}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="profile-dob" className="text-muted" style={{ fontSize: '13px', fontWeight: '600' }}>Date of Birth</label>
            <input 
              id="profile-dob" type="date" name="dob" 
              value={profile.dob} onChange={handleChange} 
              readOnly={!isEditing}
              className="input-field" 
              style={!isEditing ? { background: 'var(--bg-app)', borderColor: 'transparent', color: 'var(--text-main)' } : {}}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
