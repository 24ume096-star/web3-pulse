import { Share, Platform } from 'react-native';

interface ShareOptions {
    question: string;
    marketId: string;
    referralId?: string;
    potentialWinnings?: string;
    choice?: 'YES' | 'NO';
}

export const shareMarket = async ({ question, marketId, referralId, potentialWinnings, choice }: ShareOptions) => {
    try {
        const baseUrl = 'https://monadpulse.com/market';
        const shareUrl = `${baseUrl}/${marketId}?ref=${referralId || 'anonymous'}`;

        let message = '';
        if (choice) {
            message = `I picked ${choice}. Think I'm wrong? Prove it. 😤\n\n`;
        } else {
            message = `Check out this challenge on MonadPulse! 🚀\n\n`;
        }

        message += `"${question}"\n\n`;

        if (potentialWinnings) {
            message += `Potential Rewards: ${potentialWinnings} Points\n\n`;
        }

        message += `Join the pulse here: ${shareUrl}`;

        const result = await Share.share({
            message: Platform.OS === 'android' ? message : `${message}\n${shareUrl}`,
            url: shareUrl, // iOS only for native share sheet
            title: 'Pulse Challenge',
        });

        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                // shared with activity type of result.activityType
            } else {
                // shared
            }
        } else if (result.action === Share.dismissedAction) {
            // dismissed
        }
    } catch (error: any) {
        console.error('Error sharing:', error.message);
    }
};

interface ShareResultOptions {
    question: string;
    outcome: string;
    result: 'WIN' | 'LOSS';
    winnings?: string;
    marketId: string;
}

export const shareResult = async ({ question, outcome, result, winnings, marketId }: ShareResultOptions) => {
    try {
        const baseUrl = 'https://monadpulse.com/market';
        const shareUrl = `${baseUrl}/${marketId}`;

        let message = '';
        if (result === 'WIN') {
            message = `BOOM! I saw the PULSE correctly! 💎\n\nResult: "${question}" -> ${outcome}\nI scored: ${winnings} Points! 🚀\n\n`;
        } else {
            message = `Missed the wave this time, but the vibes were immaculate. 🌊 Pulse must go on!\n\nMarket: "${question}"\nOutcome: ${outcome}\n\n`;
        }

        message += `Join the pulse here: ${shareUrl}`;

        await Share.share({
            message: Platform.OS === 'android' ? message : `${message}\n${shareUrl}`,
            url: shareUrl,
            title: `PULSE ${result === 'WIN' ? 'WINNER' : 'PLAY'}`
        });
    } catch (error: any) {
        console.error('Error sharing result:', error.message);
    }
};
