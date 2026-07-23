const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../html_exports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy styles.css from global.css
const globalCss = fs.readFileSync(path.join(__dirname, '../src/styles/global.css'), 'utf-8');
fs.writeFileSync(path.join(outputDir, 'styles.css'), globalCss, 'utf-8');

// Copy static assets like logo if available
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  const assets = fs.readdirSync(publicDir);
  assets.forEach(asset => {
    const src = path.join(publicDir, asset);
    const dest = path.join(outputDir, asset);
    if (fs.lstatSync(src).isFile()) {
      fs.copyFileSync(src, dest);
    }
  });
}

function getHeader(activePage = 'Home') {
  const navItems = [
    { label: 'Home', link: 'index.html' },
    { label: 'Consult Doctors', link: 'doctors.html' },
    { label: 'Lab Tests', link: 'labs.html' },
    { label: 'ABHA Hub', link: 'abha.html' },
    { label: 'Patient Portal', link: 'records.html' },
    { label: 'Wallet', link: 'wallet.html' },
    { label: 'Rewards', link: 'rewards.html' },
    { label: 'Analytics', link: 'analytics.html' },
    { label: '🚑 Ambulance', link: 'ambulance.html' },
  ];

  return `
    <header class="glass" style="position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);">
      <div class="container flex justify-between items-center" style="height: 76px; padding: 0 24px; gap: 16px;">
        <!-- Logo -->
        <a href="index.html" class="flex items-center gap-2">
          <img src="logo.png" alt="Arvaya Logo" style="height: 36px; width: auto;" onerror="this.src='https://via.placeholder.com/140x36?text=ARVAYA+CARE'" />
        </a>

        <!-- Universal Search & Location Bar -->
        <div class="header-search-bar flex-1 flex items-center" style="max-width: 580px; border: 1px solid var(--border); border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.9); height: 44px; position: relative;">
          <div class="flex items-center gap-1" style="padding: 0 16px; border-right: 1px solid var(--border); font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-main); background: var(--bg-app); height: 100%; border-radius: var(--radius-md) 0 0 var(--radius-md);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Bangalore</span>
          </div>
          <div class="flex-1 flex items-center gap-2" style="padding: 0 16px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search doctors, specialties, lab tests..." style="border: none; background: transparent; outline: none; width: 100%; font-size: 14px; color: var(--text-main);" />
          </div>
        </div>

        <!-- Auth CTAs -->
        <div class="flex items-center gap-4">
          <button onclick="document.getElementById('loginModal').style.display='flex'" class="btn btn-primary flex items-center gap-2" style="padding: 10px 20px; font-size: 14px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Login / Sign Up
          </button>
        </div>
      </div>

      <!-- Secondary Nav Links -->
      <div style="border-top: 1px solid var(--border); background: rgba(255, 255, 255, 0.4);">
        <div class="container flex items-center gap-6" style="height: 48px; overflow-x: auto; white-space: nowrap;">
          ${navItems.map(item => `
            <a href="${item.link}" style="color: ${activePage === item.label ? 'var(--primary)' : 'var(--text-main)'}; font-weight: ${activePage === item.label ? '700' : '500'}; font-size: 14px; border-bottom: ${activePage === item.label ? '3px solid var(--primary)' : '3px solid transparent'}; height: 100%; display: flex; items-center; padding: 0 4px;">
              ${item.label}
            </a>
          `).join('')}
        </div>
      </div>
    </header>
  `;
}

