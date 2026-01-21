import './src/polyfills';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/AppNavigator';
import { WalletProvider } from './src/context/WalletContext';
import { DemoProvider } from './src/context/DemoContext';
import { ReferralProvider } from './src/context/ReferralContext';
import { useWallet } from './src/context/WalletContext';

function AppContent() {
    const { address } = useWallet();

    return (
        <ReferralProvider address={address}>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </ReferralProvider>
    );
}

function App() {
    return (
        <WalletProvider>
            <DemoProvider>
                <AppContent />
            </DemoProvider>
        </WalletProvider>
    );
}

registerRootComponent(App);

export default App;
