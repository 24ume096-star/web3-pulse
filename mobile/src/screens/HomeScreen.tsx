import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, RefreshControl } from 'react-native';
import { Theme } from '../theme';
import { MarketCard } from '../components/MarketCard';
import { Search, Bell, Filter, User, Zap, RefreshCw, Share2, Users } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { useDemo } from '../context/DemoContext';
import { useReferral } from '../context/ReferralContext';
import { useMetadata } from '../context/MetadataContext';
import { shareMarket } from '../utils/shareUtility';
import { buildApiUrl, fetchWithTimeout } from '../config/api';

export default function HomeScreen({ navigation }: any) {
    const { address, isConnected, connect, balance } = useWallet();
    const { isDemoMode, toggleDemoMode } = useDemo();
    const { referralCode, friendsInMarkets, trackChallenge, getSocialSignal } = useReferral();
    const { metadata, loading: metadataLoading, refreshMetadata } = useMetadata();

    const [refreshing, setRefreshing] = React.useState(false);
    const [markets, setMarkets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchMarkets = React.useCallback(async () => {
        try {
            const url = buildApiUrl('/api/markets');
            const response = await fetchWithTimeout(url);
            const json = await response.json();

            if (json.success && json.data) {
                setMarkets(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch markets:', error);
            // Fallback to minimal static list on error
            if (markets.length === 0) {
                setMarkets([
                    { id: '1', question: "Will Monad go live by early 2026?", yesPool: 1240, noPool: 850, endTime: "4 days", category: "Crypto" },
                    { id: '2', question: "AI Regulation in 2026?", yesPool: 2500, noPool: 1100, endTime: "12 hours", category: "Tech" }
                ]);
            }
        } finally {
            setLoading(false);
        }
    }, [markets.length]);

    React.useEffect(() => {
        fetchMarkets();
    }, []);

    // Auto-refresh markets and metadata dynamically
    React.useEffect(() => {
        // Refresh metadata every 2 minutes (aligned with MetadataContext)
        const metadataInterval = setInterval(() => {
            refreshMetadata();
        }, 2 * 60 * 1000);

        // Simulate "Internet Stats" updates (Live Odds)
        const statsInterval = setInterval(() => {
            setMarkets(currentMarkets =>
                currentMarkets.map(m => ({
                    ...m,
                    yesPool: (m.yesPool || 0) + Math.floor(Math.random() * 10),
                    noPool: (m.noPool || 0) + Math.floor(Math.random() * 5),
                }))
            );
        }, 3000);

        return () => {
            clearInterval(metadataInterval);
            clearInterval(statsInterval);
        };
    }, [refreshMetadata]);

    // Sort markets by trend score (HOT first, then by visibility score)
    const sortedMarkets = React.useMemo(() => {
        return [...markets].sort((a, b) => {
            const metaA = metadata[a.id] || metadata[a.address];
            const metaB = metadata[b.id] || metadata[b.address];

            // HOT markets first
            if (metaA?.isHot && !metaB?.isHot) return -1;
            if (!metaA?.isHot && metaB?.isHot) return 1;

            // Then by visibility score
            const scoreA = metaA?.visibilityScore || metaA?.trendScore || 0;
            const scoreB = metaB?.visibilityScore || metaB?.trendScore || 0;
            return scoreB - scoreA;
        });
    }, [markets, metadata]);

    // Pull to refresh handler
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchMarkets(),
            refreshMetadata()
        ]);
        setRefreshing(false);
    }, [fetchMarkets, refreshMetadata]);

    const formatPool = (val: number) => `${(val || 0).toLocaleString()} Volume`;

    const truncateAddress = (addr: string) => {
        return `Account ${addr.slice(0, 4)}`;
    };

    const handleBet = (marketId: string, choice: 'YES' | 'NO') => {
        console.log(`Choice: ${choice} for ${marketId}`);
        navigation.navigate('MarketDetails', { marketId, initialChoice: choice });
    };

    const handleShare = (market: any, choice?: 'YES' | 'NO') => {
        shareMarket({
            question: market.question,
            marketId: market.id,
            referralId: referralCode || address || undefined,
            choice,
        });

        // If it's a challenge, track it (simulates viral join)
        if (choice) {
            trackChallenge(market.id);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.topBar}>
                <Text style={styles.miniLogo}>Pulse</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={[styles.miniToggle, isDemoMode && styles.demoActive]}
                        onPress={toggleDemoMode}
                    >
                        <Zap size={14} color={isDemoMode ? '#FFD700' : Theme.colors.textDim} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniConnect} onPress={connect}>
                        <User size={18} color={isConnected ? Theme.colors.primary : Theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Theme.colors.primary}
                        colors={[Theme.colors.primary]}
                    />
                }
            >
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>The Pulse of Now</Text>
                    <Text style={styles.heroSubtitle}>Predict the moment. Trade attention. Read the trend.</Text>
                    {isConnected && (
                        <Text style={styles.balanceText}>
                            {parseFloat(balance).toFixed(4)} MON available in account
                        </Text>
                    )}
                </View>

                <View style={styles.filterSection}>
                    <View>
                        <Text style={styles.sectionTitle}>Live Challenges</Text>
                        <Text style={styles.sectionSubtitle}>
                            {sortedMarkets.length} Social Moments • {sortedMarkets.filter(m => (metadata[m.id] || metadata[m.address])?.isHot).length} Trending 🔥
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.sortButton} disabled>
                        <Filter size={18} color={Theme.colors.textDim} />
                        <Text style={styles.sortText}>Social</Text>
                    </TouchableOpacity>
                </View>

                {loading && markets.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <RefreshCw size={24} color={Theme.colors.primary} />
                        <Text style={styles.loadingText}>Reading the trend...</Text>
                    </View>
                ) : (
                    <View style={styles.feedContainer}>
                        {sortedMarkets.map(market => (
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
                                onShare={(choice) => handleShare(market, choice)}
                                friendsJoined={friendsInMarkets[market.id] || 0}
                                socialSignal={getSocialSignal(market.id)}
                                metadata={metadata[market.id] || metadata[market.address]}
                            />
                        ))}
                    </View>
                )}

                {/* Viral Share Section - Bottom Sticky Feel */}
                <TouchableOpacity style={styles.viralCard} activeOpacity={0.9}>
                    <View>
                        <Text style={styles.viralTitle}>Invite the Crowd</Text>
                        <Text style={styles.viralSubtitle}>Get 10 Points per friend joined</Text>
                    </View>
                    <View style={styles.viralButton}>
                        <Share2 size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>

                {/* Live Pulse Feed - Social Context at Bottom */}
                <View style={styles.activityFeed}>
                    <View style={styles.activityHeader}>
                        <View style={styles.liveIndicator} />
                        <Text style={styles.activityTitle}>LIVE SOCIAL HEAT</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityTicker}>
                        {[
                            "🔥 Just pulsed YES on Monad",
                            "🚀 New crowd volume record on Bitcoin!",
                            "👥 12 friends joined the AI Regulation strike",
                            "💎 Someone just hit 500 Points!",
                            "⚡ TRENDING: Nvidia is heating up!"
                        ].map((text, i) => (
                            <View key={i} style={styles.tickerItem}>
                                <Text style={styles.tickerText}>{text}</Text>
                                <View style={styles.tickerDot} />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: Theme.colors.background,
        borderBottomWidth: 1,
        borderColor: Theme.colors.border,
    },
    miniLogo: {
        fontSize: 20,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -1,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    miniToggle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    demoActive: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    miniConnect: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 46, 149, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: 32,
        paddingBottom: 32,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -1.5,
        lineHeight: 40,
    },
    heroSubtitle: {
        fontSize: 16,
        color: Theme.colors.textDim,
        fontWeight: '600',
        marginTop: 12,
        lineHeight: 22,
    },
    balanceText: {
        color: Theme.colors.success,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 8,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    feedContainer: {
        paddingHorizontal: 12, // More edge-to-edge
    },
    filterSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: 16,
        backgroundColor: Theme.colors.background, // For sticky header
    },
    sectionTitle: {
        color: Theme.colors.text,
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        color: Theme.colors.textDim,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12, // Large tap target
        borderRadius: 24,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    sortText: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    activityFeed: {
        marginTop: 32,
        marginBottom: 20,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        paddingHorizontal: Theme.spacing.lg,
    },
    liveIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.error,
    },
    activityTitle: {
        color: Theme.colors.textDim,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    activityTicker: {
        flexDirection: 'row',
        paddingLeft: Theme.spacing.lg,
    },
    tickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    tickerText: {
        color: Theme.colors.text,
        fontSize: 13,
        fontWeight: '700',
    },
    tickerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Theme.colors.primary,
        marginLeft: 10,
    },
    viralCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        marginHorizontal: 16,
        padding: 24,
        borderRadius: 32,
        marginTop: 40, // Separated at bottom
        marginBottom: 12,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 10,
    },
    viralTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    viralSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    },
    viralButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 20,
    },
    loadingText: {
        color: Theme.colors.textDim,
        fontSize: 16,
        fontWeight: '700',
    },
});
