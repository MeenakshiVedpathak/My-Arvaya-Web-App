import { Brain, HeartPulse, Activity, ChevronRight, ShieldCheck, FileText, ActivitySquare, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../components/common/PageHeader";

export default function AIAssistant() {
  const [symptom, setSymptom] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!symptom.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        condition: "Mild Tension Headache / Stress",
        urgency: "Low - Self Care",
        recommendations: [
          "Stay hydrated (drink 2-3L water daily)",
          "Take adequate rest and limit screen time",
          "If pain persists over 48 hours, consult a General Physician"
        ]
      });
    }, 1500);
  };

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <PageHeader
        breadcrumbs={[
          { label: 'Home', link: '/' },
          { label: 'Arvaya AI' }
        ]}
        title="Arvaya AI Intelligence"
        icon={<Brain size={24} />}
        subtitle="Predictive health scores and AI-powered symptom checking."
      />

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        
        <div className="ai-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px' }}>
          
          {/* Left Column: Health Score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px', alignSelf: 'start' }}>
            <div className="card-elevated" style={{ padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(90deg, #fbbf24, #10b981)' }}></div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Comprehensive Health Score</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Based on your lab reports, vitals, and activity.</p>
              
              <div style={{ position: 'relative', width: '200px', height: '100px', margin: '0 auto 24px', overflow: 'hidden' }}>
                <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '16px solid var(--border)', position: 'absolute', top: 0, left: 0, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                <div style={{ width: '200px', height: '200px', borderRadius: '50%', border: '16px solid #10b981', position: 'absolute', top: 0, left: 0, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(45deg)' }}></div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>82</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Good</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}><HeartPulse size={14} color="#ef4444" /> Heart</div>
                  <b style={{ fontSize: '16px', color: 'var(--text-main)' }}>Healthy</b>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}><ActivitySquare size={14} color="#3b82f6" /> Vitals</div>
                  <b style={{ fontSize: '16px', color: 'var(--text-main)' }}>Stable</b>
                </div>
              </div>

              <button className="btn btn-secondary" style={{ width: '100%' }}>View Detailed Analysis</button>
            </div>

            <div className="card-elevated" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--primary)" /> Insights
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginTop: '6px', flexShrink: 0 }}></div>
                  Your Vitamin D levels have improved since your last test.
                </li>
                <li style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', marginTop: '6px', flexShrink: 0 }}></div>
                  Slightly elevated cholesterol. Recommend dietary adjustments.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Symptom Checker */}
          <div className="card-elevated" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>AI Symptom Checker</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Describe your symptoms for a quick assessment.</p>
              </div>
            </div>

            <textarea 
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="E.g., I have been experiencing a mild headache and low-grade fever since yesterday morning..."
              style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', resize: 'none', marginBottom: '16px' }}
            ></textarea>

            <button 
              className="btn btn-accent flex items-center justify-center gap-2" 
              style={{ padding: '14px', fontSize: '15px' }}
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? <span className="pulse-dot" style={{ background: 'white' }}></span> : <Brain size={18} />}
              {analyzing ? 'Analyzing Symptoms...' : 'Analyze Symptoms'}
            </button>

            {result && (
              <div className="animate-fade-in-up" style={{ marginTop: '24px', padding: '24px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={18} color="#eab308" />
                  <b style={{ fontSize: '15px', color: 'var(--text-main)' }}>{result.condition}</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Severity:</span>
                  <span style={{ padding: '4px 8px', background: '#fef08a', color: '#854d0e', borderRadius: '4px', fontWeight: '600' }}>{result.severity}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {result.recommendation}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
                  * This is an AI-generated assessment and does not replace professional medical advice.
                </div>
                <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FileText size={16} /> {result.actionText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .ai-grid { grid-template-columns: 1fr !important; }
          .ai-grid > div > .card-elevated { position: relative !important; top: 0 !important; }
        }
      `}} />
    </main>
  );
}
