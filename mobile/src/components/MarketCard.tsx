import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { TrendingUp, Clock, Trophy, Share2, Zap, Users } from 'lucide-react-native';

interface MarketCardProps {
    question: string;
    yesPool: string;
    noPool: string;
    totalPool: string;
    endTime: string;
    onPress: () => void;
    onBet?: (choice: 'YES' | 'NO') => void;
    onShare?: () => void;
    isDemo?: boolean;
    friendsJoined?: number;
}

export const MarketCard: React.FC<MarketCardProps> = ({
    question,
    yesPool,
    noPool,
    totalPool,
    endTime,
    onPress,
    onBet,
    onShare,
    isDemo,
    friendsJoined,
}) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.header}>
                <View style={styles.badgeContainer}>
                    <TrendingUp size={12} color={Theme.colors.primary} />
                    <Text style={styles.badgeText}>HOT 🔥</Text>
                </View>
                {isDemo && (
                    <View style={[styles.badgeContainer, { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: '#FFD700' }]}>
                        <Zap size={10} color="#FFD700" />
                        <Text style={[styles.badgeText, { color: '#FFD700' }]}>DEMO</Text>
                    </View>
                )}
                <View style={styles.poolBadge}>
                    <Trophy size={12} color={Theme.colors.textDim} />
                    <Text style={styles.poolBadgeText}>{totalPool} Credits</Text>
                </View>
            </View>

            <Text style={styles.question} numberOfLines={2}>{question}</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Clock size={12} color={Theme.colors.textDim} />
                    <Text style={styles.statText}>Ends in {endTime}</Text>
                </View>
                {friendsJoined && friendsJoined > 0 ? (
                    <View style={[styles.statItem, styles.socialBadge]}>
                        <Users size={12} color={Theme.colors.primary} />
                        <Text style={styles.socialBadgeText}>{friendsJoined} Friends Joined</Text>
                    </View>
                ) : null}
                <TouchableOpacity style={styles.shareIconButton} onPress={(e) => {
                    e.stopPropagation();
                    onShare?.();
                }}>
                    <Share2 size={14} color={Theme.colors.textDim} />
                </TouchableOpacity>
            </View>
            {/* ... rest of the component */}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.betButton, styles.yesButton]}
                    onPress={() => onBet?.('YES')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonLabel}>YES</Text>
                    <Text style={styles.buttonValue}>{yesPool}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.betButton, styles.noButton]}
                    onPress={() => onBet?.('NO')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonLabel}>NO</Text>
                    <Text style={styles.buttonValue}>{noPool}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(131, 110, 249, 0.1)',
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        color: Theme.colors.primary,
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    poolBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    poolBadgeText: {
        color: Theme.colors.textDim,
        fontSize: 12,
        fontWeight: '600',
    },
    question: {
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
        marginBottom: Theme.spacing.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    shareIconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    statText: {
        color: Theme.colors.textDim,
        fontSize: 12,
        fontWeight: '500',
    },
    socialBadge: {
        backgroundColor: 'rgba(131, 110, 249, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    socialBadgeText: {
        color: Theme.colors.primary,
        fontSize: 11,
        fontWeight: '800',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
    },
    betButton: {
        flex: 1,
        height: 48,
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    yesButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    noButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: Theme.colors.text,
    },
    buttonValue: {
        fontSize: 12,
        fontWeight: '600',
        color: Theme.colors.textDim,
    },
});
