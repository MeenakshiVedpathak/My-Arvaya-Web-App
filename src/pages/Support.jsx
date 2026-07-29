import { MessageSquare, Phone, Mail, HelpCircle, FileText, ChevronRight, Send, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Support() {
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    { q: "How do I cancel my appointment?", a: "You can cancel your appointment by going to 'My Appointments' and clicking on the 'Cancel' button next to your upcoming appointment. Note that cancellations made within 2 hours of the scheduled time may not be eligible for a full refund." },
    { q: "When will I get my lab reports?", a: "Most routine lab reports are uploaded to your Health Vault within 24 hours of sample collection. Specialized tests may take 48-72 hours." },
    { q: "How does the Arvaya wallet work?", a: "You can add money to your Arvaya wallet using UPI, credit/debit cards, or net banking. Wallet cash can be used for any service on the app, and refunds are instantly credited back to your wallet." },
    { q: "What should I do in an emergency?", a: "Click the red SOS or Ambulance button available on the home page or floating at the bottom of the screen. We dispatch our advanced life-support ambulances with a 15-minute ETA." }
  ];

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Help & Support</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Help & Support</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>We are here to help you 24/7 with any queries or issues.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        
        {/* Contact Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="card-elevated flex items-center gap-4" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>24/7 Helpline</p>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>1800-123-4567</h3>
            </div>
          </div>
          <div className="card-elevated flex items-center gap-4" style={{ padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Email Us</p>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>support@arvaya.com</h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div className="animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <Search size={18} color="var(--muted)" />
              <input type="text" placeholder="Search for help..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '12px', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, i) => (
                <div key={i} className="card-elevated" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>{faq.q}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
