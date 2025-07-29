# 🗺️ Geocoding & Proximity Search Setup

This app includes proximity/distance-based team discovery using geocoding services to convert "City, State" to coordinates for distance calculations.

## 🚀 How It Works

1. **Automatic Geocoding**: When teams are created/updated, locations are automatically converted to coordinates
2. **Distance Filtering**: Users can filter teams by distance (10, 25, 50, 100 miles)
3. **Smart Sorting**: Teams are sorted by proximity when a specific user team is selected
4. **Multiple Providers**: Falls back through multiple geocoding services for reliability

## 🔧 Configuration Options

### Option 1: Free (No Setup Required)
- **OpenStreetMap Nominatim** - Works out of the box
- **Rate Limited**: 1 request per second
- **Coverage**: Good for most US/Canada locations
- **Setup**: None required! 

### Option 2: Enhanced (Free Tier)
- **MapBox Geocoding API** - More accurate, higher rate limits
- **Free Tier**: 100,000 requests/month
- **Setup**: Add environment variable

```bash
# In your .env file
VITE_MAPBOX_API_KEY=your_mapbox_api_key_here
```

> **Note:** Environment variables in Vite must be prefixed with `VITE_` to be accessible in the frontend code.

**Get MapBox API Key:**
1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Go to Account → Access Tokens
3. Create new token with geocoding permissions
4. Copy token to your `.env` file

### Option 3: Premium (Paid)
- **Google Maps Geocoding API** - Most accurate
- **Pricing**: $5 per 1,000 requests (after free tier)
- **Setup**: Add environment variable

```bash
# In your .env file
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> **Note:** Environment variables in Vite must be prefixed with `VITE_` to be accessible in the frontend code.

**Get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Geocoding API
3. Create API key
4. Restrict key to Geocoding API for security
5. Copy key to your `.env` file

## 📊 Database Schema

The app automatically adds these columns to the `teams` table:

```sql
-- Geographic data
latitude DECIMAL(10, 8)     -- Latitude coordinate
longitude DECIMAL(11, 8)    -- Longitude coordinate
geocoded_at TIMESTAMP       -- When location was geocoded
geocoding_failed BOOLEAN    -- If geocoding failed
```

## 🔍 Distance Search Features

### User Experience
- **Distance Filter**: "Within 10/25/50/100 miles"
- **Distance Display**: Shows miles away on team cards
- **Smart Sorting**: Closer teams appear first
- **Fallback**: Works without coordinates (no distance info)

### Technical Details
- **PostGIS**: Uses PostgreSQL geographic functions for efficient distance queries
- **Haversine Formula**: Client-side distance calculations for sorting
- **Caching**: Coordinates cached in database to avoid repeated API calls
- **Error Handling**: Graceful fallback when geocoding fails

## 🛠️ Troubleshooting

### No Distance Information Showing
1. Check if your teams have `city` and `state` filled in
2. Look for geocoding errors in browser console
3. Verify API keys are correctly set
4. Check if teams were created before geocoding was enabled

### Geocode Existing Teams
If you have teams created before geocoding was enabled:

```javascript
// Run this in browser console (when logged in)
await teamStore.geocodeExistingTeams()
```

### Rate Limiting Issues
- **Nominatim**: 1 request/second (automatic rate limiting)
- **MapBox**: 600 requests/minute on free tier
- **Google**: 50 requests/second with API key

## 📈 Performance Considerations

### Efficient Search
- Distance filtering uses PostGIS for database-level optimization
- Only teams with coordinates are included in distance searches
- Results limited to 50 teams for performance

### API Usage Optimization
- Coordinates cached permanently after successful geocoding
- Failed geocoding attempts marked to prevent retries
- Rate limiting prevents overwhelming free services
- Bulk geocoding spreads requests over time

## 🌐 Supported Regions

All geocoding providers are configured for:
- **United States** (all states)
- **Canada** (all provinces)

To add other countries, modify the geocoding service configuration in `src/services/geocoding.js`.

## 🔄 Provider Fallback Order

1. **MapBox** (if API key provided)
2. **Nominatim** (OpenStreetMap - always available)
3. **Google Maps** (if API key provided and enabled)

The app automatically tries each provider in order until one succeeds.

## 💡 Pro Tips

1. **Start with Nominatim**: No setup required, works for most use cases
2. **Upgrade to MapBox**: When you need higher accuracy or rate limits
3. **Monitor Usage**: Check your API usage in provider dashboards
4. **Test Locally**: Use real city/state combinations when testing
5. **Backup Plan**: App works fine without coordinates (just no distance features)

---

**Need Help?** Check the browser console for geocoding logs and error messages. 