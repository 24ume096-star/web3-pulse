import '../src/polyfills';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { WalletConnectModal } from '@walletconnect/modal-react-native';
import { WalletProvider } from '../src/context/WalletContext';
import { DemoProvider } from '../src/context/DemoContext';
import { ReferralProvider } from '../src/context/ReferralContext';
import { MetadataProvider } from '../src/context/MetadataContext';
import { useWallet } from '../src/context/WalletContext';
import { useColorScheme } from '@/components/useColorScheme';

const projectId = '8e35189e1fb0d33e8ca790100f9f3ef4';

const providerMetadata = {
  name: 'MonadPulse',
  description: 'Prediction Markets on Monad',
  url: 'https://monadpulse.com',
  icons: ['https://monadpulse.com/logo.png'],
  redirect: {
    native: 'monadpulse://',
  },
};

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <WalletProvider>
      <DemoProvider>
        <MetadataProvider>
          <RootLayoutNav />

          {/* ✅ FIXED WALLETCONNECT CONFIG */}
          <WalletConnectModal
            projectId={projectId}
            providerMetadata={providerMetadata}
            sessionParams={{
              namespaces: {
                eip155: {
                  methods: [
                    'eth_sendTransaction',
                    'eth_signTransaction',
                    'personal_sign',
                    'eth_signTypedData'
                  ],
                  chains: ['eip155:1'], // REQUIRED chain
                  events: ['chainChanged', 'accountsChanged'],
                },
              },
              optionalNamespaces: {
                eip155: {
                  methods: [
                    'eth_sendTransaction',
                    'personal_sign'
                  ],
                  chains: ['eip155:10143'], // Monad Testnet
                  events: ['chainChanged', 'accountsChanged'],
                  rpcMap: {
                    '10143': 'https://testnet-rpc.monad.xyz',
                  },
                },
              },
            }}
          />
        </MetadataProvider>
      </DemoProvider>
    </WalletProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { address } = useWallet();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ReferralProvider address={address}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ReferralProvider>
    </ThemeProvider>
  );
}
