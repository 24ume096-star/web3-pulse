import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { Trophy, TrendingUp, Clock, Wallet, Coins, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemo } from './context/DemoContext';
import { useState, useEffect } from 'react';

function App() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { isDemoMode, demoBalance, toggleDemoMode, placeDemoBet } = useDemo();

  const [markets, setMarkets] = useState([
    {
      id: 'm1',
      question: "Will Bitcoin hit $150k by Q4 2025?",
      category: "Crypto",
      yesPool: 45000,
      noPool: 12000,
      ends: "10 months",
      trend: "up"
    },
    {
      id: 'm2',
      question: "Will AI Agents replace 20% of customer support jobs in 2025?",
      category: "AI & Tech",
      yesPool: 28000,
      noPool: 31000,
      ends: "1 year",
      trend: "neutral"
    },
    {
      id: 'm3',
      question: "Will Ethereum staking rate exceed 60%?",
      category: "DeFi",
      yesPool: 15600,
      noPool: 4200,
      ends: "6 months",
      trend: "up"
    },
    {
      id: 'm4',
      question: "Will Monad Mainnet launch before June 2026?",
      category: "Ecosystem",
      yesPool: 9800,
      noPool: 2100,
      ends: "5 months",
      trend: "up"
    },
    {
      id: 'm5',
      question: "Will Nvidia stock double in 2025?",
      category: "Stocks",
      yesPool: 11200,
      noPool: 15400,
      ends: "11 months",
      trend: "down"
    },
    {
      id: 'm6',
      question: "Global renewable energy usage > 40%?",
      category: "World",
      yesPool: 5600,
      noPool: 8900,
      ends: "2 years",
      trend: "neutral"
    }
  ]);

  // Simulate Live "Internet Stats"
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => ({
        ...m,
        yesPool: m.yesPool + Math.floor(Math.random() * 25),
        noPool: m.noPool + Math.floor(Math.random() * 15),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatPool = (val: number) => val.toLocaleString();

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          MonadPulse
          {isDemoMode && <span className="demo-badge">DEMO</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Balance Display */}
          {isDemoMode ? (
            <div className="demo-balance">
              <Coins size={16} />
              <span>{demoBalance.toFixed(2)} MON</span>
            </div>
          ) : isConnected && balanceData ? (
            <div className="demo-balance" style={{ background: 'rgba(131, 110, 249, 0.1)', color: '#836EF9', borderColor: '#836EF9' }}>
              <Wallet size={16} />
              <span>{Number(balanceData.formatted).toFixed(4)} {balanceData.symbol}</span>
            </div>
          ) : null}

          <label className="demo-toggle">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={toggleDemoMode}
              disabled={isConnected}
            />
            <span className="slider"></span>
            <span className="toggle-label">Demo Mode</span>
          </label>
          {!isDemoMode && <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" />}
        </div>
      </header>

      <main>
        {!isConnected && !isDemoMode ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Wallet size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ marginBottom: '12px' }}>Connect Your Wallet</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>
              Join the fastest prediction markets on Monad Testnet.
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
              Or enable <strong>Demo Mode</strong> to try it out with virtual credits!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Newspaper size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '20px' }}>Trending Predictions</h2>
            </div>

            <div className="markets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              {markets.map(market => (
                <div key={market.id} className="card market-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary)' }}>
                      <TrendingUp size={14} />
                      <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{market.category}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {market.ends}
                    </div>
                  </div>

                  <h3 className="market-question" style={{ fontSize: '18px', marginBottom: '20px', minHeight: '54px' }}>{market.question}</h3>

                  <div className="pool-info" style={{ marginBottom: '20px' }}>
                    <div className="pool-stat">
                      <div className="pool-label">Yes Pool</div>
                      <div className="pool-value" style={{ color: 'var(--success)' }}>{formatPool(market.yesPool)}</div>
                    </div>
                    <div className="pool-stat">
                      <div className="pool-label">No Pool</div>
                      <div className="pool-value" style={{ color: 'var(--danger)' }}>{formatPool(market.noPool)}</div>
                    </div>
                  </div>

                  <div className="bet-buttons">
                    <button
                      className="btn btn-yes"
                      onClick={() => {
                        if (isDemoMode) {
                          const success = placeDemoBet(market.id, market.question, 'YES', 50);
                          if (!success) alert('Insufficient balance!');
                        }
                      }}
                    >
                      Bet YES
                    </button>
                    <button
                      className="btn btn-no"
                      onClick={() => {
                        if (isDemoMode) {
                          const success = placeDemoBet(market.id, market.question, 'NO', 50);
                          if (!success) alert('Insufficient balance!');
                        }
                      }}
                    >
                      Bet NO
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '48px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Your Console</h3>
              <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(131, 110, 249, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>Active Positions</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{isDemoMode ? 'Simulated Portfolio' : 'Live Portfolio'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '20px' }}>
                    {isDemoMode ? demoBalance.toFixed(2) : balanceData ? Number(balanceData.formatted).toFixed(4) : '0.00'} MON
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)' }}>+12.5% this week</div>
                </div>
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
