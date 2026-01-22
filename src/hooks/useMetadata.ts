import { useState, useEffect } from 'react';
import { buildApiUrl, fetchWithTimeout, API_ENDPOINTS } from '../config/api';

export interface MarketMetadata {
  isHot?: boolean;
  suggestedStake?: string;
  visibilityScore?: number;
  trendingTopic?: string | null;
  trendScore?: number;
  activityStatus?: 'increasing' | 'stable' | 'decreasing';
  lastUpdated?: string;
}

export function useMetadata() {
  const [metadata, setMetadata] = useState<Record<string, MarketMetadata>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
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
        // Don't clear existing metadata on error - allow app to continue with cached data
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();

    // Refresh every 2 minutes (aligned with backend cron job)
    const interval = setInterval(fetchMetadata, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshMetadata = async () => {
    setLoading(true);
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
      }
    } catch (err) {
      console.error('Failed to refresh metadata:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { metadata, loading, error, refreshMetadata };
}
