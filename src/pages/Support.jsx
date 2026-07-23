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
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setActiveTab('faq')} style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', color: activeTab === 'faq' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'faq' ? '2px solid var(--primary)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} /> FAQs
            </button>
            <button onClick={() => setActiveTab('chat')} style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Live Chat
            </button>
            <button onClick={() => setActiveTab('tickets')} style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', color: activeTab === 'tickets' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'tickets' ? '2px solid var(--primary)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> My Tickets
            </button>
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
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
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="card-elevated animate-fade-in-up" style={{ height: '500px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  A
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Arvaya Support Agent</h3>
                  <p style={{ fontSize: '12px', opacity: 0.8 }}>Online • Replies typically in minutes</p>
                </div>
              </div>
              
              <div style={{ flex: 1, background: 'var(--bg-app)', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: '16px 0' }}>Today</div>
                
                <div style={{ display: 'flex', gap: '12px', maxWidth: '80%' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: '700' }}>A</div>
                  <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '0 16px 16px 16px', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-main)' }}>
                    Hi Rahul! I'm your Arvaya support assistant. How can I help you today?
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', maxWidth: '80%', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', padding: '12px 16px', borderRadius: '16px 0 16px 16px', fontSize: '14px' }}>
                    I need help understanding my recent lab report.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', maxWidth: '80%' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: '700' }}>A</div>
                  <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '0 16px 16px 16px', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-main)' }}>
                    Sure, I can help with that. Please give me a moment to pull up your recent lab reports from your Health Vault.
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                <input type="text" placeholder="Type your message..." style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-app)' }} />
                <button className="btn btn-primary" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="animate-fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Your Recent Tickets</h3>
                <button className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '13px' }}>Create New Ticket</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: "TKT-9921", title: "Refund not received for cancelled booking", date: "24 Oct 2023", status: "Open" },
                  { id: "TKT-8842", title: "Issue with prescription download", date: "15 Sep 2023", status: "Resolved" }
                ].map(t => (
                  <div key={t.id} className="card-elevated" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>{t.id}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.date}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{t.title}</h4>
                    </div>
                    <span style={{ display: 'inline-block', padding: '4px 10px', background: t.status === 'Resolved' ? '#dcfce7' : '#fef08a', color: t.status === 'Resolved' ? '#16a34a' : '#854d0e', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