function getFooter() {
  return `
    <footer style="background: var(--primary-deep); color: white; padding: 64px 0 32px; border-top: 1px solid var(--border);">
      <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px; margin-bottom: 48px;">
        <div>
          <img src="logo.png" alt="Arvaya Logo" style="height: 36px; filter: brightness(0) invert(1); margin-bottom: 16px;" onerror="this.src='https://via.placeholder.com/140x36?text=ARVAYA'" />
          <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Arvaya Healthcare is India's leading digital health ecosystem enabling unified patient care, teleconsultations, NABL lab tests, and 24/7 ICU ambulance dispatch.
          </p>
          <div style="font-size: 13px; color: #38bdf8; font-weight: 600;">🚨 Emergency Helpline: 1800-ARVAYA-911</div>
        </div>

        <div>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; color: white;">Quick Links</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.75);">
            <li><a href="doctors.html" style="transition: color 0.2s;">Consult Doctors Online</a></li>
            <li><a href="labs.html" style="transition: color 0.2s;">Book Diagnostic Lab Tests</a></li>
            <li><a href="abha.html" style="transition: color 0.2s;">ABHA Health ID Registration</a></li>
            <li><a href="ambulance.html" style="transition: color 0.2s;">24/7 Smart ICU Ambulance</a></li>
            <li><a href="records.html" style="transition: color 0.2s;">Digital Patient Records Vault</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; color: white;">Patient Services</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.75);">
            <li><a href="wallet.html" style="transition: color 0.2s;">Arvaya Care Wallet</a></li>
            <li><a href="rewards.html" style="transition: color 0.2s;">Care Rewards & Referral Points</a></li>
            <li><a href="analytics.html" style="transition: color 0.2s;">Health Vitals Analytics</a></li>
            <li><a href="records.html" style="transition: color 0.2s;">Download E-Prescriptions</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; color: white;">Accreditations & Security</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: rgba(255,255,255,0.8);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #2dd4bf; font-weight: bold;">✓</span> ABDM Compliant (Ayushman Bharat)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #2dd4bf; font-weight: bold;">✓</span> NABH & NABL Accredited Diagnostics
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #2dd4bf; font-weight: bold;">✓</span> 256-Bit HIPAA Compliant Data Encryption
            </div>
          </div>
        </div>
      </div>

      <div class="container" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: rgba(255,255,255,0.6); flex-wrap: wrap; gap: 12px;">
        <div>© 2026 Arvaya Healthcare Private Limited. All rights reserved.</div>
        <div style="display: flex; gap: 20px;">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Notice</span>
        </div>
      </div>
    </footer>

    <!-- Login Modal -->
    <div id="loginModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: white; border-radius: 20px; max-width: 440px; width: 100%; padding: 32px; box-shadow: var(--shadow-xl); position: relative;">
        <button onclick="document.getElementById('loginModal').style.display='none'" style="position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: var(--bg-app); border: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</button>
        <h3 style="font-size: 22px; font-weight: 800; color: var(--primary-dark); margin-bottom: 8px;">Welcome to Arvaya</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">Enter your mobile number to receive a 6-digit verification OTP</p>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Mobile Number</label>
          <div style="display: flex; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--bg-app);">
            <span style="padding: 12px 14px; font-weight: 700; color: var(--text-muted); border-right: 1px solid var(--border); font-size: 14px;">+91</span>
            <input type="tel" placeholder="98765 43210" style="border: none; padding: 12px 14px; width: 100%; outline: none; background: transparent; font-size: 15px; font-weight: 600;" value="9876543210" />
          </div>
        </div>

        <button onclick="alert('Static Mock OTP sent: 123456'); document.getElementById('loginModal').style.display='none';" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 700; border-radius: 12px;">Get OTP</button>
      </div>
    </div>
  `;
}

