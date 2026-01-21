import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { monadTestnet } from './config/chain.ts';
import { DemoProvider } from './context/DemoContext.tsx';

const config = getDefaultConfig({
  appName: 'Monad Pulse',
  projectId: 'YOUR_PROJECT_ID', // For demo/hackathon
  chains: [monadTestnet],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({
            accentColor: '#836EF9',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </DemoProvider>
  </React.StrictMode>,
);
