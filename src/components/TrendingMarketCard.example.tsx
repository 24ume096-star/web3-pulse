/**
 * Example: How to use TrendingMarketCard component
 * 
 * This shows how to integrate the trending market card with your metadata API
 */

import { TrendingMarketCard } from './TrendingMarketCard';
import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

interface Market {
  id: string;
  address: string;
  question: string;
}

interface MarketMetadata {
  isHot?: boolean;
  suggestedStake?: string;
  visibilityScore?: number;
  activityStatus?: 'increasing' | 'stable' | 'decreasing';
}

export function TrendingMarketsList() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [metadata, setMetadata] = useState<Record<string, MarketMetadata>>({});

  useEffect(() => {
    // Fetch markets
    fetch(`${API_BASE_URL}/api/markets`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMarkets(data.data);
        }
      });

    // Fetch metadata
    fetch(`${API_BASE_URL}/api/metadata`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMetadata(data.data);
        }
      });
  }, []);

  // Filter only hot/trending markets
  const trendingMarkets = markets.filter(market => {
    const meta = metadata[market.address] || metadata[market.id];
    return meta?.isHot || (meta?.visibilityScore && meta.visibilityScore >= 50);
  });

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>🔥 Trending Now</h2>

      {trendingMarkets.map(market => {
        const meta = metadata[market.address] || metadata[market.id] || {};

        return (
          <TrendingMarketCard
            key={market.id || market.address}
            question={market.question}
            suggestedStake={meta.suggestedStake || '100'}
            activityStatus={meta.activityStatus || 'increasing'}
            isHot={meta.isHot || false}
            onClick={() => {
              // Navigate to market details
              console.log('Navigate to:', market.id);
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Simple usage example:
 */
export function SimpleExample() {
  return (
    <TrendingMarketCard
      question="Will India win today's match?"
      suggestedStake="100"
      activityStatus="increasing"
      isHot={true}
      onClick={() => alert('Navigate to market details')}
    />
  );
}