function wrapHTML(title, content, activePage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | Arvaya Healthcare</title>
  <link rel="stylesheet" href="styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
</head>
<body>
  ${getHeader(activePage)}
  <main>
    ${content}
  </main>
  ${getFooter()}
</body>
</html>`;
}

// 1. HOME PAGE (index.html)
const homeContent = `
  <div style="background: linear-gradient(90deg, #b91c1c, #dc2626); color: white; padding: 10px 0;">
    <div class="container flex justify-between items-center" style="font-size: 14px; font-weight: 600;">
      <div>🚨 Medical Emergency? Call Ambulance Instantly</div>
      <a href="ambulance.html" style="background: white; color: #dc2626; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 800; text-decoration: none;">
        🚑 Call Ambulance
      </a>
    </div>
  </div>

  <section style="position: relative; background: linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4)), url('banner_healthcare_1.png') center/cover; min-height: 480px; display: flex; align-items: center; color: white;">
    <div class="container" style="padding: 48px 24px;">
      <div style="max-width: 640px;">
        <span style="display: inline-block; background: rgba(18, 51, 58, 0.7); backdrop-filter: blur(10px); color: #2dd4bf; padding: 8px 18px; border-radius: 99px; font-size: 12px; font-weight: 700; border: 1px solid rgba(45, 212, 191, 0.4); margin-bottom: 20px; letter-spacing: 0.05em;">
          ✨ 15 MIN EMERGENCY RESPONSE
        </span>
        <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; margin-bottom: 20px;">
          24/7 Smart ICU Emergency &<br/>Mobile Dispatch
        </h1>
        <p style="font-size: 17px; color: rgba(255,255,255,0.85); margin-bottom: 32px; line-height: 1.6;">
          Rapid emergency ambulance dispatch equipped with mobile life support and live tracking.
        </p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <a href="ambulance.html" style="padding: 14px 28px; font-size: 15px; font-weight: 700; color: white; background: linear-gradient(135deg, #FF6B00 0%, #F97316 100%); border-radius: 14px; text-decoration: none; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);">
            Request Ambulance →
          </a>
          <a href="tel:18002782929" style="padding: 14px 28px; font-size: 15px; font-weight: 700; color: white; background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255, 255, 255, 0.5); border-radius: 14px; text-decoration: none; backdrop-filter: blur(8px);">
            Hotline: 1800–ARVAYA–911
          </a>
        </div>
      </div>
    </div>
  </section>

  <section style="background: var(--bg-surface); padding: 24px 0; border-bottom: 1px solid var(--border);">
    <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
      <div class="flex items-center gap-3">
        <span style="font-size: 24px;">⭐</span>
        <div><b style="font-size: 15px; color: var(--text-main);">4.9/5 Rating</b><br/><span style="font-size: 12px; color: var(--text-muted);">From 1M+ Patients</span></div>
      </div>
      <div class="flex items-center gap-3">
        <span style="font-size: 24px;">🛡️</span>
        <div><b style="font-size: 15px; color: var(--text-main);">NABH Accredited</b><br/><span style="font-size: 12px; color: var(--text-muted);">Quality Assured Clinics</span></div>
      </div>
      <div class="flex items-center gap-3">
        <span style="font-size: 24px;">📞</span>
        <div><b style="font-size: 15px; color: var(--text-main);">24/7 Support</b><br/><span style="font-size: 12px; color: var(--text-muted);">Dedicated Medical Team</span></div>
      </div>
      <div class="flex items-center gap-3">
        <span style="font-size: 24px;">💊</span>
        <div><b style="font-size: 15px; color: var(--text-main);">100% Genuine</b><br/><span style="font-size: 12px; color: var(--text-muted);">Lab Tests & Medicines</span></div>
      </div>
    </div>
  </section>
`;

fs.writeFileSync(path.join(outputDir, 'index.html'), wrapHTML('Home', homeContent, 'Home'), 'utf-8');

// 2. DOCTORS PAGE
const doctorsContent = `
  <div class="container" style="padding: 40px 24px;">
    <div style="margin-bottom: 32px;">
      <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 8px;">Top Doctors & Specialists in Bangalore</h1>
      <p style="color: var(--text-muted); font-size: 15px;">Book in-person appointments or online video consultations with top verified specialists.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
        <div class="flex gap-4 items-start" style="margin-bottom: 16px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0;">PS</div>
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-dark);">Dr. Priya Sharma</h3>
            <div style="font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 4px;">Dentist • Orthodontist</div>
            <div style="font-size: 12px; color: var(--text-muted);">BDS, MDS • 10+ Years Exp.</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">🏥 Apollo Clinic, Bangalore</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 16px;">
          <div><span style="font-size: 18px; font-weight: 800; color: var(--text-main);">₹600</span> <span style="font-size: 12px; color: var(--text-muted);">Fee</span></div>
          <a href="doctor.html" class="btn btn-primary" style="padding: 10px 20px; font-size: 14px; text-decoration: none;">Book Appointment</a>
        </div>
      </div>

      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
        <div class="flex gap-4 items-start" style="margin-bottom: 16px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--accent-light); color: var(--accent-hover); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0;">AV</div>
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-dark);">Dr. Arjun Verma</h3>
            <div style="font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 4px;">Cardiologist • Heart Specialist</div>
            <div style="font-size: 12px; color: var(--text-muted);">MD, DM - Cardiology • 14+ Years Exp.</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">🏥 Apollo Hospitals, Bangalore</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 16px;">
          <div><span style="font-size: 18px; font-weight: 800; color: var(--text-main);">₹900</span> <span style="font-size: 12px; color: var(--text-muted);">Fee</span></div>
          <a href="doctor.html" class="btn btn-primary" style="padding: 10px 20px; font-size: 14px; text-decoration: none;">Book Appointment</a>
        </div>
      </div>

      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md);">
        <div class="flex gap-4 items-start" style="margin-bottom: 16px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0;">NK</div>
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-dark);">Dr. Neha Kapoor</h3>
            <div style="font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 4px;">Dermatologist • Skin Specialist</div>
            <div style="font-size: 12px; color: var(--text-muted);">MD - Dermatology • 9+ Years Exp.</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">🏥 Aster Clinic, Bangalore</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 16px;">
          <div><span style="font-size: 18px; font-weight: 800; color: var(--text-main);">₹700</span> <span style="font-size: 12px; color: var(--text-muted);">Fee</span></div>
          <a href="doctor.html" class="btn btn-primary" style="padding: 10px 20px; font-size: 14px; text-decoration: none;">Book Appointment</a>
        </div>
      </div>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'doctors.html'), wrapHTML('Consult Doctors', doctorsContent, 'Consult Doctors'), 'utf-8');

