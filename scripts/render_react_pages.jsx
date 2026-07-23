import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import fs from "fs";
import path from "path";

// Mock localStorage for Node environment SSR
if (typeof globalThis.localStorage === "undefined") {
  const store = {
    arvaya_user: JSON.stringify({
      id: "mock_user_1",
      name: "Rahul Sharma",
      email: "rahul@arvaya.in",
      phone: "9876543210"
    }),
    arvaya_token: "mock_token_12345"
  };
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
} else {
  globalThis.localStorage.setItem("arvaya_user", JSON.stringify({
    id: "mock_user_1",
    name: "Rahul Sharma",
    email: "rahul@arvaya.in",
    phone: "9876543210"
  }));
  globalThis.localStorage.setItem("arvaya_token", "mock_token_12345");
}

import Header from "../src/components/layout/Header.jsx";
import Footer from "../src/components/layout/Footer.jsx";
import LoginModal from "../src/components/auth/LoginModal.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { BookingProvider } from "../src/context/BookingContext.jsx";

import Home from "../src/pages/Home.jsx";
import Doctors from "../src/pages/Doctors.jsx";
import DoctorProfile from "../src/pages/DoctorProfile.jsx";
import SelectSlot from "../src/pages/SelectSlot.jsx";
import Review from "../src/pages/Review.jsx";
import Confirmed from "../src/pages/Confirmed.jsx";
import Labs from "../src/pages/Labs.jsx";
import Records from "../src/pages/Records.jsx";
import Ambulance from "../src/pages/Ambulance.jsx";
import Analytics from "../src/pages/Analytics.jsx";
import Wallet from "../src/pages/Wallet.jsx";
import Rewards from "../src/pages/Rewards.jsx";
import ABHA from "../src/pages/ABHA.jsx";
import Signup from "../src/pages/Signup.jsx";

