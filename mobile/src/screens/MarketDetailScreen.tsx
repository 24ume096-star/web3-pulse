import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { ChevronLeft, Info, AlertTriangle, TrendingUp, Users, User, Share2 } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { useDemo } from '../context/DemoContext';
import { useReferral } from '../context/ReferralContext';
import { shareMarket } from '../utils/shareUtility';
import Haptics from '../utils/haptics';
import ConfettiCannon from '../components/ConfettiWrapper';

const { width } = Dimensions.get('window');

export default function MarketDetailScreen({ navigation, route }: any) {
    const { address } = useWallet();
    const { isDemoMode } = useDemo();
    const { referralCode, addReferral, friendsInMarkets, joinMarket } = useReferral();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [resolutionResult, setResolutionResult] = useState<'WIN' | 'LOSS' | null>(null);

    // Mock user bet data
    const userBet = {
        amount: "50",
        outcome: "YES",
    };

    const marketData = {
        id: route.params?.marketId || '1',
        question: "Will Monad reach Mainnet by Q1 2026?",
        yesPool: 1240,
        noPool: 850,
        totalPool: 2090,
        endTime: "4d 12h",
        participants: 67,
    };

    const yesPercentage = (marketData.yesPool / marketData.totalPool) * 100;
    const noPercentage = (marketData.noPool / marketData.totalPool) * 100;

    const betAmounts = [10, 25, 50, 100];

    const handleBet = async () => {
        if (!selectedAmount || !selectedOutcome) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        console.log(`Choice: ${selectedOutcome} for ${selectedAmount}`);

        if (isDemoMode) {
            setIsResolving(true);

            // Simulate triggering a referral bonus for the referrer on first move
            if (Math.random() > 0.5) { // 50% chance this user was "referred" for demo purposes
                addReferral();
            }

            // Instant live feedback feel
            setTimeout(async () => {
                try {
                    setIsResolving(false);
                    const isWin = Math.random() > 0.3; // 70% chance to win for demo satisfaction
                    setResolutionResult(isWin ? 'WIN' : 'LOSS');

                    if (isWin) {
                        setShowConfetti(true);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } else {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    }

                    setTimeout(() => {
                        alert(isWin
                            ? `BOOM! 🚀 You predicted correctly and scored ${(selectedAmount * 1.9).toFixed(0)} Credits!`
                            : `Ouch! 📉 The pulse went the other way. Better luck next time!`);
                        navigation.goBack();
                    }, 500);
                } catch (error) {
                    setIsResolving(false);
                    console.error("Demo resolution failed:", error);
                }
            }, 2000); // Shorter delay for "snappy" feel
        } else {
            alert('Your move is confirmed! Stay tuned for the results.');
        }
    };

    const handleShare = () => {
        shareMarket({
            question: marketData.question,
            marketId: marketData.id,
            referralId: address || undefined,
            potentialWinnings: selectedAmount ? (selectedAmount * 1.8).toFixed(1) : undefined // Mock winnings calc
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color={Theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>What's the Move?</Text>
                <View style={styles.navActions}>
                    <TouchableOpacity style={styles.navActionBtn} onPress={handleShare}>
                        <Share2 size={20} color={Theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navActionBtn}>
                        <Info size={20} color={Theme.colors.textDim} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.question}>{marketData.question}</Text>

                    <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                            <Users size={14} color={Theme.colors.textDim} />
                            <Text style={styles.metaText}>{marketData.participants} Players</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <TrendingUp size={14} color={Theme.colors.textDim} />
                            <Text style={styles.metaText}>{marketData.totalPool} Credits Pool</Text>
                        </View>
                    </View>

                    <View style={styles.poolSection}>
                        <View style={styles.poolHeader}>
                            <Text style={styles.poolTitle}>Global Consensus</Text>
                            <Text style={styles.poolTotal}>{marketData.totalPool} Credits</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${(marketData.yesPool / marketData.totalPool) * 100}%` }]} />
                        </View>
                        <View style={styles.poolLabels}>
                            <Text style={styles.yesLabel}>YES {((marketData.yesPool / marketData.totalPool) * 100).toFixed(0)}%</Text>
                            <Text style={styles.noLabel}>NO {((marketData.noPool / marketData.totalPool) * 100).toFixed(0)}%</Text>
                        </View>
                    </View>
                </View>

                {userBet && (
                    <View style={styles.userBetCard}>
                        <View style={styles.userBetHeader}>
                            <User size={16} color={Theme.colors.primary} />
                            <Text style={styles.userBetTitle}>Your Choice</Text>
                        </View>
                        <View style={styles.userBetContent}>
                            <Text style={styles.userBetText}>You picked <Text style={styles.userBetOutcome}>{userBet.outcome}</Text></Text>
                            <Text style={styles.userBetAmount}>{userBet.amount} Credits</Text>
                        </View>
                    </View>
                )}

                <View style={[
                    styles.actionCard,
                    resolutionResult === 'WIN' && styles.winCard,
                    resolutionResult === 'LOSS' && styles.lossCard
                ]}>
                    <Text style={styles.actionTitle}>Pick your side</Text>
                    <View style={styles.outcomeButtons}>
                        <TouchableOpacity
                            style={[
                                styles.outcomeBtn,
                                styles.yesBtn,
                                selectedOutcome === 'YES' && styles.activeYesBtn
                            ]}
                            onPress={() => {
                                setSelectedOutcome('YES');
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={[styles.outcomeText, selectedOutcome === 'YES' && styles.activeBtnText]}>YES</Text>
                            <Text style={styles.outcomeSubText}>It's happening!</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.outcomeBtn,
                                styles.noBtn,
                                selectedOutcome === 'NO' && styles.activeNoBtn
                            ]}
                            onPress={() => {
                                setSelectedOutcome('NO');
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={[styles.outcomeText, selectedOutcome === 'NO' && styles.activeBtnText]}>NO</Text>
                            <Text style={styles.outcomeSubText}>No way!</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.actionTitle}>Score amount</Text>
                    <View style={styles.amountButtons}>
                        {[10, 25, 50, 100].map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.amountBtn,
                                    selectedAmount === amount && styles.activeAmountBtn
                                ]}
                                onPress={() => {
                                    setSelectedAmount(amount);
                                    Haptics.selectionAsync();
                                }}
                            >
                                <Text style={[styles.amountText, selectedAmount === amount && styles.activeBtnText]}>
                                    {amount}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.socialChallengeCard}>
                    <View style={styles.socialHeader}>
                        <Users size={16} color={Theme.colors.primary} />
                        <Text style={styles.socialTitle}>Social Competition</Text>
                    </View>
                    <Text style={styles.socialDesc}>
                        Friends currently in this challenge: <Text style={styles.socialCount}>{friendsInMarkets[marketData.id] || 0}</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.challengeBtn}
                        onPress={() => {
                            joinMarket(marketData.id); // Simulations
                            handleShare();
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                    >
                        <Share2 size={16} color="white" />
                        <Text style={styles.challengeBtnText}>Challenge a Friend</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.bottomAction}>
                <TouchableOpacity
                    style={[
                        styles.confirmBtn,
                        (!selectedAmount || !selectedOutcome || isResolving) && styles.disabledBtn
                    ]}
                    disabled={!selectedAmount || !selectedOutcome || isResolving}
                    onPress={handleBet}
                >
                    <Text style={styles.confirmBtnText}>
                        {isResolving
                            ? 'Processing Results...' // Changed text
                            : (!selectedAmount || !selectedOutcome)
                                ? 'Pick a Side & Confirm' // Changed text
                                : `Confirm ${selectedAmount} Credits`} {/* Changed 'MON' to 'Credits' */}
                    </Text>
                </TouchableOpacity>
            </View>

            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{ x: width / 2, y: -20 }}
                    fadeOut={true}
                    fallSpeed={3000}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    navTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    navActions: {
        flexDirection: 'row',
        gap: 8,
    },
    navActionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    scrollContent: {
        padding: Theme.spacing.lg,
    },
    card: {
        marginBottom: Theme.spacing.lg,
    },
    question: {
        color: Theme.colors.text,
        fontSize: 26,
        fontWeight: '800',
        lineHeight: 34,
        marginBottom: Theme.spacing.md,
    },
    metaInfo: {
        flexDirection: 'row',
        gap: Theme.spacing.lg,
        marginBottom: Theme.spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: Theme.colors.textDim,
        fontSize: 13,
        fontWeight: '500',
    },
    poolSection: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: Theme.spacing.lg,
    },
    poolHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    poolTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    poolTotal: {
        color: Theme.colors.primary,
        fontSize: 16,
        fontWeight: '800',
    },
    progressTrack: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 6,
    },
    poolLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    yesLabel: {
        color: Theme.colors.success,
        fontSize: 12,
        fontWeight: '800',
    },
    noLabel: {
        color: Theme.colors.error,
        fontSize: 12,
        fontWeight: '800',
    },
    userBetCard: {
        backgroundColor: 'rgba(131, 110, 249, 0.05)',
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(131, 110, 249, 0.2)',
        marginBottom: Theme.spacing.lg,
    },
    userBetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    userBetTitle: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    userBetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userBetText: {
        color: Theme.colors.textDim,
        fontSize: 15,
    },
    userBetOutcome: {
        color: Theme.colors.text,
        fontWeight: '800',
    },
    userBetAmount: {
        color: Theme.colors.primary,
        fontSize: 18,
        fontWeight: '900',
    },
    actionCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: 100,
    },
    winCard: {
        borderColor: Theme.colors.success,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
    lossCard: {
        borderColor: Theme.colors.error,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    actionTitle: {
        color: Theme.colors.textDim,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    outcomeButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    outcomeBtn: {
        flex: 1,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    yesBtn: {
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    noBtn: {
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    activeYesBtn: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: Theme.colors.success,
    },
    activeNoBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: Theme.colors.error,
    },
    outcomeText: {
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
    },
    outcomeSubText: {
        color: Theme.colors.textDim,
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    activeBtnText: {
        color: 'white',
    },
    amountButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    amountBtn: {
        flex: 1,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    activeAmountBtn: {
        backgroundColor: 'rgba(131, 110, 249, 0.1)',
        borderColor: Theme.colors.primary,
    },
    amountText: {
        color: Theme.colors.textDim,
        fontSize: 16,
        fontWeight: '700',
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Theme.spacing.lg,
        paddingBottom: 40,
        backgroundColor: Theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    confirmBtn: {
        height: 60,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    disabledBtn: {
        opacity: 0.5,
        backgroundColor: Theme.colors.surface,
    },
    confirmBtnText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '900',
    },
    socialChallengeCard: {
        backgroundColor: 'rgba(131, 110, 249, 0.05)',
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Theme.colors.primary,
        marginBottom: 120,
    },
    socialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    socialTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Theme.colors.text,
    },
    socialDesc: {
        fontSize: 13,
        color: Theme.colors.textDim,
        marginBottom: 16,
    },
    socialCount: {
        color: Theme.colors.primary,
        fontWeight: '900',
    },
    challengeBtn: {
        height: 44,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    challengeBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
});