// 3. DOCTOR PROFILE PAGE
const doctorContent = `
  <div class="container" style="padding: 40px 24px;">
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; align-items: start;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-md);">
        <div class="flex gap-6 items-start" style="margin-bottom: 24px;">
          <div style="width: 96px; height: 96px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800;">PS</div>
          <div>
            <span style="background: var(--success-bg); color: var(--success); padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700;">Verified Specialist</span>
            <h1 style="font-size: 28px; font-weight: 800; color: var(--primary-dark); margin-top: 6px;">Dr. Priya Sharma</h1>
            <p style="font-size: 15px; color: var(--primary); font-weight: 600;">BDS, MDS - Orthodontics</p>
            <p style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">Senior Consultant Dental Surgeon at Apollo Clinic, Bangalore</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: var(--bg-app); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <div><b style="font-size: 18px; color: var(--primary-dark);">10+ Years</b><br/><span style="font-size: 12px; color: var(--text-muted);">Experience</span></div>
          <div><b style="font-size: 18px; color: var(--primary-dark);">4.8 ★</b><br/><span style="font-size: 12px; color: var(--text-muted);">126 Reviews</span></div>
          <div><b style="font-size: 18px; color: var(--primary-dark);">1,500+</b><br/><span style="font-size: 12px; color: var(--text-muted);">Happy Patients</span></div>
        </div>

        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: var(--primary-dark);">About Dr. Priya Sharma</h3>
        <p style="font-size: 14px; color: var(--text-main); line-height: 1.6; margin-bottom: 24px;">
          Dr. Priya Sharma is a renowned Orthodontist with over 10 years of clinical expertise. She specializes in aligners, root canals, invisible braces, and smile design at Apollo Clinic, Bangalore.
        </p>

        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: var(--primary-dark);">Services Offered</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: var(--primary-light); color: var(--primary-dark); padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600;">Invisible Braces</span>
          <span style="background: var(--primary-light); color: var(--primary-dark); padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600;">Teeth Whitening</span>
          <span style="background: var(--primary-light); color: var(--primary-dark); padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600;">Root Canal Therapy</span>
          <span style="background: var(--primary-light); color: var(--primary-dark); padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600;">Dental Implants</span>
        </div>
      </div>

      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-md); position: sticky; top: 100px;">
        <h3 style="font-size: 18px; font-weight: 800; color: var(--primary-dark); margin-bottom: 16px;">Book Appointment</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
          <span style="font-size: 14px; color: var(--text-muted);">Consultation Fee:</span>
          <span style="font-size: 18px; font-weight: 800; color: var(--primary-dark);">₹600</span>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 8px;">Select Date</label>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            <button style="padding: 10px 14px; border: 2px solid var(--primary); background: var(--primary-light); border-radius: 10px; font-weight: 700; color: var(--primary-dark);">Today<br/>13 Jul</button>
            <button style="padding: 10px 14px; border: 1px solid var(--border); background: var(--bg-app); border-radius: 10px; font-weight: 600;">Tue<br/>14 Jul</button>
            <button style="padding: 10px 14px; border: 1px solid var(--border); background: var(--bg-app); border-radius: 10px; font-weight: 600;">Wed<br/>15 Jul</button>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 8px;">Available Time Slots</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <button style="padding: 8px; border: 1px solid var(--primary); background: var(--primary-light); color: var(--primary-dark); font-weight: 700; border-radius: 8px;">10:00 AM</button>
            <button style="padding: 8px; border: 1px solid var(--border); background: var(--bg-app); border-radius: 8px;">11:30 AM</button>
            <button style="padding: 8px; border: 1px solid var(--border); background: var(--bg-app); border-radius: 8px;">02:30 PM</button>
            <button style="padding: 8px; border: 1px solid var(--border); background: var(--bg-app); border-radius: 8px;">05:00 PM</button>
          </div>
        </div>

        <button onclick="alert('Appointment booked successfully with Dr. Priya Sharma!')" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 700; border-radius: 12px;">Confirm Booking</button>
      </div>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'doctor.html'), wrapHTML('Dr. Priya Sharma Profile', doctorContent, 'Consult Doctors'), 'utf-8');

// 4. LABS PAGE
const labsContent = `
  <div class="container" style="padding: 40px 24px;">
    <div style="margin-bottom: 32px;">
      <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 8px;">Diagnostic Lab Tests & Health Packages</h1>
      <p style="color: var(--text-muted); font-size: 15px;">NABL accredited lab tests with free home sample collection and guaranteed 24-hour digital reports.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md);">
        <img src="checkup_fullbody.png" alt="Full Body Checkup" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/300x160?text=Full+Body+Checkup'" />
        <div style="padding: 20px;">
          <span style="background: var(--accent-light); color: var(--accent-hover); padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;">35% OFF</span>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-dark); margin: 8px 0 4px;">Full Body Checkup</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Includes 80+ essential tests (CBC, Lipid Profile, Liver Function, Kidney Function)</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
            <div>
              <span style="font-size: 18px; font-weight: 800; color: var(--primary-dark);">₹1,499</span>
              <span style="font-size: 12px; color: var(--text-muted); text-decoration: line-through; margin-left: 4px;">₹2,300</span>
            </div>
            <button onclick="alert('Lab package added to cart!')" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Book Test</button>
          </div>
        </div>
      </div>

      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md);">
        <img src="checkup_diabetes.png" alt="Diabetes Profile" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/300x160?text=Diabetes+Profile'" />
        <div style="padding: 20px;">
          <span style="background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;">33% OFF</span>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-dark); margin: 8px 0 4px;">Diabetes Care Profile</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Includes HbA1c, Fasting Blood Sugar, Post Prandial & Urine Microalbumin</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
            <div>
              <span style="font-size: 18px; font-weight: 800; color: var(--primary-dark);">₹799</span>
              <span style="font-size: 12px; color: var(--text-muted); text-decoration: line-through; margin-left: 4px;">₹1,200</span>
            </div>
            <button onclick="alert('Lab package added to cart!')" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Book Test</button>
          </div>
        </div>
      </div>

      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md);">
        <img src="checkup_thyroid.png" alt="Thyroid Profile" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/300x160?text=Thyroid+Profile'" />
        <div style="padding: 20px;">
          <span style="background: var(--success-bg); color: var(--success); padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;">28% OFF</span>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-dark); margin: 8px 0 4px;">Advanced Thyroid Profile</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Includes T3, T4, TSH Ultrasensitive blood test panel</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
            <div>
              <span style="font-size: 18px; font-weight: 800; color: var(--primary-dark);">₹649</span>
              <span style="font-size: 12px; color: var(--text-muted); text-decoration: line-through; margin-left: 4px;">₹900</span>
            </div>
            <button onclick="alert('Lab package added to cart!')" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Book Test</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'labs.html'), wrapHTML('Diagnostic Lab Tests', labsContent, 'Lab Tests'), 'utf-8');

