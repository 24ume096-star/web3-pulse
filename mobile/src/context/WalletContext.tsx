import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Platform } from 'react-native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';

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
        const provider = ethersProvider;
        if (!provider) return;

        try {
            await provider.send('wallet_switchEthereumChain', [{ chainId: MONAD_CHAIN_HEX }]);
        } catch (switchError: any) {
            // This error code 4902 means the chain has not been added to the wallet
            if (switchError.code === 4902 || switchError.toString().includes('Unrecognized chain ID')) {
                try {
                    await provider.send('wallet_addEthereumChain', [{
                        chainId: MONAD_CHAIN_HEX,
                        chainName: 'Monad Testnet',
                        nativeCurrency: {
                            name: 'MON',
                            symbol: 'MON',
                            decimals: 18
                        },
                        rpcUrls: [MONAD_RPC],
                        blockExplorerUrls: ['https://testnet.monadexplorer.com']
                    }]);
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    alert('Could not add Monad network to your wallet.');
                }
            } else {
                console.error('Failed to switch network:', switchError);
            }
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
