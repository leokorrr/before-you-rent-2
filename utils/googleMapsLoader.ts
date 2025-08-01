// utils/googleMapsLoader.ts
let isLoaded = false
let isLoading = false
let loadPromise: Promise<void> | null = null

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  // If already loaded, return resolved promise
  if (isLoaded) {
    return Promise.resolve()
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise
  }

  // Start loading
  isLoading = true
  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      isLoaded = true
      isLoading = false
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true

    script.onload = () => {
      isLoaded = true
      isLoading = false
      resolve()
    }

    script.onerror = () => {
      isLoading = false
      loadPromise = null
      reject(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).google?.maps
}