// 5. RECORDS PAGE
const recordsContent = `
  <div class="container" style="padding: 40px 24px;">
    <div class="flex justify-between items-center" style="margin-bottom: 32px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 4px;">Health Records Vault</h1>
        <p style="color: var(--text-muted); font-size: 15px;">Encrypted storage for lab reports, e-prescriptions, and ABHA linked records.</p>
      </div>
      <button onclick="alert('Upload Modal: Drag and drop PDF or scan document')" class="btn btn-primary" style="padding: 12px 24px; font-size: 14px;">+ Upload New Record</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 16px;">
        <div class="flex items-center gap-4">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--primary-light); color: var(--primary-dark); display: flex; align-items: center; justify-content: center; font-size: 20px;">📄</div>
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-dark);">Full Body Blood Test Report</h3>
            <div style="font-size: 13px; color: var(--text-muted);">Prescribed by Dr. Priya Sharma • 10 Jul 2026</div>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <button onclick="alert('Viewing Blood Report PDF')" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px;">View PDF</button>
          <button onclick="alert('Downloading record')" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Download</button>
        </div>
      </div>

      <div style="background: white; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 16px;">
        <div class="flex items-center gap-4">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--accent-light); color: var(--accent-hover); display: flex; align-items: center; justify-content: center; font-size: 20px;">🫀</div>
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-dark);">ECG & Cardiac Screening</h3>
            <div style="font-size: 13px; color: var(--text-muted);">Prescribed by Dr. Arjun Verma • 05 Jul 2026</div>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <button onclick="alert('Viewing ECG Report PDF')" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px;">View PDF</button>
          <button onclick="alert('Downloading record')" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Download</button>
        </div>
      </div>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'records.html'), wrapHTML('Health Records Vault', recordsContent, 'Patient Portal'), 'utf-8');

// 6. AMBULANCE PAGE
const ambulanceContent = `
  <div class="container" style="padding: 40px 24px;">
    <div style="background: linear-gradient(135deg, #12333A 0%, #1F4F57 100%); color: white; border-radius: 24px; padding: 40px; margin-bottom: 32px; box-shadow: var(--shadow-xl);">
      <span style="background: rgba(220, 38, 38, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 700;">24/7 ICU DISPATCH ACTIVE</span>
      <h1 style="font-size: 36px; font-weight: 800; margin: 16px 0 12px;">Smart ICU Ambulance & Emergency Care</h1>
      <p style="font-size: 16px; color: rgba(255,255,255,0.8); max-width: 600px; margin-bottom: 28px; line-height: 1.6;">
        Equipped with advanced ventilator support, multipara monitors, and real-time GPS tracking to nearest partner hospitals.
      </p>
      <button onclick="alert('Ambulance Dispatch Initiated! Contacting nearest driver...')" class="btn" style="background: #dc2626; color: white; padding: 16px 36px; font-size: 16px; font-weight: 800; border-radius: 14px; border: none; cursor: pointer; box-shadow: 0 8px 24px rgba(220, 38, 38, 0.5);">
        🚨 Book Emergency Ambulance Now
      </button>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'ambulance.html'), wrapHTML('Emergency Ambulance', ambulanceContent, '🚑 Ambulance'), 'utf-8');

