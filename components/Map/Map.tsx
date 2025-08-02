// components/PlacesMap.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

type Place = {
  name: string
  rating?: number
  address: string
  location: {
    latitude: number
    longitude: number
  }
}

type PlacesMapProps = {
  center: { lat: number; lng: number }
  places: { [key: string]: Place[] }
  apiKey: string
}

export const Map = ({ center, places, apiKey }: PlacesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('Loading...')

  // Color coding and icons for different place types
  const placeConfig: { [key: string]: { color: string; icon: string; label: string } } = {
    grocery_store: { color: '#4CAF50', icon: '🛒', label: 'Grocery' },
    restaurant: { color: '#FF9800', icon: '🍽️', label: 'Restaurant' },
    gym: { color: '#9C27B0', icon: '💪', label: 'Gym' },
    shopping_mall: { color: '#2196F3', icon: '🛍️', label: 'Mall' },
    hospital: { color: '#F44336', icon: '🏥', label: 'Hospital' },
    pharmacy: { color: '#00BCD4', icon: '💊', label: 'Pharmacy' },
    school: { color: '#FFEB3B', icon: '🏫', label: 'School' },
    bank: { color: '#795548', icon: '🏦', label: 'Bank' },
    transit_station: { color: '#607D8B', icon: '🚌', label: 'Transit' },
    gas_station: { color: '#FF5722', icon: '⛽', label: 'Gas' }
  }

  // First useEffect: Load the Google Maps script
  useEffect(() => {

    const loadGoogleMaps = () => {
      if ((window as any).google?.maps) {
        setIsScriptLoaded(true)
        return
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        setLoadingStatus('Waiting for Google Maps...')

        const checkLoaded = setInterval(() => {
          if ((window as any).google?.maps) {
            clearInterval(checkLoaded)
            setIsScriptLoaded(true)
          }
        }, 100)

        setTimeout(() => {
          clearInterval(checkLoaded)
          if (!(window as any).google?.maps) {
            console.error('Timeout waiting for Google Maps')
            setLoadingStatus('Error: Timeout loading Google Maps')
          }
        }, 10000)

        return
      }

      setLoadingStatus('Loading Google Maps script...')

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true

      script.onload = () => {
        setTimeout(() => {
          if ((window as any).google?.maps) {
            setIsScriptLoaded(true)
          } else {
            console.error('Google Maps not available after load')
            setLoadingStatus('Error: Google Maps not available')
          }
        }, 100)
      }

      script.onerror = () => {
        console.error('Failed to load Google Maps script')
        setLoadingStatus('Error: Failed to load Google Maps')
      }

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [apiKey])

  // Second useEffect: Initialize map when both script is loaded AND component is mounted
  useEffect(() => {
    if (isScriptLoaded && mapRef.current && !isMapReady) {
      setLoadingStatus('Initializing map...')
      initializeMap()
    }
  }, [isScriptLoaded, isMapReady])

  const initializeMap = () => {

    if (!mapRef.current || !(window as any).google?.maps) {
      console.error('Requirements not met for map initialization')
      setLoadingStatus('Error: Requirements not met')
      return
    }

    try {
      const google = (window as any).google

      const map = new google.maps.Map(mapRef.current, {
        center: center,
        zoom: 14,
        styles: [
          // Optional: Reduce default POI clutter
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })

      mapInstanceRef.current = map
      setIsMapReady(true)

      // Add center marker (searched address) - special red marker
      new google.maps.Marker({
        position: center,
        map: map,
        title: 'Searched Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#FF0000" stroke="#FFFFFF" stroke-width="3"/>
              <circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      })

      addMarkersToMap()
    } catch (error) {
      console.error('Error creating map:', error)
      setLoadingStatus('Error: Failed to create map - ' + error)
    }
  }

  const addMarkersToMap = () => {
    if (!mapInstanceRef.current) return

    const google = (window as any).google

    Object.entries(places).forEach(([placeType, placeList]) => {
      const config = placeConfig[placeType] || { color: '#666666', icon: '📍', label: 'Other' }

      placeList.forEach((place) => {
        // Create custom SVG marker with emoji
        const markerIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="${config.color}" stroke="#FFFFFF" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" font-size="16">${config.icon}</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }

        new google.maps.Marker({
          position: {
            lat: place.location.latitude,
            lng: place.location.longitude
          },
          map: mapInstanceRef.current,
          title: `${place.name}\n${config.label}\n${place.rating ? place.rating + '★' : 'No rating'}`,
          icon: markerIcon
        })
      })
    })
  }

  // Always render the container, but show loading state
  return (
    <div className='w-full h-[600px] rounded-lg border relative'>
      {!isMapReady && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-50'>
          <div className='text-gray-500'>{loadingStatus}</div>
        </div>
      )}
      <div
        ref={mapRef}
        className='w-full h-full'
        style={{ minHeight: '400px' }}
      />

      {/* Optional: Legend */}
      {isMapReady && (
        <div className='absolute top-4 right-4 bg-white p-3 rounded shadow-lg max-w-xs'>
          <h3 className='font-semibold text-sm mb-2'>Legend</h3>
          <div className='grid grid-cols-2 gap-1 text-xs'>
            <div className='flex items-center gap-1'>
              <span className='text-red-500'>🔴</span>
              <span>Your Location</span>
            </div>
            {Object.entries(placeConfig).map(([key, config]) => (
              places[key] && places[key].length > 0 && (
                <div key={key} className='flex items-center gap-1'>
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}