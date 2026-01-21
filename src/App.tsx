import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Trophy, TrendingUp, Clock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">MonadPulse</div>
        <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" />
      </header>

      <main>
        {!isConnected ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Wallet size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ marginBottom: '12px' }}>Connect Your Wallet</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>
              Join the fastest prediction markets on Monad Testnet.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', color: 'var(--primary)' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Featured Market</span>
              </div>
              <h2 className="market-question">Will Monad reach Mainnet by Q1 2026?</h2>

              <div className="pool-info">
                <div className="pool-stat">
                  <div className="pool-label">Yes Pool</div>
                  <div className="pool-value">1,240 MON</div>
                </div>
                <div className="pool-stat">
                  <div className="pool-label">No Pool</div>
                  <div className="pool-value">850 MON</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--text-dim)', fontSize: '14px' }}>
                <Clock size={14} />
                <span>Ends in 4d 12h 30m</span>
              </div>

              <div className="bet-buttons">
                <button className="btn btn-yes">Bet YES</button>
                <button className="btn btn-no">Bet NO</button>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Your Activity</h3>
              <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(131, 110, 249, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Active Bets</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>2 Markets</div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>50.0 MON</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="footer">
        Built for Monad Hackathon • 2026
      </footer>
    </div >
  );
}

export default App;