// 7. ANALYTICS PAGE
const analyticsContent = `
  <div class="container" style="padding: 40px 24px;">
    <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 24px;">Patient Vitals & Health Analytics</h1>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
      <div style="background: white; border: 1px solid var(--border); padding: 24px; border-radius: 16px;">
        <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Blood Pressure</span>
        <h2 style="font-size: 28px; font-weight: 800; color: var(--primary-dark); margin-top: 4px;">120/80 <span style="font-size: 14px; color: var(--success); font-weight: 700;">Normal</span></h2>
      </div>
      <div style="background: white; border: 1px solid var(--border); padding: 24px; border-radius: 16px;">
        <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Heart Rate</span>
        <h2 style="font-size: 28px; font-weight: 800; color: var(--primary-dark); margin-top: 4px;">72 bpm <span style="font-size: 14px; color: var(--success); font-weight: 700;">Optimal</span></h2>
      </div>
      <div style="background: white; border: 1px solid var(--border); padding: 24px; border-radius: 16px;">
        <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">SpO2 Blood Oxygen</span>
        <h2 style="font-size: 28px; font-weight: 800; color: var(--primary-dark); margin-top: 4px;">99% <span style="font-size: 14px; color: var(--success); font-weight: 700;">Excellent</span></h2>
      </div>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'analytics.html'), wrapHTML('Health Analytics', analyticsContent, 'Analytics'), 'utf-8');

// 8. WALLET PAGE
const walletContent = `
  <div class="container" style="padding: 40px 24px;">
    <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 24px;">Arvaya Care Wallet</h1>
    <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border-radius: 20px; padding: 32px; max-width: 480px; margin-bottom: 32px; box-shadow: var(--shadow-lg);">
      <span style="font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 600;">Available Wallet Balance</span>
      <h2 style="font-size: 36px; font-weight: 800; margin-top: 8px;">₹1,250.00</h2>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'wallet.html'), wrapHTML('Care Wallet', walletContent, 'Wallet'), 'utf-8');

