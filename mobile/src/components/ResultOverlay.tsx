import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Theme } from '../theme';
import { Share2, Trophy, Frown, X } from 'lucide-react-native';
import { shareResult } from '../utils/shareUtility';
import Haptics from '../utils/haptics';

const { width, height } = Dimensions.get('window');

interface ResultOverlayProps {
    visible: boolean;
    result: 'WIN' | 'LOSS';
    question: string;
    outcome: string;
    winnings?: string;
    onClose: () => void;
    marketId: string;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
    visible,
    result,
    question,
    outcome,
    winnings,
    onClose,
    marketId
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
        }
    }, [visible]);

    if (!visible) return null;

    const handleShare = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        shareResult({
            question,
            outcome,
            result,
            winnings,
            marketId
        });
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.overlay,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                result === 'WIN' ? styles.winBg : styles.lossBg
            ]}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <X size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        {result === 'WIN' ? (
                            <Trophy size={64} color="#FFD700" />
                        ) : (
                            <Frown size={64} color="#FFF" />
                        )}
                    </View>

                    <Text style={styles.statusLabel}>
                        {result === 'WIN' ? 'TREND HIT' : 'NEXT TIME'}
                    </Text>
                    <Text style={styles.mainTitle}>
                        {result === 'WIN'
                            ? "You read the moment."
                            : "The wave shifted."}
                    </Text>

                    <Text style={styles.questionText}>"{question}"</Text>

                    <View style={styles.outcomeRow}>
                        <Text style={styles.outcomeLabel}>OUTCOME</Text>
                        <Text style={styles.outcomeValue}>{outcome}</Text>
                    </View>

                    {result === 'WIN' && (
                        <View style={styles.winningsContainer}>
                            <View>
                                <Text style={styles.statLabel}>Attention Growth</Text>
                                <Text style={styles.statValue}>+{winnings} Points</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.shareButtonText}>SHARE THE PULSE</Text>
                        <Share2 size={20} color="#FFF" />
                        <Text style={styles.shareBtnText}>Flex on the Crowd</Text>
                    </TouchableOpacity>

                    <Text style={styles.branding}>MONADPULSE</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: 20,
    },
    overlay: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    winBg: {
        backgroundColor: '#10B981', // Solid Emerald
    },
    lossBg: {
        backgroundColor: '#6366F1', // Indigo Pulse
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    resultTitle: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: 'center',
    },
    questionText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    outcomeRow: {
        alignItems: 'center',
        marginBottom: 24,
    },
    outcomeLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    outcomeValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
    },
    winningsContainer: {
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 20,
    },
    winningsLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    winningsValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 32,
        paddingVertical: 18,
        borderRadius: 24,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 24,
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    branding: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 4,
    },
    statusLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    mainTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 24,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
    },
    shareBtnText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
});
