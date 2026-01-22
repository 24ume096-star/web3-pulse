import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { TrendingUp, Clock, Wallet, Newspaper, RefreshCw, Share2, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDemo } from './context/DemoContext';
import { PredictionModal } from './components/PredictionModal';
import { PortfolioDrawer } from './components/PortfolioDrawer';
import { useMarkets } from './hooks/useMarkets';
import { useMetadata } from './hooks/useMetadata';
import { API_BASE_URL } from './config/api';

function App() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { isDemoMode, demoBalance, toggleDemoMode, placeDemoBet, getTrendSense } = useDemo();
  const { markets, loading: marketsLoading, error: marketsError } = useMarkets();
  const { metadata, loading: metadataLoading } = useMetadata();

  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  const openPredictionModal = (market: any, side: 'YES' | 'NO') => {
    setSelectedMarket(market);
    setSelectedSide(side);
    setIsModalOpen(true);
  };

  const handleConfirmPulse = (amount: number) => {
    if (selectedMarket) {
      const success = placeDemoBet(selectedMarket.id, selectedMarket.question, selectedSide, amount);
      if (!success) {
        alert('Insufficient balance!');
      } else {
        setIsModalOpen(false);
      }
    }
  };

  // Sort markets by trend score (HOT first, then by visibility score)
  const sortedMarkets = [...markets].sort((a, b) => {
    const metaA = metadata[a.id] || metadata[a.address || ''];
    const metaB = metadata[b.id] || metadata[b.address || ''];

    // HOT markets first
    if (metaA?.isHot && !metaB?.isHot) return -1;
    if (!metaA?.isHot && metaB?.isHot) return 1;

    // Then by visibility score
    const scoreA = metaA?.visibilityScore || metaA?.trendScore || 0;
    const scoreB = metaB?.visibilityScore || metaB?.trendScore || 0;
    return scoreB - scoreA;
  });

  // Simulate Live "Internet Stats" updates (only if we have markets)
  useEffect(() => {
    if (markets.length === 0) return;

    const interval = setInterval(() => {
      // Note: This simulates updates but doesn't persist to backend
      // In production, you'd want real-time updates from WebSocket or polling
    }, 3000);

    return () => clearInterval(interval);
  }, [markets.length]);

  const formatPool = (val: number) => val.toLocaleString();

  const handleShare = (market: any) => {
    const shareData = {
      title: 'MonadPulse - Predict the moment',
      text: `Think you know the move? Pulse on "${market.question}" with me!`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert('Link copied to clipboard! Flex on your friends.');
    }
  };

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
            <div className="demo-balance" title="Accuracy based on your predictions">
              <Brain size={16} color="var(--primary)" />
              <span style={{ fontWeight: 800 }}>Trend Sense: {getTrendSense() > 0 ? `${getTrendSense()}%` : 'Newbie'}</span>
            </div>
          ) : isConnected && balanceData ? (
            <div className="demo-balance" style={{ background: 'rgba(131, 110, 249, 0.1)', color: '#836EF9', borderColor: '#836EF9' }}>
              <Wallet size={16} />
              <span>{Number(balanceData.formatted).toFixed(4)} {balanceData.symbol}</span>
            </div>
          ) : null}

          <button
            onClick={() => setIsPortfolioOpen(true)}
            className="demo-pill"
            style={{ marginRight: '8px' }}
            title="View My Portfolio"
          >
            My Activity
          </button>
          <button
            className={`demo-pill ${isDemoMode ? 'active' : ''}`}
            onClick={toggleDemoMode}
            disabled={isConnected}
            title={isDemoMode ? "Return to Live Markets" : "Try Demo Trading"}
          >
            {isDemoMode ? 'Exit Demo' : 'Demo'}
          </button>
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
              Or enable <strong>Demo Mode</strong> to try it out with virtual Points!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Newspaper size={20} color="var(--primary)" />
                <div>
                  <h2 style={{ fontSize: '20px', margin: 0 }}>Trending Waves</h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {sortedMarkets.filter(m => {
                      const meta = metadata[m.id] || metadata[m.address || ''];
                      return meta?.isHot;
                    }).length} 🔥 Hot • {sortedMarkets.length} Social Moments
                  </div>
                </div>
              </div>
              {(marketsLoading || metadataLoading) && (
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              )}
            </div>

            {marketsError && (
              <div className="card" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p style={{ color: 'var(--danger)', margin: 0, fontSize: '14px' }}>
                  ⚠️ Could not connect to backend API ({API_BASE_URL}). Using demo data.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Retry Connection
                </button>
              </div>
            )}

            {(marketsLoading && markets.length === 0) ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <RefreshCw size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-dim)' }}>Loading markets from backend...</p>
              </div>
            ) : sortedMarkets.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ color: 'var(--text-dim)' }}>No markets available. Check your backend connection.</p>
              </div>
            ) : (
              <div className="markets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {sortedMarkets.map(market => {
                  const marketMeta = metadata[market.id] || metadata[market.address || ''];
                  const isHot = marketMeta?.isHot || false;
                  const isTrending = (marketMeta?.visibilityScore || 0) >= 50 && !isHot;

                  return (
                    <div key={market.id} className="card market-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {(isHot || isTrending) && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              background: isHot ? 'rgba(255, 107, 107, 0.15)' : 'rgba(131, 110, 249, 0.15)',
                              color: isHot ? '#FF6B6B' : 'var(--primary)',
                              border: `1px solid ${isHot ? 'rgba(255, 107, 107, 0.3)' : 'rgba(131, 110, 249, 0.3)'}`,
                            }}>
                              {isHot ? '🔥 HOT' : '📈 TRENDING'}
                            </span>
                          )}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary)' }}>
                            <TrendingUp size={14} />
                            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{market.category}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {market.ends}
                          </div>
                          <button
                            className="share-btn-mini"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(market);
                            }}
                            title="Share Wave"
                          >
                            <Share2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="market-question" style={{ fontSize: '18px', marginBottom: '16px', minHeight: '54px' }}>{market.question}</h3>

                      {/* Suggested Stake */}
                      {marketMeta?.suggestedStake && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'rgba(131, 110, 249, 0.08)',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          border: '1px solid rgba(131, 110, 249, 0.15)',
                        }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Engagement Guide:</span>
                          <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '800' }}>
                            {marketMeta.suggestedStake} Points
                          </span>
                        </div>
                      )}

                      {/* Pulse Intelligence Box */}
                      {market.insight && (
                        <div style={{
                          margin: '0 0 16px 0',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '10px',
                          borderLeft: `4px solid ${market.sentiment === 'bullish' ? '#10B981' : market.sentiment === 'bearish' ? '#EF4444' : '#836EF9'}`,
                        }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Pulse Insight
                          </div>
                          <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.4', color: 'rgba(255, 255, 255, 0.9)' }}>
                            {market.insight}
                          </p>
                        </div>
                      )}

                      <div className="pool-info" style={{ marginBottom: '20px' }}>
                        <div className="pool-stat">
                          <div className="pool-label">YES Volume</div>
                          <div className="pool-value" style={{ color: 'var(--success)' }}>{formatPool(market.yesPool)}</div>
                        </div>
                        <div className="pool-stat">
                          <div className="pool-label">NO Volume</div>
                          <div className="pool-value" style={{ color: 'var(--danger)' }}>{formatPool(market.noPool)}</div>
                        </div>
                      </div>

                      {/* Source Provenance */}
                      {market.sourceUrl && (
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                          <a
                            href={market.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '11px',
                              color: 'var(--primary)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              opacity: 0.8
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = '0.8')}
                          >
                            <Newspaper size={12} /> Verify via {market.source || 'News'}
                          </a>
                        </div>
                      )}

                      <div className="bet-buttons">
                        <button
                          className="btn btn-yes"
                          onClick={() => {
                            if (isDemoMode) {
                              openPredictionModal(market, 'YES');
                            }
                          }}
                        >
                          Pulse YES
                        </button>
                        <button
                          className="btn btn-no"
                          onClick={() => {
                            if (isDemoMode) {
                              openPredictionModal(market, 'NO');
                            }
                          }}
                        >
                          Pulse NO
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '48px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Your Console</h3>
              <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(131, 110, 249, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>Trend Sense Mastery</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{isDemoMode ? `Accuracy: ${getTrendSense()}%` : 'Live Portfolio'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '20px' }}>
                    {isDemoMode ? demoBalance.toFixed(0) : balanceData ? Number(balanceData.formatted).toFixed(4) : '0.00'} {isDemoMode ? 'Points' : 'MON'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--success)' }}>+12.5% this week</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <PredictionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        market={selectedMarket}
        side={selectedSide}
        onConfirm={handleConfirmPulse}
        userBalance={demoBalance}
      />

      <PortfolioDrawer
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
      />

      <footer className="footer">
        Built for Monad Hackathon • 2026
      </footer>
    </div >
  );
}

export default App;
