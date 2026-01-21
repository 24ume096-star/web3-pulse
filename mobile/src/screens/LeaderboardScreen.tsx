import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { Theme } from '../theme';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react-native';

const LEADERS = [
    { id: '1', name: 'MonadMaxi', rewards: '12,450', accuracy: '78%', guesses: 45, rank: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadMaxi' },
    { id: '2', name: 'SpeedDemon', rewards: '10,200', accuracy: '65%', guesses: 38, rank: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SpeedDemon' },
    { id: '3', name: 'BetMaster', rewards: '9,850', accuracy: '72%', guesses: 31, rank: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BetMaster' },
    { id: '4', name: 'EarlyPulse', rewards: '8,400', accuracy: '60%', guesses: 52, rank: 4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EarlyPulse' },
    { id: '5', name: 'CryptoWhale', rewards: '7,100', accuracy: '85%', guesses: 12, rank: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoWhale' },
    { id: '6', name: 'TestNetKing', rewards: '6,200', accuracy: '55%', guesses: 88, rank: 6, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestNetKing' },
    { id: '7', name: 'MonadBull', rewards: '5,800', accuracy: '68%', guesses: 24, rank: 7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MonadBull' },
];

export default function LeaderboardScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    const renderTopThree = () => {
        const top3 = LEADERS.slice(0, 3);
        const order = [1, 0, 2]; // Silver, Gold, Bronze order

        return (
            <View style={styles.topThreeContainer}>
                {order.map((idx) => {
                    const item = top3[idx];
                    const isGold = item.rank === 1;
                    return (
                        <View key={item.id} style={[styles.topThreeItem, isGold && styles.goldItem]}>
                            <View style={styles.avatarContainer}>
                                <View style={[styles.avatarBorder, { borderColor: isGold ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : '#CD7F32' }]}>
                                    <View style={styles.rankBadge}>
                                        <Text style={styles.rankBadgeText}>{item.rank}</Text>
                                    </View>
                                </View>
                                <Text style={styles.topName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.topWinnings}>{item.rewards} Credits</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderItem = ({ item }: { item: typeof LEADERS[0] }) => (
        <View style={styles.listCard}>
            <View style={styles.rankInfo}>
                <Text style={styles.rankText}>{item.rank}</Text>
                <View style={styles.userInfo}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.subStats}>
                        <Target size={12} color={Theme.colors.textDim} />
                        <Text style={styles.subStatText}>{item.guesses} Guesses</Text>
                        <TrendingUp size={12} color={Theme.colors.success} style={{ marginLeft: 8 }} />
                        <Text style={[styles.subStatText, { color: Theme.colors.success }]}>{item.accuracy} Hit rate</Text>
                    </View>
                </View>
            </View>
            <View style={styles.winningsInfo}>
                <Text style={styles.winnings}>{item.rewards}</Text>
                <Text style={styles.winningsLabel}>Credits</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pulse Stars</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Award size={24} color={Theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
            >
                {renderTopThree()}

                <View style={styles.yourStatsCard}>
                    <View style={styles.yourStatItem}>
                        <Text style={styles.yourStatLabel}>Your Position</Text>
                        <Text style={styles.yourStatValue}>#142</Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View style={styles.yourStatItem}>
                        <Text style={styles.yourStatLabel}>Total Rewards</Text>
                        <Text style={styles.yourStatValue}>1,450 Credits</Text>
                    </View>
                </View>

                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Global Stars</Text>
                </View>

                {LEADERS.slice(3).map((item) => (
                    <View key={item.id}>
                        {renderItem({ item })}
                    </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.md,
        paddingBottom: Theme.spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Theme.colors.text,
        letterSpacing: -0.5,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    scrollContent: {
        paddingBottom: Theme.spacing.xl,
    },
    topThreeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.xl,
        paddingBottom: Theme.spacing.lg,
        height: 220,
    },
    topThreeItem: {
        flex: 1,
        alignItems: 'center',
    },
    goldItem: {
        transform: [{ translateY: -20 }],
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatarBorder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    rankBadge: {
        position: 'absolute',
        bottom: -5,
        backgroundColor: Theme.colors.primary,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Theme.colors.background,
    },
    rankBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
    },
    topName: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    topWinnings: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontWeight: '800',
    },
    yourStatsCard: {
        backgroundColor: Theme.colors.surface,
        marginHorizontal: Theme.spacing.lg,
        padding: Theme.spacing.lg,
        borderRadius: Theme.borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    yourStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    yourStatLabel: {
        color: Theme.colors.textDim,
        fontSize: 12,
        marginBottom: 4,
    },
    yourStatValue: {
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Theme.colors.border,
    },
    listHeader: {
        paddingHorizontal: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    listTitle: {
        color: Theme.colors.textDim,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listCard: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: Theme.spacing.lg,
        marginBottom: Theme.spacing.sm,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    rankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    rankText: {
        color: Theme.colors.textDim,
        fontSize: 16,
        fontWeight: '900',
        width: 24,
    },
    userInfo: {
        gap: 2,
    },
    name: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    subStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subStatText: {
        color: Theme.colors.textDim,
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    },
    winningsInfo: {
        alignItems: 'flex-end',
    },
    winnings: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '800',
    },
    winningsLabel: {
        color: Theme.colors.textDim,
        fontSize: 10,
        fontWeight: '600',
    },
});
