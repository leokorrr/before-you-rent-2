import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

type TGetMapsData = {
  address: string
  selectedFilters: string[]
  radiusKm: number
}

// let quotaTracker = {
//   geocoding: { count: 0, lastReset: new Date().getMonth() },
//   places: { count: 0, lastReset: new Date().getMonth() }
// }

const QUOTA_FILE_PATH = join(process.cwd(), 'quota-tracker.json')

const QUOTA_LIMITS = {
  geocoding: 10000, // Geocoding API
  places: 10000 // Places API
}

function loadQuotaTracker() {
  if (!existsSync(QUOTA_FILE_PATH)) {
    return {
      geocoding: { count: 0, lastReset: new Date().getMonth() },
      places: { count: 0, lastReset: new Date().getMonth() }
    }
  }

  try {
    const data = readFileSync(QUOTA_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading quota file:', error)
    return {
      geocoding: { count: 0, lastReset: new Date().getMonth() },
      places: { count: 0, lastReset: new Date().getMonth() }
    }
  }
}

// Save quota to file
function saveQuotaTracker(quotaTracker: any) {
  try {
    writeFileSync(QUOTA_FILE_PATH, JSON.stringify(quotaTracker, null, 2))
  } catch (error) {
    console.error('Error saving quota file:', error)
  }
}

let quotaTracker = loadQuotaTracker()

function resetQuotaIfNewMonth() {
  const currentMonth = new Date().getMonth()
  let hasChanges = false // Added to track if we need to save

  Object.keys(quotaTracker).forEach((service) => {
    if (quotaTracker[service].lastReset !== currentMonth) {
      quotaTracker[service].count = 0
      quotaTracker[service].lastReset = currentMonth
      hasChanges = true // Mark that we made changes
    }
  })

  // Save to file if we made changes
  if (hasChanges) {
    saveQuotaTracker(quotaTracker)
  }
}

function checkQuota(service: string, requestCount = 1) {
  resetQuotaIfNewMonth()

  if (quotaTracker[service].count + requestCount > QUOTA_LIMITS[service]) {
    return {
      canProceed: false,
      remaining: QUOTA_LIMITS[service] - quotaTracker[service].count,
      limit: QUOTA_LIMITS[service],
      used: quotaTracker[service].count
    }
  }

  return {
    canProceed: true,
    remaining: QUOTA_LIMITS[service] - quotaTracker[service].count - requestCount,
    limit: QUOTA_LIMITS[service],
    used: quotaTracker[service].count
  }
}

function incrementQuota(service: string, count = 1) {
  quotaTracker[service].count += count
  saveQuotaTracker(quotaTracker)
}

export const getQuotaStatus = () => {
  resetQuotaIfNewMonth()
  return {
    geocoding: {
      used: quotaTracker.geocoding.count,
      remaining: QUOTA_LIMITS.geocoding - quotaTracker.geocoding.count,
      limit: QUOTA_LIMITS.geocoding
    },
    places: {
      used: quotaTracker.places.count,
      remaining: QUOTA_LIMITS.places - quotaTracker.places.count,
      limit: QUOTA_LIMITS.places
    }
  }
}

const getGeocodedLocation = async (address: string) => {
  const quotaCheck = checkQuota('geocoding')
  if (!quotaCheck.canProceed) {
    throw new Error(
      `Geocoding quota exceeded. ${quotaCheck.remaining} requests remaining this month.`
    )
  }

  // Step 1: Convert address to coordinates using Geocoding API
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`

  try {
    const response = await fetch(geocodeUrl)
    const data = await response.json()

    // Check if geocoding was successful
    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`)
    }

    incrementQuota('geocoding')

    // Extract coordinates and formatted address
    const location = data.results[0].geometry.location
    const formattedAddress = data.results[0].formatted_address

    return {
      location,
      formattedAddress
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error('Failed to geocode address')
  }
}

// Helper function to find nearby places using NEW Places API
async function findNearbyPlaces({ lat, lng, selectedFilters, radiusKm }) {
  // Define place types for apartment hunting
  const placeTypes =
    selectedFilters?.length > 0
      ? selectedFilters
      : [
          'grocery_store',
          'restaurant',
          'transit_station',
          'hospital',
          'pharmacy',
          'school',
          'bank',
          'gym',
          'shopping_mall'
        ]

  const results: any = {}

  // Search for each place type using the NEW Places API
  for (const placeType of placeTypes) {
    try {
      const quotaCheck = checkQuota('places')
      if (!quotaCheck.canProceed) {
        console.warn(
          `Places quota exceeded. ${quotaCheck.remaining} requests remaining this month.`
        )
        results[placeType] = []
        continue // Skip this place type
      }

      const placesUrl = 'https://places.googleapis.com/v1/places:searchNearby'

      const requestBody = {
        includedTypes: [placeType],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radiusKm * 1000 ?? 1000.0 // 1km radius
          }
        },
        rankPreference: 'DISTANCE'
      }

      const response = await fetch(placesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
          'X-Goog-FieldMask':
            'places.displayName,places.rating,places.formattedAddress,places.types,places.location'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.places) {
        incrementQuota('places')

        results[placeType] = data.places.map((place: any) => ({
          name: place.displayName?.text || 'Unknown',
          rating: place.rating,
          address: place.formattedAddress,
          types: place.types,
          location: place.location
        }))
      } else {
        results[placeType] = []
      }
    } catch (error) {
      console.error(`Error fetching ${placeType}:`, error)
      results[placeType] = []
    }
  }

  return results
}

export const getMapsData = async ({
  address,
  selectedFilters,
  radiusKm
}: TGetMapsData) => {
  // Check quota status before starting
  const status = getQuotaStatus()

  // Check geocoding quota (needed for address lookup)
  if (status.geocoding.remaining < 1) {
    throw new Error('Geocoding quota exhausted for this month')
  }

  // Check places quota (needed for nearby places search)
  const placeTypes =
    selectedFilters?.length > 0
      ? selectedFilters
      : [
          'grocery_store',
          'restaurant',
          'transit_station',
          'hospital',
          'pharmacy',
          'school',
          'bank',
          'gym',
          'shopping_mall'
        ]

  if (status.places.remaining < placeTypes.length) {
    throw new Error(`Places quota exhausted for this month`)
  }

  try {
    const { location } = await getGeocodedLocation(address)

    const nearbyPlaces = await findNearbyPlaces({
      lat: location.lat,
      lng: location.lng,
      selectedFilters,
      radiusKm
    })

    resetQuotaIfNewMonth()

    return {
      places: nearbyPlaces,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error('Failed to geocode address')
  }
}
