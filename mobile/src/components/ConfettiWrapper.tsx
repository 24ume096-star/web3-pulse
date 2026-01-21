import React from 'react';
import { Platform } from 'react-native';

// Confetti doesn't work on web, so we'll create a no-op component
const ConfettiCannon = Platform.OS === 'web'
    ? () => null
    : require('react-native-confetti-cannon').default;

export default ConfettiCannon;