// 9. REWARDS PAGE
const rewardsContent = `
  <div class="container" style="padding: 40px 24px;">
    <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 24px;">Care Rewards & Referrals</h1>
    <div style="background: white; border: 1px solid var(--border); border-radius: 20px; padding: 32px;">
      <h2 style="font-size: 24px; font-weight: 800; color: var(--primary-dark); margin-bottom: 8px;">Your Reward Balance: 2,450 Points</h2>
      <p style="color: var(--text-muted); font-size: 15px;">Earn 100 points on every doctor consultation and 200 points per friend referral.</p>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'rewards.html'), wrapHTML('Care Rewards', rewardsContent, 'Rewards'), 'utf-8');

// 10. ABHA PAGE
const abhaContent = `
  <div class="container" style="padding: 40px 24px;">
    <h1 style="font-size: 32px; font-weight: 800; color: var(--primary-dark); margin-bottom: 24px;">ABHA Digital Health Card</h1>
    <div style="background: white; border: 1px solid var(--border); border-radius: 20px; padding: 32px; max-width: 540px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <span style="font-size: 12px; color: var(--text-muted);">ABHA Address</span>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--primary-dark);">rahul.sharma@abdm</h3>
        </div>
        <span style="background: var(--success-bg); color: var(--success); padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; height: fit-content;">VERIFIED</span>
      </div>
      <div style="font-size: 14px; color: var(--text-main);">ABHA Number: 91-1234-5678-9012</div>
    </div>
  </div>
`;

fs.writeFileSync(path.join(outputDir, 'abha.html'), wrapHTML('ABHA Health ID', abhaContent, 'ABHA Hub'), 'utf-8');

console.log('✅ Successfully generated static HTML pages in html_exports/');
