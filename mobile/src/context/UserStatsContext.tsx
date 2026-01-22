import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStats {
    totalPredictions: number;
    wins: number;
    credits: number;
}

interface UserStatsContextType {
    stats: UserStats;
    recordPrediction: () => void;
    recordWin: (amount: number) => void;
    trendSense: number;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const UserStatsProvider: React.FC<{ children: React.ReactNode, address: string | null }> = ({ children, address }) => {
    const [stats, setStats] = useState<UserStats>({
        totalPredictions: 0,
        wins: 0,
        credits: 0,
    });

    useEffect(() => {
        const loadStats = async () => {
            if (address) {
                const stored = await AsyncStorage.getItem(`user_stats_${address}`);
                if (stored) {
                    setStats(JSON.parse(stored));
                } else {
                    // Initial fallback for demo feel
                    setStats({ totalPredictions: 5, wins: 3, credits: 150 });
                }
            }
        };
        loadStats();
    }, [address]);

    const saveStats = async (newStats: UserStats) => {
        if (!address) return;
        await AsyncStorage.setItem(`user_stats_${address}`, JSON.stringify(newStats));
    };

    const recordPrediction = () => {
        const newStats = { ...stats, totalPredictions: stats.totalPredictions + 1 };
        setStats(newStats);
        saveStats(newStats);
    };

    const recordWin = (amount: number) => {
        setStats(prev => {
            const newStats = {
                ...prev,
                wins: prev.wins + 1,
                credits: prev.credits + amount
            };
            saveStats(newStats); // Save the new state
            return newStats;
        });
    };

    const trendSense = stats.totalPredictions > 0
        ? Math.floor((stats.wins / stats.totalPredictions) * 100)
        : 0;

    return (
        <UserStatsContext.Provider value={{ stats, recordPrediction, recordWin, trendSense }}>
            {children}
        </UserStatsContext.Provider>
    );
};

export const useUserStats = () => {
    const context = useContext(UserStatsContext);
    if (context === undefined) {
        throw new Error('useUserStats must be used within a UserStatsProvider');
    }
    return context;
};
