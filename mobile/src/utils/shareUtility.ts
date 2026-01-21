import { Share, Platform } from 'react-native';

interface ShareOptions {
    question: string;
    marketId: string;
    referralId?: string;
    potentialWinnings?: string;
}

export const shareMarket = async ({ question, marketId, referralId, potentialWinnings }: ShareOptions) => {
    try {
        const baseUrl = 'https://monadpulse.com/market';
        const shareUrl = `${baseUrl}/${marketId}?ref=${referralId || 'anonymous'}`;

        let message = `Check out this challenge on MonadPulse! 🚀\n\n"${question}"\n\n`;

        if (potentialWinnings) {
            message += `Potential Rewards: ${potentialWinnings} Credits\n\n`;
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
