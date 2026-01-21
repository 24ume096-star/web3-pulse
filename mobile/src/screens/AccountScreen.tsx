import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Share, Platform } from 'react-native';
import { Theme } from '../theme';
import { User, Copy, Share2, Award, TrendingUp, LogOut } from 'lucide-react-native';
import { useWallet } from '../context/WalletContext';
import { useReferral } from '../context/ReferralContext';

export default function AccountScreen() {
    const { address, disconnect, isConnected } = useWallet();
    const { referralCode, referredCount, referralEarnings } = useReferral();

    const handleCopyCode = () => {
        // Mock copy logic
        alert('Referral code copied!');
    };

    const handleInvite = async () => {
        try {
            const message = `Join me on Pulse and start predicting! 🚀\nUse my invite code: ${referralCode}\n\nDownload here: https://monadpulse.com/invite`;
            await Share.share({
                message: message,
                title: 'Invite to Pulse',
            });
        } catch (error: any) {
            console.error('Error sharing:', error.message);
        }
    };

    if (!isConnected) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <User size={64} color={Theme.colors.textDim} />
                    <Text style={styles.loginHint}>Log in to see your account</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Account</Text>
                <TouchableOpacity onPress={disconnect}>
                    <LogOut size={20} color={Theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarLarge}>
                        <User size={40} color="white" />
                    </View>
                    <Text style={styles.username}>Account {address?.slice(2, 6)}</Text>
                    <Text style={styles.address}>{address}</Text>
                </View>

                <View style={styles.referralCard}>
                    <View style={styles.referralHeader}>
                        <Award size={20} color="#FFD700" />
                        <Text style={styles.referralTitle}>Invite & Earn</Text>
                    </View>
                    <Text style={styles.referralDesc}>
                        Get 50 Credits for every friend who joins and makes their first move!
                    </Text>

                    <View style={styles.codeContainer}>
                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>{referralCode}</Text>
                        </View>
                        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                            <Copy size={18} color={Theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite}>
                        <Share2 size={18} color="white" />
                        <Text style={styles.inviteBtnText}>Send Invites</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Friends Invited</Text>
                        <Text style={styles.statValue}>{referredCount}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Referral Rewards</Text>
                        <Text style={[styles.statValue, { color: Theme.colors.success }]}>{referralEarnings}</Text>
                        <Text style={styles.statSubLabel}>Credits</Text>
                    </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: Theme.colors.text,
    },
    scrollContent: {
        padding: Theme.spacing.lg,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    username: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    address: {
        fontSize: 12,
        color: Theme.colors.textDim,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    referralCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: 24,
    },
    referralHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    referralTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Theme.colors.text,
    },
    referralDesc: {
        fontSize: 14,
        color: Theme.colors.textDim,
        lineHeight: 20,
        marginBottom: 20,
    },
    codeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    codeBox: {
        flex: 1,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 16,
        fontWeight: '900',
        color: Theme.colors.primary,
        letterSpacing: 2,
    },
    copyBtn: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(131, 110, 249, 0.1)',
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteBtn: {
        height: 50,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    inviteBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: Theme.colors.textDim,
        fontWeight: '600',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: Theme.colors.text,
    },
    statSubLabel: {
        fontSize: 10,
        color: Theme.colors.textDim,
        marginTop: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loginHint: {
        fontSize: 16,
        color: Theme.colors.textDim,
        marginTop: 16,
        textAlign: 'center',
    }
});
