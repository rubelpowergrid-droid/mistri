'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Crosshair, Navigation } from 'lucide-react'

interface OsmLocationPickerProps {
  latitude: number
  longitude: number
  onChange: (lat: number, lng: number, isGps?: boolean) => void
  height?: string
}

export function OsmLocationPicker({
  latitude,
  longitude,
  onChange,
  height = '300px',
}: OsmLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const accuracyCircleRef = useRef<L.Circle | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [gpsDetected, setGpsDetected] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    // Vibrant Google-Maps style location pin marker
    const pinIcon = L.divIcon({
      className: 'osm-custom-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: none;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(37,99,235,0.5); border: 2.5px solid #ffffff;">
            <div style="transform: rotate(45deg); width: 12px; height: 12px; background: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
          </div>
          <div style="width: 10px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; margin-top: 3px; filter: blur(0.5px);"></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    })

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: true,
      autoPan: true,
    }).addTo(map)

    markerRef.current = marker

    // Marker drag event
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)), false)
    })

    // Map click event: click anywhere to place pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)), false)
    })

    mapInstanceRef.current = map

    // Fix modal rendering size
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    // Google Maps Style: Auto-detect device GPS location on mobile/browser on mount
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false)
          const userLat = Number(pos.coords.latitude.toFixed(6))
          const userLng = Number(pos.coords.longitude.toFixed(6))
          setGpsDetected(true)

          map.setView([userLat, userLng], 16, { animate: true })
          marker.setLatLng([userLat, userLng])
          onChange(userLat, userLng, true)

          // Draw accuracy blue halo (Google Maps style)
          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.remove()
          }
          accuracyCircleRef.current = L.circle([userLat, userLng], {
            radius: Math.min(Math.max(pos.coords.accuracy || 25, 20), 100),
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map)
        },
        () => {
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
      )
    }

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Sync marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng()
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerRef.current.setLatLng([latitude, longitude])
        mapInstanceRef.current.panTo([latitude, longitude])
      }
    }
  }, [latitude, longitude])

  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে লোকেশন সার্ভিস চালু নেই')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        setGpsDetected(true)
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17, { animate: true })
          markerRef.current.setLatLng([lat, lng])

          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.remove()
          }
          accuracyCircleRef.current = L.circle([lat, lng], {
            radius: Math.min(Math.max(pos.coords.accuracy || 25, 20), 100),
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(mapInstanceRef.current)
        }
        onChange(lat, lng, true)
      },
      () => {
        setIsLocating(false)
        alert('আপনার বর্তমান অবস্থান শনাক্ত করা যায়নি। অনুগ্রহ করে মোবাইলের GPS চালু করে অনুমোদন দিন।')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Floating GPS Button (Google Maps Style) */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={isLocating}
        className={`absolute bottom-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border text-xs font-bold transition-all cursor-pointer backdrop-blur-xs ${
          isLocating 
            ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'
            : gpsDetected
            ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
        }`}
        title="আমার বর্তমান GPS অবস্থান পিন করুন"
      >
        <Navigation className={`h-4 w-4 ${isLocating ? 'animate-spin' : gpsDetected ? 'text-white' : 'text-blue-600'}`} />
        <span>{isLocating ? 'শনাক্ত হচ্ছে...' : gpsDetected ? 'GPS সক্রিয়' : 'আমার লোকেশন'}</span>
      </button>

      {/* Guide notice pill */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg pointer-events-none shadow-md flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>ম্যাপে ট্যাপ করুন বা পিনটি টেনে আপনার বাড়িতে বসান</span>
      </div>
    </div>
  )
}