// Standalone Login Page Component for login.html
function StandaloneLoginPage() {
  return (
    <main className="page" style={{ padding: '60px 16px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
      <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '860px', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}>
        
        {/* Left Branding */}
        <div style={{ flex: '1', background: 'linear-gradient(150deg, var(--primary-light) 0%, #ffffff 60%)', padding: '48px 40px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          <img src="logo.png" alt="Arvaya" style={{ height: '44px', marginBottom: '32px', width: 'fit-content' }} />
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2', marginBottom: '16px' }}>
            Your Health,<br /><span style={{ color: 'var(--primary)' }}>Simplified.</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.7' }}>
            Join India's most trusted healthcare platform. Experience hassle-free medical care, teleconsultations, and digital records.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
            <div>✓ Consult 10,000+ Top Doctors</div>
            <div>✓ NABL Diagnostic Lab Tests with Home Collection</div>
            <div>✓ Encrypted Health Records Vault</div>
            <div>✓ ABHA Health Card Integration</div>
          </div>
        </div>

        {/* Right Login Form */}
        <div style={{ flex: '1', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Sign In to Arvaya</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Enter your registered mobile number to get a verification OTP</p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Mobile Number</label>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-app)' }}>
              <span style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-muted)', borderRight: '1px solid var(--border)', fontSize: '15px' }}>+91</span>
              <input type="tel" placeholder="Enter 10-digit mobile number" style={{ border: 'none', padding: '14px 16px', width: '100%', outline: 'none', background: 'transparent', fontSize: '15px', fontWeight: '600' }} defaultValue="9876543210" />
            </div>
          </div>

          <button onClick={() => alert("OTP verified!")} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: '700', borderRadius: '12px', marginBottom: '20px' }}>
            Send Verification OTP
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account? <a href="signup.html" style={{ color: 'var(--primary)', fontWeight: '700' }}>Create Account</a>
          </div>
        </div>

      </div>
    </main>
  );
}

const outputDir = path.resolve(process.cwd(), "html_exports");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy static assets from public/ to html_exports/
const publicDir = path.resolve(process.cwd(), "public");
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

// Copy global.css to styles.css
const cssContent = fs.readFileSync(path.resolve(process.cwd(), "src/styles/global.css"), "utf-8");
fs.writeFileSync(path.join(outputDir, "styles.css"), cssContent, "utf-8");

const routesToRender = [
  { path: "/", element: <Home />, files: ["index.html", "home.html"], title: "Arvaya Healthcare | Your Health, Managed Brilliantly" },
  { path: "/doctors", element: <Doctors />, files: ["doctors.html"], title: "Consult Top Doctors & Specialists | Arvaya" },
  { path: "/doctor", element: <DoctorProfile />, files: ["doctor.html", "doctorProfile.html"], title: "Dr. Priya Sharma Profile | Arvaya Healthcare" },
  { path: "/slot", element: <SelectSlot />, files: ["selectSlot.html"], title: "Select Appointment Slot | Arvaya" },
  { path: "/review", element: <Review />, files: ["review.html"], title: "Review Appointment Booking | Arvaya" },
  { path: "/confirmed", element: <Confirmed />, files: ["confirmed.html"], title: "Appointment Confirmed | Arvaya" },
  { path: "/labs", element: <Labs />, files: ["labs.html"], title: "Diagnostic Lab Tests & Packages | Arvaya" },
  { path: "/records", element: <Records />, files: ["records.html"], title: "Health Records Vault & ABHA | Arvaya" },
  { path: "/ambulance", element: <Ambulance />, files: ["ambulance.html"], title: "24/7 Smart ICU Emergency Ambulance | Arvaya" },
  { path: "/analytics", element: <Analytics />, files: ["analytics.html"], title: "Health Vitals & Analytics | Arvaya" },
  { path: "/wallet", element: <Wallet />, files: ["wallet.html"], title: "Arvaya Care Wallet | Payments & Cashback" },
  { path: "/rewards", element: <Rewards />, files: ["rewards.html"], title: "Care Rewards & Referral Program | Arvaya" },
  { path: "/abha", element: <ABHA />, files: ["abha.html"], title: "ABHA Health ID Registration & Portal | Arvaya" },
  { path: "/signup", element: <Signup />, files: ["signup.html"], title: "Create Arvaya Account | Patient Portal" },
  { path: "/login", element: <StandaloneLoginPage />, files: ["login.html"], title: "Sign In | Arvaya Patient Portal" }
];

console.log("🚀 Exporting React components to static HTML with linked page relations and relative assets...");

// Map of route paths to static .html files
const pathMap = {
  'href="/"': 'href="index.html"',
  'href="/doctors"': 'href="doctors.html"',
  'href="/doctor"': 'href="doctor.html"',
  'href="/labs"': 'href="labs.html"',
  'href="/abha"': 'href="abha.html"',
  'href="/records"': 'href="records.html"',
  'href="/wallet"': 'href="wallet.html"',
  'href="/rewards"': 'href="rewards.html"',
  'href="/analytics"': 'href="analytics.html"',
  'href="/ambulance"': 'href="ambulance.html"',
  'href="/slot"': 'href="selectSlot.html"',
  'href="/review"': 'href="review.html"',
  'href="/confirmed"': 'href="confirmed.html"',
  'href="/signup"': 'href="signup.html"',
  'href="/login"': 'href="login.html"',
};

function fixLinksAndAssets(htmlString) {
  let result = htmlString;

  // Replace route hrefs
  Object.entries(pathMap).forEach(([from, to]) => {
    result = result.replaceAll(from, to);
  });

  // Make image sources and preloads relative (remove leading slashes for local assets)
  result = result.replaceAll('src="/', 'src="');
  result = result.replaceAll('href="/logo.png"', 'href="logo.png"');
  result = result.replaceAll('href="/banner_', 'href="banner_');
  result = result.replaceAll('href="/checkup_', 'href="checkup_');
  result = result.replaceAll('href="/empty_', 'href="empty_');
  result = result.replaceAll('href="/hero_', 'href="hero_');
  result = result.replaceAll('href="/refer_', 'href="refer_');
  result = result.replaceAll('href="/reward_', 'href="reward_');
  result = result.replaceAll('href="/upload_', 'href="upload_');
  result = result.replaceAll('href="/wallet_', 'href="wallet_');
  result = result.replaceAll('href="/abha.svg"', 'href="abha.svg"');

  return result;
}

routesToRender.forEach(({ path: routePath, element, files, title }) => {
  let componentHtml = ReactDOMServer.renderToStaticMarkup(
    <MemoryRouter initialEntries={[routePath]}>
      <AuthProvider>
        <BookingProvider>
          <div className="app-wrapper">
            <Header />
            {element}
            <Footer />
            <LoginModal />
          </div>
        </BookingProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  // Post-process HTML string to link pages and assets
  componentHtml = fixLinksAndAssets(componentHtml);

  const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root">
    ${componentHtml}
  </div>

  <!-- Universal Static Interactive Script: Exact React Flow & State Replication -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {

      // ── 1. Mobile Drawer Navigation ──
      const hamburgerBtn = document.querySelector(".mobile-hamburger-btn");
      if (hamburgerBtn) {
        hamburgerBtn.addEventListener("click", () => {
          let drawer = document.querySelector(".mobile-nav-drawer");
          let backdrop = document.querySelector(".mobile-nav-backdrop");
          if (drawer) drawer.style.display = drawer.style.display === "none" ? "block" : "none";
          if (backdrop) backdrop.style.display = backdrop.style.display === "none" ? "block" : "none";
        });
      }

      // ── 2. Login Modal Trigger ──
      document.body.addEventListener("click", (e) => {
        const loginBtn = e.target.closest("button, a");
        if (!loginBtn) return;
        const text = (loginBtn.textContent || "").trim().toLowerCase();

        if (text === "login" || text === "login / signup" || text === "sign in" || text === "get started") {
          const modalContainer = document.querySelector(".login-modal-container");
          if (modalContainer && modalContainer.parentElement) {
            e.preventDefault();
            modalContainer.parentElement.style.display = "flex";
          }
        }
      });

      // ── 3. Global Booking Button Flow Router ──
      document.body.addEventListener("click", (e) => {
        const btn = e.target.closest("button, a");
        if (!btn) return;

        const text = (btn.textContent || "").trim().toLowerCase();

        // LAB TEST BOOKING FLOW
        if (window.location.pathname.includes("labs.html") || btn.closest(".lab-card")) {
          if (text === "book" || text === "book test" || text.includes("book now")) {
            e.preventDefault();
            const labCard = btn.closest(".lab-card");
            const pkgTitle = labCard ? labCard.querySelector("h3").textContent : "Schedule Lab Test";
            const modal = document.getElementById("static-lab-modal");
            const modalTitle = document.getElementById("static-lab-modal-title");
            if (modal) {
              if (modalTitle) modalTitle.textContent = "Schedule Lab Test – " + pkgTitle;
              modal.style.display = "flex";
            }
            return;
          }
        }

        // EMERGENCY AMBULANCE FLOW
        if (text.includes("request ambulance")) {
          e.preventDefault();
          window.location.href = "ambulance.html";
          return;
        }

        // DOCTOR APPOINTMENT BOOKING FLOW
        if (text === "book visit" || text === "consult now" || text === "book consultation" || text === "select time slot") {
          e.preventDefault();
          if (window.location.pathname.includes("doctor.html") || window.location.pathname.includes("doctorProfile.html")) {
            window.location.href = "selectSlot.html";
          } else {
            window.location.href = "doctor.html";
          }
        } else if (text.includes("continue to review") || text.includes("book appointment")) {
          e.preventDefault();
          window.location.href = "review.html";
        } else if (text.includes("confirm booking")) {
          e.preventDefault();
          window.location.href = "confirmed.html";
        } else if (text.includes("go to my appointments")) {
          e.preventDefault();
          window.location.href = "records.html";
        } else if (text.includes("link abha id")) {
          e.preventDefault();
          window.location.href = "abha.html";
        }
      });

      // ── 4. Lab Modal Interactions ──
      const closeLabModalBtn = document.getElementById("close-static-lab-modal");
      const labModal = document.getElementById("static-lab-modal");
      if (closeLabModalBtn && labModal) {
        closeLabModalBtn.addEventListener("click", () => {
          labModal.style.display = "none";
        });
      }

      const confirmLabBtn = document.getElementById("confirm-static-lab-booking");
      if (confirmLabBtn) {
        confirmLabBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "confirmed.html";
        });
      }

      const visitOptions = document.querySelectorAll(".lab-visit-option");
      visitOptions.forEach(opt => {
        opt.addEventListener("click", () => {
          visitOptions.forEach(o => {
            o.style.background = "var(--bg-app)";
            o.style.borderColor = "var(--border)";
            const b = o.querySelector("b");
            if (b) b.style.color = "var(--text-main)";
          });
          opt.style.background = "var(--primary-light)";
          opt.style.borderColor = "var(--primary)";
          const activeB = opt.querySelector("b");
          if (activeB) activeB.style.color = "var(--primary-dark)";
        });
      });

      // ── 5. Time Slot Selection ──
      const slotBtns = document.querySelectorAll(".slot-btn, .static-lab-slot");
      slotBtns.forEach(sb => {
        sb.addEventListener("click", () => {
          slotBtns.forEach(b => {
            b.classList.remove("active");
            b.style.background = "var(--bg-app)";
            b.style.color = "var(--text-main)";
            b.style.borderColor = "var(--border)";
          });
          sb.classList.add("active");
          sb.style.background = "var(--primary)";
          sb.style.color = "#fff";
          sb.style.borderColor = "var(--primary)";
        });
      });

      // ── 6. Live Search Filtering ──
      const searchInputs = document.querySelectorAll("input[placeholder*='Search']");
      searchInputs.forEach(input => {
        input.addEventListener("input", (e) => {
          const q = e.target.value.toLowerCase().trim();
          const cards = document.querySelectorAll("article.doctor-card-main, article.lab-card");
          cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (!q || cardText.includes(q)) {
              card.style.display = "flex";
            } else {
              card.style.display = "none";
            }
          });
        });
      });

    });
  </script>
</body>
</html>`;

  files.forEach(fileName => {
    fs.writeFileSync(path.join(outputDir, fileName), fullDoc, "utf-8");
    console.log(`  ✓ Linked & exported html_exports/${fileName}`);
  });
});

console.log("\n🎉 All static HTML pages linked with relative assets exported successfully!");
