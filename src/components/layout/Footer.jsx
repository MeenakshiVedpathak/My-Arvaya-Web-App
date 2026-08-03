import { MapPin, Phone, Mail, Globe, Send, ExternalLink } from "lucide-react";
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

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', paddingTop: '64px', paddingBottom: '0' }}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 32px; }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="container">
        
        {/* ── Top Area: Brand & Links ── */}
        <div className="footer-grid" style={{ marginBottom: '48px' }}>
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <img src="/logo.png" alt="Arvaya" style={{ height: '40px', width: 'fit-content' }} />
            <p style={{ fontSize: '13px', lineHeight: 1.7, maxWidth: '280px', color: 'var(--text-muted)' }}>
              India's most trusted healthcare platform. Connecting you with top doctors, diagnostic centers, and pharmacies across the country.
            </p>
            
            <div className="flex flex-col gap-2 mt-4" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-2"><MapPin size={16} style={{ color: 'var(--primary)' }}/> 123 Healthcare Ave, Bangalore, 560001</span>
              <span className="flex items-center gap-2"><Phone size={16} style={{ color: 'var(--primary)' }}/> +91 1800-123-4567</span>
              <span className="flex items-center gap-2"><Mail size={16} style={{ color: 'var(--primary)' }}/> support@arvaya.health</span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-4">
              {[fbPath, twPath, igPath, liPath].map((d, i) => (
                <a key={i} href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-app)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.25s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                  <SocialIcon d={d} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Patients */}
          <div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>For Patients</h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '14px' }}>
              {[
                ["Home", "/"],
                ["Consult Doctors", "/doctors"],
                ["Lab Tests", "/labs"],
                ["ABHA Hub", "/abha"],
                ["Patient Portal", "/records"],
                ["Wallet", "/wallet"],
                ["Rewards", "/rewards"]
              ].map(([label, path]) => (
                <Link key={label} to={path} style={{ color: 'var(--text-muted)', transition: 'all 0.2s', display: 'inline-block' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.paddingLeft = '4px'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.paddingLeft = '0'; }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Column 3: Providers & Partners */}
          <div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>For Providers</h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '14px' }}>
              {["Arvaya Profile", "For Clinics", "Ray by Arvaya", "Arvaya Pro", "Arvaya Reach"].map(label => (
                <Link key={label} to="/" style={{ color: 'var(--text-muted)', transition: 'all 0.2s', display: 'inline-block' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.paddingLeft = '4px'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.paddingLeft = '0'; }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Column 4: Corporate & Newsletter */}
          <div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Corporate</h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '14px', marginBottom: '24px' }}>
              {["About Us", "Careers", "Blog", "Press", "Contact Us"].map(label => (
                <Link key={label} to="/" style={{ color: 'var(--text-muted)', transition: 'all 0.2s', display: 'inline-block' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.paddingLeft = '4px'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.paddingLeft = '0'; }}>{label}</Link>
              ))}
            </div>

            {/* Newsletter */}
            <div style={{ marginTop: '8px' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Stay Updated</h4>
              <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <input 
                  type="email" 
                  placeholder="Your email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', border: 'none', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '13px', outline: 'none' }}
                />
                <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--primary-dark)'} onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Area: Copyright ── */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Arvaya Healthcare. All rights reserved.
          </p>
          <div className="flex gap-6" style={{ fontSize: '13px' }}>
            {["Terms & Conditions", "Privacy Policy", "Refund Policy"].map(label => (
              <Link key={label} to="/" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>{label}</Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
