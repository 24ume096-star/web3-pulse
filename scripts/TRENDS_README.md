# Enhanced Trending Topics Fetcher

## Overview

A Node.js script that fetches 5-10 trending topics from multiple sources with automatic fallback.

## Features

✅ **Multiple Data Sources**
- Google Trends RSS (no API key required)
- Mock data fallback

✅ **No API Keys Required**
- Uses public Google Trends RSS feed
- Works without authentication

✅ **Smart Fallback**
- Automatically falls back to mock data if Google Trends fails
- Time-based mock data for variety

✅ **Sorted Results**
- Returns topics sorted by popularity score (0-100)
- Normalized scoring system

## Usage

### As a Script

```bash
node scripts/fetchTrends.cjs
```

**Output:**
```
============================================================
🚀 Trending Topics Fetcher
============================================================

🔍 Fetching trending topics...
📊 Attempting to fetch from Google Trends...
✅ Successfully fetched 10 trends from Google Trends

📈 TOP TRENDING TOPICS:

1. Bitcoin Price Surge
   Score: 95/100 ███████████████████

2. AI Breakthrough
   Score: 92/100 ██████████████████

3. Tech Stocks Rally
   Score: 88/100 █████████████████

...

============================================================
✅ Total trends fetched: 10
============================================================
```

### As a Module

```javascript
const { fetchTrendingTopics, getTopTrends } = require('./scripts/fetchTrends.cjs');

// Get all trending topics
const trends = await fetchTrendingTopics();
console.log(trends);
// [
//   { topic: "Bitcoin Price Surge", score: 95 },
//   { topic: "AI Breakthrough", score: 92 },
//   ...
// ]

// Get top 5 trends
const top5 = await getTopTrends(5);
```

## Data Sources

### 1. Google Trends RSS

**URL:** `https://trends.google.com/trends/trendingsearches/daily/rss?geo=US`

**Pros:**
- Real-time trending data
- No API key required
- Public RSS feed

**Cons:**
- May have rate limits
- Requires internet connection
- XML parsing needed

### 2. Mock Data

**Used when:**
- Google Trends is unavailable
- Network error occurs
- Rate limit exceeded

**Features:**
- Time-based variety (morning/afternoon/evening)
- Realistic tech/crypto/business topics
- Random score fluctuation for realism

## Return Format

```typescript
Array<{
  topic: string,    // Trending topic name
  score: number     // Popularity score (50-100)
}>
```

**Example:**
```json
[
  {
    "topic": "Bitcoin Price Surge",
    "score": 95
  },
  {
    "topic": "AI Breakthrough Announced",
    "score": 92
  },
  {
    "topic": "Tech Stocks Rally",
    "score": 88
  }
]
```

## Integration with Cron Job

The cron job automatically uses this script:

```javascript
// backend/cronJob.cjs
const { fetchTrendingTopics } = require('../scripts/fetchTrends.cjs');

async function updateMetadata() {
  const trends = await fetchTrendingTopics();
  // Update market metadata based on trends
}
```

## Customization

### Change Geographic Region

Edit the Google Trends URL:
```javascript
const url = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB'; // UK
// Other options: IN (India), JP (Japan), etc.
```

### Adjust Score Range

Modify the normalization:
```javascript
const score = Math.min(100, Math.round((trafficValue / maxTraffic) * 100));
// Change maxTraffic to adjust sensitivity
```

### Add More Mock Topics

Edit the topic arrays:
```javascript
const morningTopics = [
  { topic: "Your Custom Topic", baseScore: 90 },
  // Add more...
];
```

## Error Handling

The script handles errors gracefully:

1. **Network Errors**: Falls back to mock data
2. **Parsing Errors**: Falls back to mock data
3. **Empty Results**: Returns mock data

**Example:**
```
⚠️  Google Trends fetch failed: Network timeout
🎲 Using mock trending data
```

## Testing

### Test Google Trends Fetch

```bash
node scripts/fetchTrends.cjs
```

### Test as Module

```javascript
const { fetchGoogleTrends, generateMockTrends } = require('./scripts/fetchTrends.cjs');

// Test Google Trends
const realTrends = await fetchGoogleTrends();

// Test Mock Data
const mockTrends = generateMockTrends();
```

## Troubleshooting

### "Network Error"

**Cause**: No internet connection or Google Trends is blocked

**Solution**: Script automatically uses mock data

### "Empty Results"

**Cause**: Google Trends RSS format changed

**Solution**: Update XML parsing regex or use mock data

### "Module Error"

**Cause**: Using `.js` extension instead of `.cjs`

**Solution**: Rename to `fetchTrends.cjs`

## Future Enhancements

Potential improvements:

1. **Twitter API Integration**
   - Fetch trending hashtags
   - Requires API key

2. **Reddit Trends**
   - Parse r/all hot posts
   - No API key needed

3. **News API**
   - Fetch trending news topics
   - Free tier available

4. **Caching**
   - Cache results for 10 minutes
   - Reduce API calls

5. **Multiple Regions**
   - Fetch from multiple countries
   - Combine and deduplicate

## API Alternatives

If you want to use other APIs:

### Twitter Trends API
```javascript
// Requires API key
const trends = await fetch('https://api.twitter.com/1.1/trends/place.json?id=1');
```

### NewsAPI
```javascript
// Free tier: 100 requests/day
const trends = await fetch('https://newsapi.org/v2/top-headlines?apiKey=YOUR_KEY');
```

### Reddit
```javascript
// No API key needed
const trends = await fetch('https://www.reddit.com/r/all/hot.json');
```
