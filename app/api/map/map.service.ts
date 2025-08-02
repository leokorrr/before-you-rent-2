type TGetMapsData = {
  address: string
  selectedFilters: string[]
  radiusKm: number
}

const getGeocodedLocation = async (address: string) => {
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
  try {
    const { location } = await getGeocodedLocation(address)

    const nearbyPlaces = await findNearbyPlaces({
      lat: location.lat,
      lng: location.lng,
      selectedFilters,
      radiusKm
    })

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
