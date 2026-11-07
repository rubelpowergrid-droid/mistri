'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Crosshair } from 'lucide-react'

interface OsmLocationPickerProps {
  latitude: number
  longitude: number
  onChange: (lat: number, lng: number) => void
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

    // Vibrant location pin marker
    const pinIcon = L.divIcon({
      className: 'osm-custom-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: none;">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(37,99,235,0.5); border: 2px solid #ffffff;">
            <div style="transform: rotate(45deg); width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
          </div>
          <div style="width: 8px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [38, 44],
      iconAnchor: [19, 44],
    })

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map)

    markerRef.current = marker

    // Marker drag event
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)))
    })

    // Map click event
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
    })

    mapInstanceRef.current = map

    // Fix modal rendering glitch where tiles need invalidateSize
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

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

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16)
          markerRef.current.setLatLng([lat, lng])
        }
        onChange(lat, lng)
      },
      () => {
        alert('আপনার বর্তমান অবস্থান শনাক্ত করা যায়নি। অনুগ্রহ করে জিপিএস অনুমোদন দিন বা ম্যাপে ক্লিক করে পিন করুন।')
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Locate Me Floating Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        className="absolute bottom-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white text-blue-700 font-bold text-xs rounded-xl shadow-lg border border-slate-200 transition-all cursor-pointer backdrop-blur-xs"
        title="আমার বর্তমান অবস্থান পিন করুন"
      >
        <Crosshair className="h-4 w-4 animate-pulse text-blue-600" />
        <span>আমার লোকেশন</span>
      </button>

      {/* Guide notice pill */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg pointer-events-none shadow-md">
        🗺️ ম্যাপে ক্লিক করুন বা পিনটি টেনে বসান
      </div>
    </div>
  )
}
