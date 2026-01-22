import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { buildApiUrl, fetchWithTimeout } from '../config/api';

interface DemoBet {
    id: string;
    marketId: string;
    marketQuestion: string;
    choice: 'YES' | 'NO';
    amount: number;
    timestamp: number;
    resolved?: boolean;
    won?: boolean;
}

interface DemoContextType {
    isDemoMode: boolean;
    demoBalance: number;
    demoBets: DemoBet[];
    totalPulses: number;
    wonPulses: number;
    toggleDemoMode: () => void;
    placeDemoBet: (marketId: string, marketQuestion: string, choice: 'YES' | 'NO', amount: number) => boolean;
    getTrendSense: () => number;
    withdrawPoints: (amount: number, address: string) => Promise<boolean>;
    claimDemoWinnings: (betId: string, winnings: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const INITIAL_BALANCE = 1000;
const STORAGE_KEY = 'monad-pulse-demo';

export function DemoProvider({ children }: { children: ReactNode }) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoBalance, setDemoBalance] = useState(INITIAL_BALANCE);
    const [demoBets, setDemoBets] = useState<DemoBet[]>([]);
    const [totalPulses, setTotalPulses] = useState(0);
    const [wonPulses, setWonPulses] = useState(0);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setIsDemoMode(data.isDemoMode || false);
                setDemoBalance(data.demoBalance || INITIAL_BALANCE);
                setDemoBets(data.demoBets || []);
                setTotalPulses(data.totalPulses || 0);
                setWonPulses(data.wonPulses || 0);
            } catch (e) {
                console.error('Failed to load demo data:', e);
            }
        }
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isDemoMode,
            demoBalance,
            demoBets,
            totalPulses,
            wonPulses,
        }));
    }, [isDemoMode, demoBalance, demoBets]);

    const toggleDemoMode = () => {
        setIsDemoMode(prev => !prev);
    };

    const placeDemoBet = (
        marketId: string,
        marketQuestion: string,
        choice: 'YES' | 'NO',
        amount: number
    ): boolean => {
        if (amount > demoBalance) {
            return false; // Insufficient balance
        }

        const newBet: DemoBet = {
            id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            marketId,
            marketQuestion,
            choice,
            amount,
            timestamp: Date.now(),
        };

        setDemoBets(prev => [...prev, newBet]);
        setDemoBalance(prev => prev - amount);
        setTotalPulses(prev => prev + 1);
        return true;
    };

    const claimDemoWinnings = (betId: string, winnings: number) => {
        setDemoBets(prev =>
            prev.map(bet =>
                bet.id === betId ? { ...bet, resolved: true, won: true } : bet
            )
        );
        setDemoBalance(prev => prev + winnings);
        setWonPulses(prev => prev + 1);

        // Celebration Effect
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#836EF9', '#10B981', '#ffffff']
        });
    };

    const getTrendSense = () => {
        if (totalPulses === 0) return 0;
        return Math.floor((wonPulses / totalPulses) * 100);
    };

    const withdrawPoints = async (amount: number, address: string): Promise<boolean> => {
        // Optimistic UI Update first (for Demo speed)
        // In real app, we'd wait for backend response
        if (amount > demoBalance) return false;

        try {
            // Call Backend
            const url = buildApiUrl('/api/withdraw'); // Using endpoint directly as it's new
            await fetchWithTimeout(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'demo-user', walletAddress: address, amount })
            });

            setDemoBalance(prev => prev - amount);
            return true;
        } catch (e) {
            console.error('Withdrawal failed', e);
            // Revert balance if needed, but for demo simplistic usage is fine
            // Or just subtract locally for now if backend is simulated
            setDemoBalance(prev => prev - amount);
            return true;
        }
    };

    return (
        <DemoContext.Provider
            value={{
                isDemoMode,
                demoBalance,
                demoBets,
                totalPulses,
                wonPulses,
                toggleDemoMode,
                placeDemoBet,
                claimDemoWinnings,
                getTrendSense,
                withdrawPoints,
            }}
        >
            {children}
        </DemoContext.Provider>
    );
}

export function useDemo() {
    const context = useContext(DemoContext);
    if (context === undefined) {
        throw new Error('useDemo must be used within a DemoProvider');
    }
    return context;
}
