import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buildApiUrl, API_ENDPOINTS, REFRESH_INTERVALS, fetchWithTimeout } from '../config/api';

/**
 * Market Metadata Context
 * 
 * Manages fetching and caching of market metadata from the backend API.
 * Provides HOT/TRENDING status, suggested stakes, and visibility scores.
 */

interface MarketMetadata {
    isHot: boolean;
    suggestedStake: string;
    visibilityScore: number;
    trendingTopic: string | null;
    trendScore: number;
    lastUpdated: string;
}

interface MetadataState {
    [marketAddress: string]: MarketMetadata;
}

interface MetadataContextType {
    metadata: MetadataState;
    loading: boolean;
    error: string | null;
    refreshMetadata: () => Promise<void>;
    getMarketMetadata: (address: string) => MarketMetadata | null;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [metadata, setMetadata] = useState<MetadataState>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch metadata from API
     */
    const fetchMetadata = useCallback(async () => {
        try {
            const url = buildApiUrl(API_ENDPOINTS.metadata);
            const response = await fetchWithTimeout(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                setMetadata(result.data);
                setError(null);
            } else {
                throw new Error('Invalid API response');
            }
        } catch (err) {
            console.error('Failed to fetch metadata:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');

            // Don't clear existing metadata on error, just log it
            // This allows the app to continue working with cached data
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Manual refresh function
     */
    const refreshMetadata = useCallback(async () => {
        setLoading(true);
        await fetchMetadata();
    }, [fetchMetadata]);

    /**
     * Get metadata for a specific market
     */
    const getMarketMetadata = useCallback(
        (address: string): MarketMetadata | null => {
            return metadata[address] || null;
        },
        [metadata]
    );

    /**
     * Initial fetch on mount
     */
    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    /**
     * Auto-refresh every 2 minutes
     */
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMetadata();
        }, REFRESH_INTERVALS.metadata);

        return () => clearInterval(interval);
    }, [fetchMetadata]);

    const value: MetadataContextType = {
        metadata,
        loading,
        error,
        refreshMetadata,
        getMarketMetadata,
    };

    return (
        <MetadataContext.Provider value={value}>
            {children}
        </MetadataContext.Provider>
    );
};

/**
 * Hook to access metadata context
 */
export const useMetadata = (): MetadataContextType => {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error('useMetadata must be used within MetadataProvider');
    }
    return context;
};

/**
 * Helper hook to get metadata for a specific market
 */
export const useMarketMetadata = (address: string): MarketMetadata | null => {
    const { getMarketMetadata } = useMetadata();
    return getMarketMetadata(address);
};
