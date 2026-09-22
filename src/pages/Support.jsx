import { Phone, PhoneCall, Mail, MapPin, Clock, HelpCircle, FileText, ChevronDown, Send, Search, Zap, Users } from "lucide-react";
import { useState } from "react";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { q: "How do I cancel my appointment?", a: "You can cancel your appointment by going to 'My Appointments' and clicking on the 'Cancel' button next to your upcoming appointment. Note that cancellations made within 2 hours of the scheduled time may not be eligible for a full refund." },
    { q: "When will I get my lab reports?", a: "Most routine lab reports are uploaded to your Health Vault within 24 hours of sample collection. Specialized tests may take 48-72 hours." },
    { q: "How does the Arvaya wallet work?", a: "You can add money to your Arvaya wallet using UPI, credit/debit cards, or net banking. Wallet cash can be used for any service on the app, and refunds are instantly credited back to your wallet." },
    { q: "What should I do in an emergency?", a: "Click the red SOS or Ambulance button available on the home page or floating at the bottom of the screen. We dispatch our advanced life-support ambulances with a 15-minute ETA." }
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFaqs = faqs
    .map((faq, index) => ({ ...faq, originalIndex: index }))
    .filter(faq => !normalizedQuery || `${faq.q} ${faq.a}`.toLowerCase().includes(normalizedQuery));

  return (
    <main className="page support-page animate-fade-in-up">
      <header style={{ padding: '16px 0 0' }}>
        <div className="container">
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '26px',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              color: '#fff',
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.08), transparent 45%), linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 62%, #133a41 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 44px rgba(31, 79, 87, 0.28)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                background: '#fff', color: 'var(--primary-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(0,60,55,0.2)', transform: 'rotate(-6deg)'
              }}>
                <HelpCircle size={26} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', color: '#fff', letterSpacing: '-0.02em' }}>Help &amp; Support</h1>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'rgba(255,255,255,0.82)' }}>Get assistance with your appointments, reports, wallet, and services.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { icon: Zap, label: 'Quick Assistance', color: '#fbbf24' },
                    { icon: Users, label: 'Multiple Services', color: '#5eead4' },
                  ].map(({ icon: Icon, label, color }) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', color: '#fff', background: 'rgba(18,51,58,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '11.5px', fontWeight: '650', backdropFilter: 'blur(10px)' }}>
                      <Icon size={13} color={color} /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <img src="/images/help-support.png" alt="" className="support-hero-img" aria-hidden="true" />
          </div>
        </div>
      </header>

      <div className="container support-shell">
        <section className="support-contact-grid" aria-label="Contact Arvaya support">
          <a className="support-contact-card" href="tel:18001234567">
            <PhoneCall className="support-contact-decor" size={190} strokeWidth={1.4} aria-hidden="true" />
            <span className="support-contact-icon"><Phone size={24} /></span>
            <span className="support-contact-copy">
              <small>24/7 Helpline</small>
              <strong>1800-123-4567</strong>
              <span>Call our support team</span>
              <span className="support-contact-badge">
                <span className="support-contact-dot" /> Available 24/7
              </span>
            </span>
            <span className="support-contact-action"><Send size={17} /></span>
          </a>

          <a className="support-contact-card" href="mailto:support@arvaya.com">
            <Mail className="support-contact-decor" size={190} strokeWidth={1.4} aria-hidden="true" />
            <MapPin className="support-contact-decor support-contact-decor-pin" size={54} strokeWidth={1.6} aria-hidden="true" />
            <span className="support-contact-icon accent"><Mail size={24} /></span>
            <span className="support-contact-copy">
              <small>Email Support</small>
              <strong>support@arvaya.com</strong>
              <span>We will respond as soon as possible</span>
              <span className="support-contact-badge accent">
                <Clock size={13} /> Usually replies in 2-4 hours
              </span>
            </span>
            <span className="support-contact-action"><Send size={17} /></span>
          </a>
        </section>

        <section className="wallet-panel support-faq-panel">
          <div className="wallet-panel-heading support-panel-heading">
            <div className="wallet-section-title">
              <span className="wallet-section-icon"><FileText size={20} /></span>
              <div>
                <h2>Frequently Asked Questions</h2>
                <p>Quick answers to common support questions</p>
              </div>
            </div>
            <span className="wallet-count-badge">{faqs.length} answers</span>
          </div>

          <div className="support-faq-body">
            <label className="support-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search help topics"
                aria-label="Search frequently asked questions"
              />
            </label>

            {filteredFaqs.length === 0 ? (
              <div className="support-no-results">
                <span className="wallet-empty-icon"><Search size={22} /></span>
                <h3>No matching help topics</h3>
                <p>Try a different word or contact our support team.</p>
              </div>
            ) : (
              <div className="support-faq-list">
                {filteredFaqs.map(faq => {
                  const isOpen = openFaq === faq.originalIndex || normalizedQuery.length > 0;
                  const answerId = `support-answer-${faq.originalIndex}`;
                  return (
                    <article className={`support-faq-item ${isOpen ? "is-open" : ""}`} key={faq.originalIndex}>
                      <button
                        type="button"
                        className="support-faq-question"
                        onClick={() => setOpenFaq(isOpen ? null : faq.originalIndex)}
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                      >
                        <span className="support-question-number">{String(faq.originalIndex + 1).padStart(2, "0")}</span>
                        <strong>{faq.q}</strong>
                        <ChevronDown size={19} />
                      </button>
                      {isOpen && <p className="support-faq-answer" id={answerId}>{faq.a}</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
