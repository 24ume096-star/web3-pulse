import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Wallet, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface RedemptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userBalance: number;
    onConfirm: (amount: number, address: string) => Promise<boolean>;
}

export const RedemptionModal = ({
    isOpen,
    onClose,
    userBalance,
    onConfirm
}: RedemptionModalProps) => {
    const [amount, setAmount] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState('');

    const handleSubmit = async () => {
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) return;
        if (!address || address.length < 10) return;

        setIsSubmitting(true);
        try {
            const result = await onConfirm(numAmount, address);
            if (result) {
                setSuccess(true);
                // Mock Hash generation if not passed back directly in boolean (context handles state)
                setTxHash(`0x${Math.random().toString(16).substr(2, 40)}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setAmount('');
        setAddress('');
        setSuccess(false);
        setTxHash('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(4px)', zIndex: 70
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '90%', maxWidth: '400px', background: '#161618',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
                            padding: '24px', zIndex: 71, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>
                                {success ? 'Redemption Sent' : 'Cash Out Points'}
                            </h3>
                            <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {success ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
                                >
                                    <CheckCircle size={32} color="#10B981" />
                                </motion.div>
                                <h4 style={{ margin: '0 0 8px 0' }}>Transfer Initiated</h4>
                                <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: 0 }}>
                                    Your withdrawal of {amount} Points is being processed.
                                </p>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', marginTop: '16px', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                                    TX: {txHash}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                        <label>Amount (Pts)</label>
                                        <span>Max: {userBalance}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px', padding: '16px', color: 'white', fontSize: '18px'
                                        }}
                                    />
                                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', textAlign: 'right' }}>
                                        Rate: 1000 Pts ≈ 1 MON
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>To Wallet Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="0x..."
                                            style={{
                                                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', padding: '16px', paddingLeft: '44px', color: 'white', fontSize: '14px'
                                            }}
                                        />
                                        <Wallet size={16} style={{ position: 'absolute', left: '16px', top: '18px', color: 'var(--text-dim)' }} />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || Number(amount) > userBalance}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                                        background: 'linear-gradient(135deg, #836EF9 0%, #A855F7 100%)',
                                        color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                                        opacity: (isSubmitting || Number(amount) > userBalance) ? 0.5 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    {isSubmitting ? 'Confirming...' : 'Confirm Withdrawal'} <ArrowRight size={18} />
                                </button>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
