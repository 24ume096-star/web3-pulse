import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Theme } from '../theme';
import { X } from 'lucide-react-native';

interface BetModalProps {
    visible: boolean;
    onClose: () => void;
    outcome: 'YES' | 'NO';
    question: string;
}

export const BetModal: React.FC<BetModalProps> = ({ visible, onClose, outcome, question }) => {
    const [amount, setAmount] = useState('');

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.blur} onPress={onClose} activeOpacity={1} />
                <View style={styles.sheet}>
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Predict {outcome}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={Theme.colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.questionSummary}>{question}</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.currencyLabel}>MON</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={Theme.colors.textDim}
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />
                    </View>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Potential Win</Text>
                            <Text style={[styles.detailValue, { color: Theme.colors.success }]}>
                                {amount ? (parseFloat(amount) * 1.8).toFixed(2) : '0.00'} MON
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Network Fee</Text>
                            <Text style={styles.detailValue}>0.0012 MON</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: outcome === 'YES' ? Theme.colors.success : Theme.colors.error }]}
                        onPress={() => { }}
                    >
                        <Text style={styles.confirmText}>Confirm Prediction</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    sheet: {
        backgroundColor: Theme.colors.surface,
        borderTopLeftRadius: Theme.borderRadius.xl,
        borderTopRightRadius: Theme.borderRadius.xl,
        padding: Theme.spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.lg,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: Theme.colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Theme.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    headerTitle: {
        color: Theme.colors.text,
        fontSize: 20,
        fontWeight: '800',
    },
    questionSummary: {
        color: Theme.colors.textDim,
        fontSize: 14,
        marginBottom: Theme.spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: Theme.borderRadius.md,
        paddingHorizontal: Theme.spacing.lg,
        height: 72,
        marginBottom: Theme.spacing.xl,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    currencyLabel: {
        color: Theme.colors.primary,
        fontSize: 18,
        fontWeight: '800',
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: Theme.colors.text,
        fontSize: 32,
        fontWeight: '700',
    },
    details: {
        marginBottom: Theme.spacing.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        color: Theme.colors.textDim,
        fontSize: 14,
    },
    detailValue: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    confirmBtn: {
        height: 56,
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
});
