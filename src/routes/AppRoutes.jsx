import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import Doctors from "../pages/Doctors";
import DoctorProfile from "../pages/DoctorProfile";
import SelectSlot from "../pages/SelectSlot";
import Review from "../pages/Review";
import Confirmed from "../pages/Confirmed";
import ABHA from "../pages/ABHA";
import Records from "../pages/Records";
import Labs from "../pages/Labs";
import Wallet from "../pages/Wallet";
import Rewards from "../pages/Rewards";
import Analytics from "../pages/Analytics";

function P({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/signup" element={<Signup />} />

      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctor" element={<DoctorProfile />} />
      <Route path="/labs" element={<Labs />} />

      {/* Protected Routes (Require Login) */}
      <Route path="/slot" element={<P><SelectSlot /></P>} />
      <Route path="/review" element={<P><Review /></P>} />
      <Route path="/confirmed" element={<P><Confirmed /></P>} />
      <Route path="/abha" element={<P><ABHA /></P>} />
      <Route path="/records" element={<P><Records /></P>} />
      <Route path="/wallet" element={<P><Wallet /></P>} />
      <Route path="/rewards" element={<P><Rewards /></P>} />
      <Route path="/analytics" element={<P><Analytics /></P>} />
    </Routes>
  );
}
