import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <>
      <ScrollToTop />
      <Header />
      <AppRoutes />
      <Footer />
      <ChatBot />
    </>
  );
}
