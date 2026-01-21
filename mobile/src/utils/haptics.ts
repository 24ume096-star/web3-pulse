import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

// Haptics wrapper that works on web
const Haptics = {
    impactAsync: Platform.OS === 'web'
        ? async () => Promise.resolve()
        : ExpoHaptics.impactAsync,

    notificationAsync: Platform.OS === 'web'
        ? async () => Promise.resolve()
        : ExpoHaptics.notificationAsync,

    selectionAsync: Platform.OS === 'web'
        ? async () => Promise.resolve()
        : ExpoHaptics.selectionAsync,

    ImpactFeedbackStyle: ExpoHaptics.ImpactFeedbackStyle,
    NotificationFeedbackType: ExpoHaptics.NotificationFeedbackType,
};

export default Haptics;
