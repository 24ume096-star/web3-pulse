import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    toggleDemoMode: () => void;
    placeDemoBet: (marketId: string, marketQuestion: string, choice: 'YES' | 'NO', amount: number) => boolean;
    claimDemoWinnings: (betId: string, winnings: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const INITIAL_BALANCE = 1000;
const STORAGE_KEY = 'monad-pulse-demo';

export function DemoProvider({ children }: { children: ReactNode }) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoBalance, setDemoBalance] = useState(INITIAL_BALANCE);
    const [demoBets, setDemoBets] = useState<DemoBet[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setIsDemoMode(data.isDemoMode || false);
                setDemoBalance(data.demoBalance || INITIAL_BALANCE);
                setDemoBets(data.demoBets || []);
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
        return true;
    };

    const claimDemoWinnings = (betId: string, winnings: number) => {
        setDemoBets(prev =>
            prev.map(bet =>
                bet.id === betId ? { ...bet, resolved: true, won: true } : bet
            )
        );
        setDemoBalance(prev => prev + winnings);
    };

    return (
        <DemoContext.Provider
            value={{
                isDemoMode,
                demoBalance,
                demoBets,
                toggleDemoMode,
                placeDemoBet,
                claimDemoWinnings,
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
