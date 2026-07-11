import { ArrowLeft, Gift, Clock, Wallet, Check, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Rewards() {
  const go = useNavigate();
  const [points] = useState(100);

  const offers = [
    {
      id: 1,
      title: "Flat ₹100 off",
      subtitle: "On your first appointment booking",
      points: 120,
      badge: "2d left",
      badgeIcon: Clock,
      image: "/reward_doctor.png"
    },
    {
      id: 2,
      title: "Free Consultation",
      subtitle: "Redeem for any specialist visit",
      points: 250,
      badge: "12d left",
      badgeIcon: Clock,
      image: "/reward_wellness.png"
    },
    {
      id: 3,
      title: "20% Pharmacy Discount",
      subtitle: "On all medicine orders",
      points: 180,
      badge: "47k used",
      badgeIcon: Users,
      image: "/reward_pharmacy.png"
    },
    {
      id: 4,
      title: "Premium Health Package",
      subtitle: "Full body checkup at partner labs",
      points: 320,
      badge: "14k used",
      badgeIcon: Users,
      image: "/reward_lab.png"
    }
  ];

  return (
    <main className="container page booking-wizard">
      <div className="wizard-header" style={{ marginBottom: "32px" }}>
        <h1 className="header-title" onClick={() => go(-1)}>
          <ArrowLeft /> My Rewards
        </h1>
      </div>

      <div className="reward-hero-card">
        <div className="rh-top">
          <div>
            <p className="rh-subtitle">Your Reward Points</p>
            <h2 className="rh-points">{points}</h2>
          </div>
          <div className="rh-icon-box">
            <Gift size={32} color="#fff" />
          </div>
        </div>
        
        <div className="rh-bottom">
          <Wallet size={18} />
          Redeem on your next booking
        </div>
      </div>

      <div className="rewards-section-header">
        <h2>Your Rewards</h2>
        <span className="rewards-pill-badge">6 offers</span>
      </div>

      <div className="rewards-grid">
        {offers.map(offer => (
          <div key={offer.id} className="reward-offer-card" onClick={() => alert("Offer selected: " + offer.title)} style={{ cursor: 'pointer' }}>
            <div className="roc-image-container">
              <img src={offer.image} alt={offer.title} className="roc-image" />
              
              <div className="roc-badge-tr">
                <offer.badgeIcon size={12} />
                {offer.badge}
              </div>
              
              <div className="roc-badge-bl">
                <Plus size={14} strokeWidth={3} />
                {offer.points} pts
              </div>
            </div>
            
            <div className="roc-content">
              <h3>{offer.title}</h3>
              <p>{offer.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
