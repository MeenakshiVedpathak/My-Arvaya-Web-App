import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

/* Inline social SVGs (lucide-react doesn't ship brand icons) */
const SocialIcon = ({ d, ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}><path d={d}/></svg>
);
const fbPath = "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z";
const twPath = "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z";
const igPath = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z";
const liPath = "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Newsletter subscription logic can be added here
    setEmail("");
  };

  return (
    <footer className="main-footer">
      <style>{`
        .main-footer {
          background: #f8fafb;
          border-top: 3px solid var(--primary);
          padding-top: 64px;
          padding-bottom: 0;
          font-family: var(--font-sans);
        }
        .footer-grid { 
          display: grid; 
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr; 
          gap: 40px; 
          margin-bottom: 48px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .footer-logo {
          height: 38px;
          width: fit-content;
          transition: transform 0.3s ease;
        }
        .footer-logo:hover {
          transform: scale(1.02);
        }
        .footer-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
          margin: 0;
        }
        .footer-socials {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .social-btn:hover {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(46, 102, 110, 0.25);
        }
        .footer-title {
          color: var(--text-main);
          font-family: var(--font-display);
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
          position: relative;
          padding-bottom: 8px;
        }
        .footer-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 20px;
          height: 2px;
          background: var(--accent);
          border-radius: 2px;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 14px;
          margin-top: 8px;
        }
        .footer-link {
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s var(--ease-out);
          display: inline-flex;
          align-items: center;
          width: fit-content;
        }
        .footer-link:hover {
          color: var(--primary);
          transform: translateX(6px);
          font-weight: 500;
        }
        .footer-link:focus, .footer-link:focus-visible, .footer-link:active {
          outline: none !important;
          box-shadow: none !important;
        }
        .footer-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13.5px;
          color: var(--text-muted);
          transition: color 0.2s ease;
          line-height: 1.4;
        }
        .footer-contact-item:hover {
          color: var(--text-main);
        }
        .footer-contact-item:focus, .footer-contact-item:focus-visible, .footer-contact-item:active {
          outline: none !important;
          box-shadow: none !important;
        }
        .footer-contact-icon {
          color: var(--primary);
          opacity: 0.9;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .newsletter-section {
          margin-top: 12px;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        .newsletter-title {
          font-size: 12.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-main);
          margin-bottom: 10px;
        }
        .newsletter-form {
          display: flex;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          transition: all 0.2s ease;
          width: 100%;
        }
        .newsletter-form:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(46, 102, 110, 0.15);
        }
        .newsletter-input {
          flex: 1;
          padding: 10px 14px;
          border: none;
          background: transparent;
          color: var(--text-main);
          font-size: 13.5px;
          outline: none;
        }
        .newsletter-input::placeholder {
          color: #a0b2b4;
        }
        .newsletter-btn {
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 0 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }
        .newsletter-btn:hover {
          background: var(--primary-dark);
        }
        .newsletter-btn:focus, .newsletter-btn:focus-visible, .newsletter-btn:active {
          outline: none !important;
          box-shadow: none !important;
        }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding: 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
        }
        .footer-copy {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }
        .bottom-links {
          display: flex;
          gap: 24px;
          font-size: 13px;
        }
        .bottom-link {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .bottom-link:hover {
          color: var(--primary);
        }
        .bottom-link:focus, .bottom-link:focus-visible, .bottom-link:active {
          outline: none !important;
          box-shadow: none !important;
        }
        @media (max-width: 992px) { 
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; } 
        }
        @media (max-width: 576px) { 
          .footer-grid { grid-template-columns: 1fr; gap: 28px; } 
          .footer-bottom { flex-direction: column; align-items: flex-start; }
          .bottom-links { flex-direction: column; gap: 12px; }
        }
      `}</style>
      <div className="container">
        
        {/* ── Top Area: Brand & Links ── */}
        <div className="footer-grid">
          
          {/* Column 1: Brand */}
          <div className="footer-col">
            <img src="/logo.png" alt="Arvaya" className="footer-logo" />
            <p className="footer-desc">
              India's most trusted healthcare platform. Connecting you with top doctors, diagnostic centers, and pharmacies across the country.
            </p>
            
            {/* Social Icons */}
            <div className="footer-socials">
              {[fbPath, twPath, igPath, liPath].map((d, i) => (
                <a key={i} href="#" className="social-btn" aria-label="Social Link">
                  <SocialIcon d={d} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Healthcare Services */}
          <div className="footer-col">
            <h3 className="footer-title">Healthcare Services</h3>
            <div className="footer-links">
              {[
                ["Consult Doctors", "/doctors"],
                ["Lab Tests", "/labs"],
                ["ABHA Hub", "/abha"],
                ["Patient Portal", "/records"]
              ].map(([label, path]) => (
                <Link key={label} to={path} className="footer-link">{label}</Link>
              ))}
            </div>
          </div>

          {/* Column 3: Patient Center */}
          <div className="footer-col">
            <h3 className="footer-title">Patient Center</h3>
            <div className="footer-links">
              {[
                ["Home", "/"],
                ["Wallet", "/wallet"],
                ["Rewards", "/rewards"]
              ].map(([label, path]) => (
                <Link key={label} to={path} className="footer-link">{label}</Link>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Update */}
          <div className="footer-col">
            <h3 className="footer-title">Contact & Update</h3>
            
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <MapPin size={16} className="footer-contact-icon" />
                <span>123 Healthcare Ave, Bangalore, 560001</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} className="footer-contact-icon" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} className="footer-contact-icon" />
                <span>support@arvaya.health</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="newsletter-section">
              <h4 className="newsletter-title">Stay Updated</h4>
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* ── Bottom Area: Copyright ── */}
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Arvaya Healthcare. All rights reserved.
          </p>
          <div className="bottom-links">
            {["Terms & Conditions", "Privacy Policy", "Refund Policy"].map(label => (
              <Link key={label} to="/" className="bottom-link">{label}</Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
