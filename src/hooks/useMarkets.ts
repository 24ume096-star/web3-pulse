import { useState, useEffect } from 'react';
import { buildApiUrl, fetchWithTimeout, API_ENDPOINTS } from '../config/api';

export interface Market {
  id: string;
  address?: string;
  question: string;
  category?: string;
  yesPool: number;
  noPool: number;
  endTime?: string;
  ends?: string;
  trend?: string;
  // Pulse Intelligence Fields
  insight?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  source?: string;
  sourceUrl?: string;
  headline?: string;
}

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const url = buildApiUrl(API_ENDPOINTS.markets);
        const response = await fetchWithTimeout(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Normalize market data
          const normalizedMarkets = result.data.map((market: any) => ({
            id: market.id || market.address || `market-${Math.random()}`,
            address: market.address,
            question: market.question,
            category: market.category || 'General',
            yesPool: market.yesPool || 0,
            noPool: market.noPool || 0,
            endTime: market.endTime,
            ends: market.endTime || market.ends || 'N/A',
            trend: market.trend || market.sentiment || 'neutral',
            // Pulse Intelligence Fields
            insight: market.insight,
            sentiment: market.sentiment || 'neutral',
            source: market.source,
            sourceUrl: market.sourceUrl,
            headline: market.headline
          }));

          setMarkets(normalizedMarkets);
          setError(null);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        console.error('Failed to fetch markets:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Fallback to empty array on error (app will show empty state)
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMarkets, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { markets, loading, error };
}
