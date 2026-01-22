import { X, TrendingUp, Clock, Trophy, Wallet } from 'lucide-react'; // Added Wallet
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../context/DemoContext';
import { RedemptionModal } from './RedemptionModal';
import { useState } from 'react';
// import { estimatePotentialWin } from '../utils/PointsEngine'; // Will hook up later

interface PortfolioDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PortfolioDrawer = ({ isOpen, onClose }: PortfolioDrawerProps) => {
    const { demoBets, claimDemoWinnings, demoBalance, withdrawPoints } = useDemo();
    const [isRedeemOpen, setIsRedeemOpen] = useState(false);

    // Sort: Recent first
    const sortedBets = [...demoBets].sort((a, b) => b.timestamp - a.timestamp);

    const handleSimulateWin = (betId: string, amount: number) => {
        // Simulate a 2x win for now (until engine integration)
        // In a real app, this button wouldn't exist, resolution is backend pushed.
        // For demo/hackathon judge convenience, we let them "Force Win".
        claimDemoWinnings(betId, amount * 2);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 60,
                                backdropFilter: 'blur(2px)'
                            }}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: '100%',
                                maxWidth: '400px',
                                background: '#161618',
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                zIndex: 61,
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>My Pulse</h2>
                                    <button
                                        onClick={() => setIsRedeemOpen(true)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                            background: 'rgba(131, 110, 249, 0.2)', color: '#836EF9', border: '1px solid #836EF9',
                                            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                                        }}
                                    >
                                        <Wallet size={12} /> Cash Out
                                    </button>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {sortedBets.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: '48px' }}>
                                        <TrendingUp size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                        <p>No active pulses.</p>
                                        <p style={{ fontSize: '14px' }}>Start predicting to build your portfolio!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {sortedBets.map((bet) => (
                                            <div
                                                key={bet.id}
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '16px',
                                                    padding: '16px',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    opacity: bet.resolved ? 0.6 : 1
                                                }}
                                            >
                                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', lineHeight: '1.4' }}>
                                                    {bet.marketQuestion}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                                                    <span style={{
                                                        color: bet.choice === 'YES' ? 'var(--success)' : 'var(--error)',
                                                        fontWeight: 'bold',
                                                        background: bet.choice === 'YES' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {bet.choice}
                                                    </span>
                                                    <span style={{ color: 'var(--text-dim)' }}>
                                                        {bet.amount} Pts
                                                    </span>
                                                </div>

                                                {!bet.resolved ? (
                                                    <button
                                                        onClick={() => handleSimulateWin(bet.id, bet.amount)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--primary)',
                                                            background: 'rgba(var(--primary-rgb), 0.1)',
                                                            color: 'var(--primary)',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <Clock size={12} /> Simulate Win (Demo)
                                                    </button>
                                                ) : (
                                                    <div style={{
                                                        textAlign: 'center',
                                                        color: bet.won ? 'var(--success)' : 'var(--text-dim)',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {bet.won && <Trophy size={12} />}
                                                        {bet.won ? 'WIN CLAIMED' : 'RESOLVED'}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center' }}>
                                    Portfolio totals valid for Session only.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <RedemptionModal
                isOpen={isRedeemOpen}
                onClose={() => setIsRedeemOpen(false)}
                userBalance={demoBalance}
                onConfirm={withdrawPoints}
            />
        </>
    );
};
