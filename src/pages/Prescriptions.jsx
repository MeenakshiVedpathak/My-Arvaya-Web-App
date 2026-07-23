import { useState } from "react";
import { FileText, Download, Share2, Calendar, Pill, AlertCircle, Search, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock Data
const mockPrescriptions = [
  { id: 1, doctor: "Dr. Sarah Smith", specialty: "Cardiologist", date: "2024-05-18", status: "active", diagnosis: "Hypertension", medicines: [{ name: "Amlodipine 5mg", dosage: "1-0-0", duration: "30 days" }, { name: "Aspirin 75mg", dosage: "0-0-1", duration: "30 days" }] },
  { id: 2, doctor: "Dr. John Doe", specialty: "Dermatologist", date: "2024-04-10", status: "past", diagnosis: "Acne Vulgaris", medicines: [{ name: "Isotretinoin 20mg", dosage: "0-0-1", duration: "60 days" }, { name: "Clindamycin Gel", dosage: "Apply twice daily", duration: "60 days" }] },
  { id: 3, doctor: "Dr. Emily Chen", specialty: "Pediatrician", date: "2023-11-05", status: "past", diagnosis: "Viral Fever", medicines: [{ name: "Paracetamol 250mg", dosage: "1-1-1 (SOS)", duration: "5 days" }] }
];

export default function Prescriptions() {
  const [activeTab, setActiveTab] = useState("active");
  const [q, setQ] = useState("");

  const filteredPrescriptions = mockPrescriptions.filter(p => 
    p.status === activeTab && 
    (p.doctor.toLowerCase().includes(q.toLowerCase()) || p.diagnosis.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>My Prescriptions</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px', color: 'var(--text-main)' }}>My Prescriptions</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>View, download, and manage your medical prescriptions.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {["active", "past"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 0',
                fontSize: '15px',
                fontWeight: activeTab === tab ? '700' : '500',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                background: 'transparent',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                marginBottom: '-9px'
              }}
            >
              {tab} Prescriptions
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            className="input-field" 
            placeholder="Search doctor or diagnosis..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPrescriptions.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <FileText size={48} color="var(--border)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>No {activeTab} prescriptions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>There are no prescriptions matching your search criteria.</p>
          </div>
        ) : (
          filteredPrescriptions.map(rx => (
            <div key={rx.id} className="card-elevated" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Header: Dr & Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{rx.doctor}</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{rx.specialty}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <Calendar size={14} className="text-primary" />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{new Date(rx.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ background: 'var(--primary-light)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={16} className="text-primary-dark" />
                <span style={{ fontSize: '14px', color: 'var(--primary-dark)' }}><b>Diagnosis:</b> {rx.diagnosis}</span>
              </div>

              {/* Medicines List */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prescribed Medicines</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rx.medicines.map((med, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx === rx.medicines.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Pill size={16} className="text-accent" />
                        </div>
                        <div>
                          <b style={{ fontSize: '15px', color: 'var(--text-main)', display: 'block' }}>{med.name}</b>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Duration: {med.duration}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Dosage</span>
                        <b style={{ fontSize: '14px', color: 'var(--text-main)' }}>{med.dosage}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button className="btn btn-secondary hover-glow" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Share2 size={16} /> Share
                </button>
                <button className="btn btn-primary hover-glow" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} /> Download PDF
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      </div>
    </main>
  );
}
