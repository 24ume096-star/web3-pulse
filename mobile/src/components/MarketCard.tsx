import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { Theme } from '../theme';
import { TrendingUp, Clock, Trophy, Share2, Zap, Users, Check, X as CloseIcon, Info } from 'lucide-react-native';
import Haptics from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface MarketMetadata {
    isHot?: boolean;
    suggestedStake?: string;
    visibilityScore?: number;
    trendingTopic?: string | null;
    activityStatus?: 'increasing' | 'stable' | 'decreasing';
    articleCount?: number;
    recencyScore?: number; // 0-100
    trendState?: 'DETECTED' | 'HOT' | 'COOLING' | 'RESOLVED';
    sentiment?: {
        earlyPhase: { yes: number; no: number; };
        latePhase: { yes: number; no: number; };
    };
}

interface MarketCardProps {
    question: string;
    yesPool: string;
    noPool: string;
    totalPool: string;
    endTime: string;
    onPress: () => void;
    onBet?: (choice: 'YES' | 'NO') => void;
    onShare?: (choice?: 'YES' | 'NO') => void;
    isDemo?: boolean;
    friendsJoined?: number;
    metadata?: MarketMetadata;
    socialSignal?: string | null;
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
    metadata,
    socialSignal,
}) => {
    const [userChoice, setUserChoice] = React.useState<'YES' | 'NO' | null>(null);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const position = React.useRef(new Animated.ValueXY()).current;

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Only capture if horizontal movement is significant
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderMove: (evt, gestureState) => {
                position.setValue({ x: gestureState.dx, y: 0 });

                // Light haptic when approaching threshold
                if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD && Math.abs(gestureState.dx) < SWIPE_THRESHOLD + 5) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    completeSwipe('right');
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    completeSwipe('left');
                } else {
                    resetPosition();
                }
            },
        })
    ).current;

    const completeSwipe = (direction: 'right' | 'left') => {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            const choice = direction === 'right' ? 'YES' : 'NO';
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onBet?.(choice);
            setUserChoice(choice);
            // Reset for next time
            position.setValue({ x: 0, y: 0 });
        });
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    const rotation = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const yesOpacity = position.x.interpolate({
        inputRange: [0, SWIPE_THRESHOLD / 2],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const noOpacity = position.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD / 2, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const cardStyle = {
        transform: [
            { translateX: position.x },
            { rotate: rotation }
        ]
    };

    // Determine badge type based on metadata
    const isTrending = metadata?.visibilityScore && metadata.visibilityScore >= 50 && !metadata.isHot;
    const showBadge = metadata?.isHot || isTrending;

    // Pulse branding mapping
    const crowdVolume = totalPool.replace('Credits', 'People Pulsing');
    const displayPool = totalPool.replace('Credits', 'Volume');

    return (
        <Animated.View
            style={[styles.card, cardStyle]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                {/* Swipe Overlays */}
                <Animated.View style={[styles.swipeOverlay, styles.yesOverlay, { opacity: yesOpacity }]}>
                    <Check size={40} color={Theme.colors.success} />
                    <Text style={styles.overlayText}>YES</Text>
                </Animated.View>
                <Animated.View style={[styles.swipeOverlay, styles.noOverlay, { opacity: noOpacity }]}>
                    <CloseIcon size={40} color={Theme.colors.error} />
                    <Text style={styles.overlayText}>NO</Text>
                </Animated.View>

                <View style={styles.header}>
                    <View style={styles.badgeRow}>
                        {metadata?.trendState && (
                            <View style={[
                                styles.lifecycleBadge,
                                metadata.trendState === 'HOT' ? styles.hotBadge :
                                    metadata.trendState === 'COOLING' ? styles.coolingBadge :
                                        styles.detectedBadge
                            ]}>
                                <Text style={styles.lifecycleText}>
                                    {metadata.trendState === 'HOT' ? 'HOT ☄️' :
                                        metadata.trendState === 'COOLING' ? 'COOLING ✨' :
                                            'DETECTED 🛰️'}
                                </Text>
                            </View>
                        )}
                        {isDemo && (
                            <View style={[styles.badgeContainer, styles.demoBadge]}>
                                <Zap size={12} color={Theme.colors.warning} />
                                <Text style={[styles.badgeText, styles.demoBadgeText]}>PRACTICE</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.poolBadge}>
                        <Users size={14} color={Theme.colors.textDim} />
                        <Text style={styles.poolBadgeText}>{totalPool.split(' ')[0]} Active</Text>
                    </View>
                </View>



                <Text style={styles.question} numberOfLines={3}>{question}</Text>

                {/* Trend Confidence Indicator */}
                <View style={styles.confidenceSection}>
                    <View style={styles.confidenceHeader}>
                        <View style={styles.confidenceLabelGroup}>
                            <Text style={styles.confidenceLabel}>Based on live news momentum</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setShowTooltip(!showTooltip);
                                }}
                                style={styles.infoIcon}
                            >
                                <Info size={14} color={Theme.colors.textDim} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.confidenceValue}>
                            {Math.min(99, Math.floor(((metadata?.articleCount || 5) / 20) * 60 + (metadata?.recencyScore || 70) * 0.4))}%
                        </Text>
                    </View>

                    {showTooltip && (
                        <View style={styles.tooltipContainer}>
                            <Text style={styles.tooltipText}>
                                Trending due to {metadata?.articleCount || 8} news articles in the last {Math.floor((metadata?.recencyScore || 75) / 10)} hours.
                            </Text>
                        </View>
                    )}
                    <View style={styles.confidenceBarTrack}>
                        <View style={[
                            styles.confidenceBarFill,
                            { width: `${Math.min(100, ((metadata?.articleCount || 5) / 20) * 60 + (metadata?.recencyScore || 70) * 0.4)}%` }
                        ]} />
                    </View>
                </View>

                {/* Social Proof */}
                <View style={styles.socialProofBar}>
                    {friendsJoined && friendsJoined > 0 ? (
                        <View style={styles.friendsJoinContainer}>
                            <View style={styles.avatarsStack}>
                                <View style={[styles.avatarMini, { backgroundColor: Theme.colors.primary }]} />
                                <View style={[styles.avatarMini, { backgroundColor: Theme.colors.secondary, marginLeft: -10 }]} />
                            </View>
                            <Text style={styles.friendsText}>{friendsJoined} friends are pulsing</Text>
                        </View>
                    ) : (
                        <View style={styles.friendsJoinContainer}>
                            <Users size={14} color={Theme.colors.textDim} />
                            <Text style={styles.friendsText}>Join the crowd</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.shareIconButton} onPress={(e) => {
                        e.stopPropagation();
                        onShare?.();
                    }}>
                        <Share2 size={20} color={Theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Social Pressure Indicator */}
                {socialSignal && (
                    <View style={styles.socialSignalContainer}>
                        <View style={styles.signalPulse} />
                        <Text style={styles.socialSignalText}>{socialSignal}</Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.betButton, styles.yesButton]}
                        onPress={() => onBet?.('YES')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonLabel}>YES</Text>
                        <View style={styles.betIndicator} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.betButton, styles.noButton]}
                        onPress={() => onBet?.('NO')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonLabel}>NO</Text>
                        <View style={[styles.betIndicator, { backgroundColor: Theme.colors.error }]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Clock size={12} color={Theme.colors.textDim} />
                    <Text style={styles.footerText}>Moment ends in {endTime}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.footerText}>Attention Volume: {totalPool.replace(' Credits', '')}</Text>
                </View>
            </TouchableOpacity>

            {/* Challenge Success Overlay */}
            {userChoice && (
                <View style={styles.challengeOverlay}>
                    <View style={styles.successIconContainer}>
                        <Check size={32} color="#FFF" />
                    </View>
                    <Text style={styles.successTitle}>Pulsed it!</Text>
                    <Text style={styles.successSubtitle}>You're on the wave. Now prove them wrong.</Text>

                    <TouchableOpacity
                        style={styles.challengeButton}
                        onPress={() => onShare?.(userChoice)}
                    >
                        <Text style={styles.challengeButtonText}>CHALLENGE FRIENDS 😤</Text>
                        <Share2 size={18} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => setUserChoice(null)}
                    >
                        <Text style={styles.resetButtonText}>View Market</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    swipeOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 24,
    },
    yesOverlay: {
        backgroundColor: 'rgba(0, 245, 160, 0.2)',
    },
    noOverlay: {
        backgroundColor: 'rgba(255, 77, 77, 0.2)',
    },
    overlayText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        marginLeft: 4,
        letterSpacing: 0.5,
        color: Theme.colors.text,
    },
    demoBadge: {
        borderColor: Theme.colors.warning,
        borderWidth: 1,
    },
    demoBadgeText: {
        color: Theme.colors.warning,
    },
    poolBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    poolBadgeText: {
        color: Theme.colors.textDim,
        fontSize: 11,
        fontWeight: '700',
    },
    question: {
        color: Theme.colors.text,
        fontSize: 24, // High impact
        fontWeight: '900',
        lineHeight: 32,
        marginBottom: 24,
        letterSpacing: -1,
    },
    socialProofBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        padding: 16, // Larger thumb area
        borderRadius: 20,
        marginBottom: 24,
    },
    friendsJoinContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarsStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Theme.colors.surface,
    },
    friendsText: {
        color: Theme.colors.text, // More visible
        fontSize: 13,
        fontWeight: '700',
    },
    shareIconButton: {
        width: 48, // Massive tap target
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 46, 149, 0.15)',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    betButton: {
        flex: 1,
        height: 64, // Primary thumb target
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    yesButton: {
        backgroundColor: 'rgba(0, 245, 160, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 245, 160, 0.2)',
    },
    noButton: {
        backgroundColor: 'rgba(255, 77, 77, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.2)',
    },
    buttonLabel: {
        fontSize: 20,
        fontWeight: '900',
        color: Theme.colors.text,
        zIndex: 1,
    },
    betIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: Theme.colors.success,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        color: Theme.colors.textDim,
        fontSize: 11,
        fontWeight: '600',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: Theme.colors.textDim,
    },
    // Challenge Overlays
    challengeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    successIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    successTitle: {
        color: Theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    successSubtitle: {
        color: Theme.colors.textDim,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    challengeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderRadius: 24,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    challengeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    resetButton: {
        padding: 12,
    },
    resetButtonText: {
        color: Theme.colors.textDim,
        fontSize: 14,
        fontWeight: '700',
    },
    // Confidence Indicator
    confidenceSection: {
        marginBottom: 20,
    },
    confidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    confidenceLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoIcon: {
        padding: 4,
    },
    tooltipContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tooltipText: {
        color: Theme.colors.text,
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
    },
    lifecycleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
    },
    hotBadge: {
        backgroundColor: 'rgba(255, 46, 149, 0.15)',
        borderColor: 'rgba(255, 46, 149, 0.4)',
    },
    coolingBadge: {
        backgroundColor: 'rgba(0, 212, 255, 0.15)',
        borderColor: 'rgba(0, 212, 255, 0.4)',
    },
    detectedBadge: {
        backgroundColor: 'rgba(131, 110, 249, 0.15)',
        borderColor: 'rgba(131, 110, 249, 0.4)',
    },
    lifecycleText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    confidenceLabel: {
        color: Theme.colors.textDim,
        fontSize: 12,
        fontWeight: '700',
    },
    confidenceValue: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    confidenceBarTrack: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    confidenceBarFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 3,
    },
    socialSignalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        backgroundColor: 'rgba(0, 245, 160, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    signalPulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.success,
    },
    socialSignalText: {
        color: Theme.colors.success,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
