// Geocoding service with multiple providers
// Supports: OpenStreetMap (free), MapBox (free tier), Google Maps (paid)

class GeocodingService {
  constructor() {
    // Priority order of providers (fallback if one fails)
    this.providers = [
      { name: 'nominatim', method: this.geocodeWithNominatim },
      { name: 'mapbox', method: this.geocodeWithMapBox },
      // { name: 'google', method: this.geocodeWithGoogle } // Uncomment if you have API key
    ]
    
    // Configuration - add your API keys here
    this.config = {
      // MapBox API key (free tier: 100k requests/month)
      mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY || '',
      
      // Google Maps API key (paid service)
      googleApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      
      // Rate limiting
      rateLimitDelay: 1000 // 1 second between requests for free services
    }
    
    this.lastRequestTime = 0
  }

  // Main geocoding function with fallback providers
  async geocode(address) {
    const normalizedAddress = this.normalizeAddress(address)
    
    // Try each provider in order
    for (const provider of this.providers) {
      try {
        console.log(`Trying geocoding with ${provider.name}...`)
        const result = await provider.method.call(this, normalizedAddress)
        
        if (result && result.latitude && result.longitude) {
          console.log(`Successfully geocoded with ${provider.name}:`, result)
          return {
            ...result,
            provider: provider.name,
            success: true
          }
        }
      } catch (error) {
        console.warn(`Geocoding failed with ${provider.name}:`, error.message)
        continue
      }
    }
    
    // All providers failed
    return {
      success: false,
      error: 'All geocoding providers failed',
      latitude: null,
      longitude: null
    }
  }

  // Normalize address format
  normalizeAddress(address) {
    if (!address) return ''
    
    // Remove extra spaces and normalize format
    return address.trim()
      .replace(/\s+/g, ' ')
      .replace(/,\s*,/g, ',') // Remove double commas
  }

  // Rate limiting helper
  async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      const delay = this.config.rateLimitDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
  }

  // Provider 1: OpenStreetMap Nominatim (Free)
  async geocodeWithNominatim(address) {
    await this.rateLimit()
    
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', address)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('countrycodes', 'us,ca') // Limit to US/Canada
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TeamTango/1.0 (team-matching-app)' // Required by Nominatim
      }
    })
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data || data.length === 0) {
      throw new Error('No results found')
    }
    
    const result = data[0]
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      state: result.address?.state,
      country: result.address?.country,
      confidence: parseFloat(result.importance || 0.5)
    }
  }

  // Provider 2: MapBox Geocoding (Free tier: 100k/month)
  async geocodeWithMapBox(address) {
    if (!this.config.mapboxApiKey) {
      throw new Error('MapBox API key not configured')
    }
    
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`)
    url.searchParams.set('access_token', this.config.mapboxApiKey)
    url.searchParams.set('limit', '1')
    url.searchParams.set('country', 'us,ca') // Limit to US/Canada
    url.searchParams.set('types', 'place,locality') // Cities only
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`MapBox API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No results found')
    }
    
    const result = data.features[0]
    const [longitude, latitude] = result.center
    
    // Extract city and state from context
    const context = result.context || []
    const state = context.find(c => c.id.startsWith('region'))?.text
    const country = context.find(c => c.id.startsWith('country'))?.text
    
    return {
      latitude,
      longitude,
      formattedAddress: result.place_name,
      city: result.text,
      state,
      country,
      confidence: result.relevance || 0.5
    }
  }

  // Provider 3: Google Maps Geocoding (Paid, most accurate)
  async geocodeWithGoogle(address) {
    if (!this.config.googleApiKey) {
      throw new Error('Google Maps API key not configured')
    }
    
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address', address)
    url.searchParams.set('key', this.config.googleApiKey)
    url.searchParams.set('components', 'country:US|country:CA') // Limit to US/Canada
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Google geocoding failed: ${data.status}`)
    }
    
    const result = data.results[0]
    const location = result.geometry.location
    
    // Extract city and state from address components
    const components = result.address_components
    const city = components.find(c => c.types.includes('locality'))?.long_name
    const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name
    const country = components.find(c => c.types.includes('country'))?.long_name
    
    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
      city,
      state,
      country,
      confidence: 1.0 // Google is generally very accurate
    }
  }

  // Calculate distance between two points (client-side fallback)
  calculateDistance(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null
    
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c // Distance in miles
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Validate coordinates
  isValidCoordinates(lat, lng) {
    return typeof lat === 'number' && typeof lng === 'number' &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService()

// Helper function for easy use
export async function geocodeAddress(address) {
  return await geocodingService.geocode(address)
}

// Helper function to calculate distance
export function calculateDistance(lat1, lng1, lat2, lng2) {
  return geocodingService.calculateDistance(lat1, lng1, lat2, lng2)
} 