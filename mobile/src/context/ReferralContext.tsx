import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReferralContextType {
    referralCode: string | null;
    referredCount: number;
    referralEarnings: number;
    friendsInMarkets: { [marketId: string]: number }; // New: Stores the count of referred friends in specific markets
    addReferral: () => void;
    joinMarket: (marketId: string) => void;
    trackChallenge: (marketId: string) => void;
    getSocialSignal: (marketId: string) => string | null; // New: Get dynamic social proof
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const ReferralProvider: React.FC<{ children: React.ReactNode, address: string | null }> = ({ children, address }) => {
    const [referredCount, setReferredCount] = useState(0);
    const [referralEarnings, setReferralEarnings] = useState(0);
    const [friendsInMarkets, setFriendsInMarkets] = useState<{ [marketId: string]: number }>({}); // New state for friends in markets

    const referralCode = address ? `PULSE-${address.slice(2, 8).toUpperCase()}` : null;

    useEffect(() => {
        const loadStats = async () => {
            if (address) {
                const stored = await AsyncStorage.getItem(`referral_${address}`);
                if (stored) {
                    const { count, earnings, marketFriends } = JSON.parse(stored);
                    setReferredCount(count);
                    setReferralEarnings(earnings);
                    setFriendsInMarkets(marketFriends || {}); // Load market friends, default to empty object
                }
            }
        };
        loadStats();
    }, [address]);

    // Helper function to save all referral stats to AsyncStorage
    const saveStats = async (count: number, earnings: number, marketFriends: { [marketId: string]: number }) => {
        if (!address) return;
        await AsyncStorage.setItem(`referral_${address}`, JSON.stringify({
            count,
            earnings,
            marketFriends
        }));
    };

    const addReferral = async () => {
        if (!address) return;
        const newCount = referredCount + 1;
        const newEarnings = referralEarnings + 50; // 50 Credits per referral
        setReferredCount(newCount);
        setReferralEarnings(newEarnings);
        // Save all stats after adding a referral
        saveStats(newCount, newEarnings, friendsInMarkets);
    };

    const joinMarket = (marketId: string) => {
        if (!address) return;
        const newFriends = { ...friendsInMarkets, [marketId]: (friendsInMarkets[marketId] || 0) + 1 };
        setFriendsInMarkets(newFriends);
        saveStats(referredCount, referralEarnings, newFriends);
    };

    const trackChallenge = (marketId: string) => {
        if (!address) return;
        const newFriends = { ...friendsInMarkets, [marketId]: (friendsInMarkets[marketId] || 0) + 1 };
        setFriendsInMarkets(newFriends);
        saveStats(referredCount, referralEarnings, newFriends);
    };

    const getSocialSignal = (marketId: string): string | null => {
        const friends = friendsInMarkets[marketId] || 0;

        // Pseudo-random but deterministic for the marketId to avoid flickering
        const hash = marketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        if (friends > 5) return `${friends} people you follow joined`;
        if (hash % 7 === 0) return "Momentum shifting ⚡";
        if (hash % 5 === 0) return "Friends changed the odds 👀";
        if (hash % 3 === 0 && friends > 0) return `${friends} friends are cooking here`;

        return null;
    };

    return (
        <ReferralContext.Provider value={{ referralCode, referredCount, referralEarnings, friendsInMarkets, addReferral, joinMarket, trackChallenge, getSocialSignal }}>
            {children}
        </ReferralContext.Provider>
    );
};

export const useReferral = () => {
    const context = useContext(ReferralContext);
    if (context === undefined) {
        throw new Error('useReferral must be used within a ReferralProvider');
    }
    return context;
};
