import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Platform } from 'react-native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { switchToMonad } from '../utils/network';

const MONAD_CHAIN_ID = 10143;
const MONAD_CHAIN_HEX = '0x279f'; // 10143 in hex
const MONAD_RPC = 'https://testnet-rpc.monad.xyz';

interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Web State
    const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [injectedAddress, setInjectedAddress] = useState<string | null>(null);
    const [isInjected, setIsInjected] = useState(false);

    // Mobile (WalletConnect) State
    const {
        isConnected: isWCConnected,
        address: wcAddress,
        provider: wcProvider,
        open: openWCModal,
        close: closeWCModal
    } = useWalletConnectModal();

    // Initialize Provider & Signer
    useEffect(() => {
        const initProvider = async () => {
            if (Platform.OS === 'web') {
                // ... (Web logic remains existing) ...
                if (typeof window !== 'undefined' && (window as any).ethereum) {
                    const ethereum = (window as any).ethereum;
                    try {
                        const provider = new ethers.BrowserProvider(ethereum);
                        const accounts = await ethereum.request({ method: 'eth_accounts' });
                        if (accounts.length > 0) {
                            setInjectedAddress(accounts[0]);
                            setEthersProvider(provider);
                            setIsInjected(true);
                            const sig = await provider.getSigner();
                            setSigner(sig);
                        }
                    } catch (e) { console.error(e); }
                }
            } else {
                // Mobile Logic
                if (isWCConnected && wcProvider) {
                    try {
                        const provider = new ethers.BrowserProvider(wcProvider);
                        setEthersProvider(provider);
                        const sig = await provider.getSigner();
                        setSigner(sig);
                    } catch (error) {
                        console.error('Error initializing mobile provider:', error);
                    }
                } else {
                    setEthersProvider(null);
                    setSigner(null);
                }
            }
        };

        initProvider();
    }, [isWCConnected, wcProvider, Platform.OS]);


    const connect = useCallback(async () => {
        if (Platform.OS === 'web') {
            // Web connect logic
            const ethereum = (window as any).ethereum;
            if (ethereum) {
                try {
                    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                    setInjectedAddress(accounts[0]);
                    const provider = new ethers.BrowserProvider(ethereum);
                    setEthersProvider(provider);
                    setIsInjected(true);
                    const sig = await provider.getSigner();
                    setSigner(sig);
                } catch (err) {
                    console.error(err);
                }
            } else {
                alert('Please install MetaMask');
            }
        } else {
            // Mobile connect logic
            openWCModal();
        }
    }, [openWCModal]);

    const disconnect = useCallback(async () => {
        if (Platform.OS === 'web') {
            setInjectedAddress(null);
            setIsInjected(false);
            setEthersProvider(null);
            setSigner(null);
        } else {
            // WalletConnect disconnect logic is handled by the provider usually,
            // but we can try to close or clear local state
            if (isWCConnected && wcProvider) {
                try {
                    (wcProvider as any).disconnect();
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, [isWCConnected, wcProvider]);

    const switchNetwork = async () => {
        // We need the raw provider for the utility (which uses .request)
        // For mobile: wcProvider
        // For web: window.ethereum

        let rawProvider: any = null;

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                rawProvider = (window as any).ethereum;
            }
        } else {
            rawProvider = wcProvider;
        }

        if (rawProvider) {
            await switchToMonad(rawProvider);
        } else {
            console.error("No provider available to switch network");
        }
    };

    // Derived state
    const currentAddress = Platform.OS === 'web' ? injectedAddress : wcAddress;
    const currentIsConnected = Platform.OS === 'web' ? isInjected : isWCConnected;

    return (
        <WalletContext.Provider
            value={{
                address: currentAddress || null,
                isConnected: !!currentIsConnected,
                provider: ethersProvider,
                signer,
                connect,
                disconnect,
                switchNetwork
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
