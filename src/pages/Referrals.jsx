import { Gift, Copy, Share2, Users, Coins, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Referrals() {
  const referralCode = "ARV-99A82X";
  
  const mockReferrals = [
    { id: 1, name: "Siddharth Rao", date: "22 Oct 2023", status: "Completed", reward: "₹500 Wallet Cash" },
    { id: 2, name: "Anita Sharma", date: "18 Oct 2023", status: "Pending", reward: "Waiting for first booking" },
    { id: 3, name: "Rahul Verma", date: "05 Sep 2023", status: "Completed", reward: "₹500 Wallet Cash" },
  ];

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Referral code copied to clipboard!");
  };

  return (
    <main className="page animate-fade-in-up" style={{ padding: 0, background: 'var(--bg-app)' }}>
      {/* ── Internal Hero ── */}
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--primary)'} onMouseOut={e => e.currentTarget.style.color=''}>Home</Link> <ChevronRight size={12} /> <span>Refer & Earn</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Refer & Earn</h1>
          <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Invite friends and earn rewards on their first booking.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '16px', padding: '32px', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', boxShadow: '0 12px 32px rgba(46, 102, 110, 0.2)' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
              <Gift size={14} /> Arvaya Referral Program
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1.2, marginBottom: '12px' }}>Give ₹500, Get ₹500</h2>
            <p style={{ opacity: 0.9, fontSize: '14px', lineHeight: 1.6, maxWidth: '400px' }}>Share your unique referral code with friends and family. When they sign up and complete their first doctor consultation or lab test, you both get ₹500 added to your Arvaya Wallet.</p>
          </div>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: 'var(--text-main)', textAlign: 'center', minWidth: '280px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Your Referral Code</p>
            <div style={{ background: 'var(--bg-app)', border: '2px dashed var(--border)', padding: '16px', borderRadius: '8px', fontSize: '24px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '2px', marginBottom: '16px' }}>
              {referralCode}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={copyCode} className="btn btn-secondary flex items-center justify-center gap-2" style={{ padding: '10px' }}><Copy size={16} /> Copy</button>
              <button className="btn btn-accent flex items-center justify-center gap-2" style={{ padding: '10px' }}><Share2 size={16} /> Share</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Total Referrals</p>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>3</h3>
            </div>
          </div>
          <div className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 145, 63, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Total Earned</p>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>₹1,000</h3>
            </div>
          </div>
        </div>

        {/* History */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>Referral History</h2>
        
        <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Friend's Name</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Date Invited</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Reward</th>
                </tr>
              </thead>
              <tbody>
                {mockReferrals.map(ref => (
                  <tr key={ref.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--primary-light)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{ref.name}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-main)' }}>{ref.date}</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 8px', background: ref.status === 'Completed' ? '#dcfce7' : '#fef08a', color: ref.status === 'Completed' ? '#16a34a' : '#854d0e', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{ref.status}</span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: ref.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)' }}>{ref.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
