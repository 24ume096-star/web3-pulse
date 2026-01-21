import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Platform } from 'react-native';

interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [injectedAddress, setInjectedAddress] = useState<string | null>(null);
    const [isInjected, setIsInjected] = useState(false);

    useEffect(() => {
        // Check for injected provider (e.g. MetaMask browser) - works on web
        const checkInjected = async () => {
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                const ethereum = (window as any).ethereum;
                if (ethereum) {
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
                    } catch (err) {
                        console.error('Error checking injected provider:', err);
                    }
                }
            }
        };
        checkInjected();
    }, []);

    const connectInjected = async () => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
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
                    console.error('User rejected connection:', err);
                }
            } else {
                alert('Please install MetaMask or use a Web3-enabled browser');
            }
        }
    };

    const connect = useCallback(async () => {
        await connectInjected();
    }, []);

    const disconnect = useCallback(async () => {
        setInjectedAddress(null);
        setIsInjected(false);
        setEthersProvider(null);
        setSigner(null);
    }, []);

    return (
        <WalletContext.Provider
            value={{
                address: injectedAddress,
                isConnected: isInjected,
                provider: ethersProvider,
                signer,
                connect,
                disconnect,
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
