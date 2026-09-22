import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BadgeIndianRupee, FileHeart, FlaskConical, Home as HomeIcon, UserRound } from "lucide-react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import { useAuth } from "./context/AuthContext";
import ChatBot from "./components/chatbot/ChatBot";

export default function App() {
  const { user, openLoginModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.authRequired) {
      openLoginModal(location.state.from);
      // Clear state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  return (
    <div className="arvaya-app-shell">
      <ScrollToTop />
      <Header />
      <div className="arvaya-app-content">
        <AppRoutes />
      </div>
      <Footer />
      <ChatBot />
      <nav className="mobile-tab-bar" aria-label="Primary navigation">
        {[
          { label: "Home", to: "/", icon: HomeIcon, end: true },
          { label: "Records", to: "/records", icon: FileHeart },
          { label: "ABHA", to: "/abha", icon: BadgeIndianRupee },
          { label: "Lab Tests", to: "/labs", icon: FlaskConical },
          { label: "Profile", to: "/profile", icon: UserRound },
        ].map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-tab-item${isActive ? " active" : ""}`}>
            <span className="mobile-tab-icon"><Icon size={21} strokeWidth={1.8} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
