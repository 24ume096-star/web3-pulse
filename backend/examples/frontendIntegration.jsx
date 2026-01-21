import { useState, useEffect } from 'react';

/**
 * Frontend Integration Example for Market Metadata
 * 
 * This file demonstrates how to:
 * 1. Fetch market metadata from the API
 * 2. Display HOT badges on trending markets
 * 3. Show suggested stake amounts
 * 4. Sort markets by visibility score
 */

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Custom hook to fetch market metadata
 */
export function useMarketMetadata() {
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMetadata() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/metadata`);
                const result = await response.json();

                if (result.success) {
                    setMetadata(result.data);
                } else {
                    setError('Failed to fetch metadata');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMetadata();

        // Refresh every 2 minutes
        const interval = setInterval(fetchMetadata, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { metadata, loading, error };
}

/**
 * Custom hook to fetch trending topics
 */
export function useTrendingTopics() {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/trending`);
                const result = await response.json();

                if (result.success) {
                    setTrends(result.data);
                }
            } catch (err) {
                console.error('Failed to fetch trends:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTrends();

        // Refresh every 5 minutes
        const interval = setInterval(fetchTrends, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { trends, loading };
}

/**
 * Example: Market Card Component with Metadata
 */
export function MarketCard({ market }) {
    const { metadata } = useMarketMetadata();
    const marketMeta = metadata[market.address] || {};

    return (
        <div className="market-card">
            {/* HOT Badge */}
            {marketMeta.isHot && (
                <span className="hot-badge">
                    🔥 HOT
                </span>
            )}

            {/* Market Question */}
            <h3>{market.question}</h3>

            {/* Trending Topic */}
            {marketMeta.trendingTopic && (
                <p className="trending-topic">
                    📊 Trending: {marketMeta.trendingTopic}
                </p>
            )}

            {/* Suggested Stake */}
            <div className="stake-info">
                <span>Suggested Stake:</span>
                <strong>{marketMeta.suggestedStake || '0.001'} ETH</strong>
            </div>

            {/* Visibility Score */}
            {marketMeta.visibilityScore && (
                <div className="visibility-bar">
                    <div
                        className="visibility-fill"
                        style={{ width: `${marketMeta.visibilityScore}%` }}
                    />
                </div>
            )}

            {/* Bet Buttons */}
            <div className="bet-buttons">
                <button>Bet YES</button>
                <button>Bet NO</button>
            </div>
        </div>
    );
}

/**
 * Example: Markets List with Sorting
 */
export function MarketsList({ markets }) {
    const { metadata } = useMarketMetadata();

    // Sort markets by visibility score (descending)
    const sortedMarkets = [...markets].sort((a, b) => {
        const scoreA = metadata[a.address]?.visibilityScore || 0;
        const scoreB = metadata[b.address]?.visibilityScore || 0;
        return scoreB - scoreA;
    });

    return (
        <div className="markets-list">
            <h2>Prediction Markets</h2>

            {sortedMarkets.map(market => (
                <MarketCard key={market.address} market={market} />
            ))}
        </div>
    );
}

/**
 * Example: Trending Topics Sidebar
 */
export function TrendingSidebar() {
    const { trends, loading } = useTrendingTopics();

    if (loading) return <div>Loading trends...</div>;

    return (
        <div className="trending-sidebar">
            <h3>🔥 Trending Now</h3>
            <ul>
                {trends.slice(0, 5).map((trend, index) => (
                    <li key={index}>
                        <span className="trend-rank">#{index + 1}</span>
                        <span className="trend-topic">{trend.topic}</span>
                        <span className="trend-score">{trend.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Example: CSS Styles
 */
export const styles = `
.market-card {
    position: relative;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 16px;
}

.hot-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.trending-topic {
    color: #666;
    font-size: 14px;
    margin: 8px 0;
}

.stake-info {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;
}

.visibility-bar {
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    overflow: hidden;
    margin: 12px 0;
}

.visibility-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s ease;
}

.bet-buttons {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}

.bet-buttons button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
}

.trending-sidebar {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
}

.trending-sidebar ul {
    list-style: none;
    padding: 0;
}

.trending-sidebar li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin: 8px 0;
    background: white;
    border-radius: 6px;
}

.trend-rank {
    font-weight: bold;
    color: #ff6b6b;
}

.trend-score {
    margin-left: auto;
    background: #4CAF50;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}
`;
