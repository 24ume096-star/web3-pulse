import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { estimatePotentialWin } from '../utils/PointsEngine';
import { useState } from 'react';

interface PredictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    market: any;
    side: 'YES' | 'NO';
    onConfirm: (amount: number) => void;
    userBalance: number;
}


export const PredictionModal = ({
    isOpen,
    onClose,
    market,
    side,
    onConfirm,
    userBalance
}: PredictionModalProps) => {
    const [amount, setAmount] = useState(1);

    if (!market) return null;

    if (!market) return null;

    const isYes = side === 'YES';

    // Dynamic Calculation (Parimutuel)
    // Dynamic Calculation (Parimutuel)
    const potentialReturn = estimatePotentialWin(
        amount,
        isYes ? market.yesPool : market.noPool,
        isYes ? market.noPool : market.yesPool
    );
    const returnMultiple = amount > 0 ? (potentialReturn / amount).toFixed(2) : '0.00';

    // Validation
    const isValid = amount >= 0.01 && amount <= 1000 && amount <= userBalance;
    let errorMsg = '';
    if (amount < 0.01) errorMsg = 'Minimum amount is 0.01';
    else if (amount > 1000) errorMsg = 'Maximum amount is 1000';
    else if (amount > userBalance) errorMsg = 'Insufficient balance';

    return (
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
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 50,
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: '#161618',
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px',
                            padding: '24px',
                            zIndex: 51,
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                            maxWidth: '480px',
                            margin: '0 auto',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Choose amount</h3>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Market Context */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    color: isYes ? 'var(--success)' : 'var(--error)',
                                    fontWeight: 'bold',
                                    background: isYes ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px'
                                }}>
                                    PULSING {side}
                                </span>
                                <span>• Ends {market.ends}</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.4' }}>
                                {market.question}
                            </div>
                        </div>

                        {/* Amount Display */}
                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text)' }}>
                                {amount} <span style={{ fontSize: '16px', color: 'var(--text-dim)', verticalAlign: 'middle' }}>Pts</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        <div style={{
                            textAlign: 'center',
                            height: '20px',
                            marginBottom: '16px',
                            color: 'var(--error)',
                            fontSize: '12px',
                            fontWeight: '600',
                            opacity: errorMsg ? 1 : 0
                        }}>
                            {errorMsg}
                        </div>

                        {/* Slider */}
                        <div style={{ padding: '0 8px', marginBottom: '24px' }}>
                            <input
                                type="range"
                                min="0.01"
                                max="1000"
                                step="1"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(Number(e.target.value));
                                    if (navigator.vibrate) navigator.vibrate(5);
                                }}
                                style={{
                                    width: '100%',
                                    accentColor: isYes ? 'var(--success)' : 'var(--error)',
                                    height: '6px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        {/* Selection Chips */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {[0.01, 1, 10, 50, 100].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        setAmount(val);
                                        if (navigator.vibrate) navigator.vibrate(10);
                                    }}
                                    style={{
                                        flex: '0 0 auto',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: amount === val
                                            ? `1px solid ${isYes ? 'var(--success)' : 'var(--error)'}`
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                        background: amount === val
                                            ? (isYes ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: amount === val
                                            ? (isYes ? 'var(--success)' : 'var(--error)')
                                            : 'var(--text)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {val} Pts
                                </button>
                            ))}
                        </div>

                        {/* Summary & Action */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '16px',
                            borderRadius: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Wallet Balance</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Wallet size={12} /> {userBalance.toLocaleString()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                                <span>If {side} wins</span>
                                <span style={{ color: isYes ? 'var(--success)' : 'var(--error)' }}>
                                    + {amount > 0 ? Math.floor(potentialReturn).toLocaleString() : '0'} Pts (~{returnMultiple}x)
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)' }}>
                                <span>If {side === 'YES' ? 'NO' : 'YES'} wins</span>
                                <span>You lose {amount} Pts</span>
                            </div>
                        </div>

                        <button
                            onClick={() => onConfirm(amount)}
                            disabled={!isValid}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: 'none',
                                background: isYes ? 'var(--success)' : 'var(--error)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                cursor: isValid ? 'pointer' : 'not-allowed',
                                opacity: isValid ? 1 : 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            {isYes ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            {isValid ? `Confirm Pulse ${side}` : 'Invalid Amount'}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
