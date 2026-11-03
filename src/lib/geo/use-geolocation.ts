'use client'

import { useState, useEffect, useCallback } from 'react'
import { Coordinates, DEFAULT_DISTRICT_COORDINATES } from './index'

export interface GeolocationState {
  coordinates: Coordinates | null
  accuracy: number | null
  isLoading: boolean
  error: string | null
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported'
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    accuracy: null,
    isLoading: true,
    error: null,
    permissionStatus: 'prompt',
  })

  const requestPosition = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState({
        coordinates: DEFAULT_DISTRICT_COORDINATES.thakurgaon,
        accuracy: null,
        isLoading: false,
        error: 'Geolocation is not supported by your browser',
        permissionStatus: 'unsupported',
      })
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          isLoading: false,
          error: null,
          permissionStatus: 'granted',
        })
      },
      (error) => {
        let errorMsg = 'Failed to retrieve location'
        let permStatus: 'denied' | 'prompt' = 'prompt'
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied by user'
          permStatus = 'denied'
        }

        // Fallback to Thakurgaon district center
        setState({
          coordinates: DEFAULT_DISTRICT_COORDINATES.thakurgaon,
          accuracy: null,
          isLoading: false,
          error: errorMsg,
          permissionStatus: permStatus,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  useEffect(() => {
    requestPosition()
  }, [requestPosition])

  return {
    ...state,
    refreshLocation: requestPosition,
  }
}

