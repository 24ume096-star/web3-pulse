import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReferralContextType {
    referralCode: string | null;
    referredCount: number;
    referralEarnings: number;
    friendsInMarkets: { [marketId: string]: number }; // New: Stores the count of referred friends in specific markets
    addReferral: () => void;
    joinMarket: (marketId: string) => void; // New: Function to simulate a friend joining a market
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
        // In a real app, this would be triggered by a friend joining via link
        // For demo purposes, we call this to simulate social density
        const newFriends = { ...friendsInMarkets, [marketId]: (friendsInMarkets[marketId] || 0) + 1 };
        setFriendsInMarkets(newFriends);
        // Save all stats after a friend joins a market
        saveStats(referredCount, referralEarnings, newFriends);
    };

    return (
        <ReferralContext.Provider value={{ referralCode, referredCount, referralEarnings, friendsInMarkets, addReferral, joinMarket }}>
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
