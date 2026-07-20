import { Wallet as W, ChevronRight, Info, History, ArrowDownToLine, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getWallet } from "../services/dataService";

export default function Wallet() {
  let go = useNavigate();
  let [wallet, setWallet] = useState(null);
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    getWallet().then(data => {
      setWallet(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="container page">
        <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-muted)" }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px auto', borderTopColor: 'var(--primary)' }} />
          <p style={{ fontWeight: '500' }}>Loading your Arvaya Cash...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ background: 'var(--bg-app)' }}>
      <div style={{ background: 'var(--bg-surface)', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="flex items-center gap-2 text-muted mb-2" style={{ fontSize: '12px', fontWeight: '500' }}>
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight size={12} /> <span>Arvaya Cash</span>
          </div>
          <h1 className="text-h2" style={{ fontSize: '24px' }}>Arvaya Cash</h1>
          <p className="text-muted mt-2" style={{ fontSize: '15px' }}>Seamless payments, instant refunds, and guaranteed rewards.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '40px', paddingTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }} className="wallet-grid">

          {/* Main Column */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Balance Card */}
            <div className="card-elevated hover-glow" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <W size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px 0', fontWeight: '600' }}>Total Arvaya Cash</h2>
                    <b style={{ fontSize: '32px', color: 'white', lineHeight: 1 }}>₹{wallet?.balance?.toLocaleString() || 0}</b>
                  </div>
                </div>
                <button className="btn hover-glow" style={{ padding: '12px 24px', background: 'white', color: 'black' }} onClick={() => alert("Add money flow initiated")}>
                  Top Up Cash
                </button>
              </div>

              {/* Breakdown */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', position: 'relative', zIndex: 1 }} className="balance-breakdown">
                <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                    Refundable Balance <Info size={14} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: '20px', color: 'white' }}>₹{(wallet?.balance - 350)?.toLocaleString() || 0}</b>
                    <button style={{ color: 'var(--primary-light)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Withdraw <ArrowDownToLine size={14} />
                    </button>
                  </div>
                </div>
                
                <div style={{ flex: 1, padding: '16px', background: 'rgba(251, 145, 63, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 145, 63, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                    Promotional Cash <Info size={14} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: '20px', color: 'white' }}>₹350</b>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: '600', background: 'var(--accent)', padding: '2px 8px', borderRadius: '99px' }}>Expires in 30d</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} /> Transaction History
                </h3>
                <span className="text-primary cursor-pointer hover:underline" style={{ fontSize: '13px', fontWeight: '600' }}>Download Statement</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(wallet?.transactions || []).map((tx, idx) => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: idx !== wallet.transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    
                    <div style={{ 
                      background: tx.type === 'credit' ? '#dcfce7' : '#e2e8f0', 
                      color: tx.type === 'credit' ? '#16a34a' : 'var(--text-main)', 
                      width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 
                    }}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: '15px', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{tx.title}</b>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tx.date}</span>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '16px', color: tx.type === 'credit' ? '#16a34a' : 'var(--text-main)', display: 'block' }}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        {tx.type === 'credit' ? 'Added' : 'Paid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px', background: '#f0fdf4' }}>
              <ShieldCheck size={32} color="#16a34a" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>100% Safe & Secure</h3>
              <p style={{ fontSize: '13px', color: '#15803d', lineHeight: 1.5, margin: 0 }}>Your Arvaya Cash is protected by RBI guidelines and bank-grade security protocols.</p>
            </div>

            <div className="card hover-glow cursor-pointer" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <b style={{ fontSize: '14px', display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Manage Payment Methods</b>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add or remove saved cards</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .wallet-grid { grid-template-columns: 1fr !important; }
          .balance-breakdown { flex-direction: column; }
        }
      `}} />
    </main>
  );
}
