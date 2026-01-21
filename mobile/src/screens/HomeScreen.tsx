import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { MarketCard } from '../components/MarketCard';
import { Search, Bell, Filter, User, Zap } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { useDemo } from '../context/DemoContext';
import { useReferral } from '../context/ReferralContext';
import { shareMarket } from '../utils/shareUtility';

export default function HomeScreen({ navigation }: any) {
    const { address, isConnected, connect, balance } = useWallet();
    const { isDemoMode, toggleDemoMode } = useDemo();
    const { referralCode, friendsInMarkets } = useReferral();

    // Expanded Mock Markets with diverse ideologies
    const [markets, setMarkets] = React.useState([
        {
            id: '1',
            question: "Will Monad go live by early 2026?",
            yesPool: 1240,
            noPool: 850,
            endTime: "4 days",
            category: "Crypto"
        },
        {
            id: '2',
            question: "Will fees stay super low today?",
            yesPool: 2500,
            noPool: 1100,
            endTime: "12 hours",
            category: "Network"
        },
        {
            id: '3',
            question: "Will Bitcoin hit $150k soon?",
            yesPool: 15800,
            noPool: 4200,
            endTime: "11 days",
            category: "Market"
        },
        {
            id: '4',
            question: "Will Ethereum flip Bitcoin in 2026?",
            yesPool: 5000,
            noPool: 25400,
            endTime: "1 year",
            category: "Crypto"
        },
        {
            id: '5',
            question: "Real Madrid to win Champions League?",
            yesPool: 8900,
            noPool: 6200,
            endTime: "5 months",
            category: "Sports"
        },
        {
            id: '6',
            question: "AI to replace 10% of coders by 2027?",
            yesPool: 3200,
            noPool: 4100,
            endTime: "2 years",
            category: "Tech"
        }
    ]);

    // Simulate "Internet Stats" updates (Live Odds)
    React.useEffect(() => {
        const interval = setInterval(() => {
            setMarkets(currentMarkets =>
                currentMarkets.map(m => ({
                    ...m,
                    yesPool: m.yesPool + Math.floor(Math.random() * 10), // Randomly increase
                    noPool: m.noPool + Math.floor(Math.random() * 5),
                }))
            );
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const formatPool = (val: number) => `${val.toLocaleString()} Credits`;

    const truncateAddress = (addr: string) => {
        return `Account ${addr.slice(0, 4)}`;
    };

    // ... (rest of functions: handleBet, handleShare) -> No change needed generally, just calling formatPool

    const handleBet = (marketId: string, choice: 'YES' | 'NO') => {
        console.log(`Choice: ${choice} for ${marketId}`);
        navigation.navigate('MarketDetails', { marketId, initialChoice: choice });
    };

    const handleShare = (market: any) => {
        shareMarket({
            question: market.question,
            marketId: market.id,
            referralId: referralCode || address || undefined,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hey there! 👋</Text>
                    <Text style={styles.logo}>Pulse</Text>
                    {isConnected && (
                        <Text style={{ color: Theme.colors.success, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                            {parseFloat(balance).toFixed(4)} MON
                        </Text>
                    )}
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={[styles.demoToggle, isDemoMode && styles.demoActive]}
                        onPress={toggleDemoMode}
                    >
                        <Zap size={14} color={isDemoMode ? '#FFD700' : Theme.colors.textDim} />
                        <Text style={[styles.demoText, isDemoMode && styles.demoActiveText]}>PRACTICE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.connectButton, isConnected && styles.connectedButton]} onPress={connect}>
                        <User size={16} color={isConnected ? Theme.colors.primary : Theme.colors.text} />
                        <Text style={[styles.connectText, isConnected && styles.connectedText]}>
                            {isConnected ? truncateAddress(address!) : 'Log In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Live Challenges</Text>
                    <TouchableOpacity style={styles.sortButton}>
                        <Filter size={16} color={Theme.colors.textDim} />
                        <Text style={styles.sortText}>Filter</Text>
                    </TouchableOpacity>
                </View>

                {markets.map(market => (
                    <MarketCard
                        key={market.id}
                        question={market.question}
                        yesPool={formatPool(market.yesPool)}
                        noPool={formatPool(market.noPool)}
                        totalPool={formatPool(market.yesPool + market.noPool)}
                        endTime={market.endTime}
                        isDemo={isDemoMode}
                        onPress={() => navigation.navigate('MarketDetails', { marketId: market.id })}
                        onBet={(choice) => handleBet(market.id, choice)}
                        onShare={() => handleShare(market)}
                        friendsJoined={friendsInMarkets[market.id] || 0}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.xl,
        paddingBottom: Theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 14,
        color: Theme.colors.textDim,
        fontWeight: '500',
        marginBottom: 2,
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -0.5,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: Theme.spacing.sm,
    },
    demoToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    demoActive: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    demoText: {
        color: Theme.colors.textDim,
        fontSize: 10,
        fontWeight: '900',
    },
    demoActiveText: {
        color: '#FFD700',
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Theme.colors.surface,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    connectedButton: {
        borderColor: 'rgba(131, 110, 249, 0.3)',
        backgroundColor: 'rgba(131, 110, 249, 0.05)',
    },
    connectText: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    connectedText: {
        color: Theme.colors.primary,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    scrollContent: {
        padding: Theme.spacing.lg,
    },
    filterSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        marginVertical: Theme.spacing.md,
    },
    sectionTitle: {
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    sortText: {
        color: Theme.colors.textDim,
        fontSize: 12,
        fontWeight: '600',
    },
});
