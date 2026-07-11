import { Wallet as W, ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        <div style={{ textAlign: "center", padding: "60px 0", color: "#718096" }}>
          <div className="loading-spinner" />
          <p>Loading wallet...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container page">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <section>
          <h1 className="header-title" onClick={() => go(-1)}>
            <ArrowLeft /> My Wallet
          </h1>
          
          <div className="wallet-card" style={{ marginBottom: '16px' }}>
            <small style={{ color: '#4e4e4d', fontSize: '13px', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Total Balance</small>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ color: '#fb913f', fontSize: '28px' }}>₹{wallet?.balance?.toLocaleString() || 0}</b>
              <button className="pro-btn-primary" style={{ padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }} onClick={() => alert("Add money flow initiated")}>
                <Plus size={16} /> Add Money
              </button>
            </div>
          </div>

          <div className="wallet-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
            <span style={{ color: '#4e4e4d', fontSize: '14px', fontWeight: '500' }}>Cashback Balance</span>
            <b style={{ color: '#4e4e4d', fontSize: '18px' }}>₹350</b>
          </div>
        </section>

        {/* Right Column */}
        <aside className="wallet-card" style={{ paddingTop: '24px', paddingBottom: '0' }}>
          <b style={{ fontSize: '15px', color: '#4e4e4d', display: 'block', marginBottom: '16px' }}>Recent Transactions</b>
          
          <div>
            {(wallet?.transactions || []).map((tx) => (
              <div className="transaction-item" key={tx.id}>
                <div className="icon-box" style={{ background: tx.type === 'credit' ? '#e6f9f0' : '#fff5eb', marginRight: '16px' }}>
                  <W color={tx.type === 'credit' ? '#38a169' : '#ed8936'} size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '14px', color: '#4e4e4d', display: 'block' }}>{tx.title}</b>
                  <small style={{ fontSize: '12px', color: '#718096' }}>{tx.date}</small>
                </div>
                <strong style={{ fontSize: '14px', color: tx.type === 'credit' ? '#fb913f' : '#4e4e4d' }}>{tx.amount}</strong>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <button style={{ background: 'var(--bg)', color: 'var(--primary)', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '600', width: '100%', cursor: 'pointer' }} onClick={() => alert("Loading more transactions...")}>
              View All Transactions
            </button>
          </div>
        </aside>

      </div>
    </main>
  );
}
