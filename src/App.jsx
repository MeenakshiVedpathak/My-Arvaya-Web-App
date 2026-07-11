import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import { useAuth } from "./context/AuthContext";
export default function App() {
  const { user } = useAuth();
  return (
    <>
      <ScrollToTop />
      {user && <Header />}
      <AppRoutes />
      {user && <Footer />}
    </>
  );
}
