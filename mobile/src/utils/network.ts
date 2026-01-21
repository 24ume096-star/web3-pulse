// Utility to switch network to Monad Testnet
export async function switchToMonad(provider: any) {
    const monadChain = {
        // Corrected Hex for 10143 is 0x279F. User provided 0x27A7 (10151) but comment said 10143.
        // We use 0x279F to be safe and match the config.
        chainId: '0x279F',
        chainName: 'Monad Testnet',
        nativeCurrency: {
            name: 'MON',
            symbol: 'MON',
            decimals: 18,
        },
        rpcUrls: ['https://testnet-rpc.monad.xyz'],
        blockExplorerUrls: ['https://testnet.monadexplorer.com'],
    };

    try {
        // Try to add the chain first (some wallets need this before switch if it doesn't exist)
        // Or try switch first? Standard is switch, catch 4902, then add.
        // User code adds first. Adding first is safe if it updates existing or does nothing.
        // However, clean standard is switch -> catch -> add.
        // But let's follow user's aggressive adding approach if that's what they provided, 
        // but cleaning it up: usually wallet_addEthereumChain is harmless if already exists.

        // We'll follow the robust pattern: Add implies switch in some wallets, but explicit switch is better.

        await provider.request({
            method: 'wallet_addEthereumChain',
            params: [monadChain],
        });

        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x279F' }],
        });

        return true;
    } catch (err) {
        console.error('Monad switch failed:', err);
        return false;
    }
}
