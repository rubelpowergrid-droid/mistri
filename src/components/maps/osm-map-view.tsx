'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import Link from 'next/link'
import { toBanglaNumber, formatDistance, formatBDT } from '@/lib/utils'

export interface MapMistriItem {
  id: string
  name_bn: string
  category_name_bn: string
  distance_km: number
  rating_avg: number
  hourly_rate?: number | null
  latitude?: number
  longitude?: number
  avatar_url?: string
}

interface OsmMapViewProps {
  center?: [number, number]
  zoom?: number
  customerLocation?: {
    latitude: number
    longitude: number
    address?: string
  }
  mistris?: MapMistriItem[]
  height?: string
  showRadius?: boolean
  radiusKm?: number
  onMarkerClick?: (mistriId: string) => void
}

export function OsmMapView({
  center = [26.0333, 88.4667], // Default: Thakurgaon Sadar
  zoom = 13,
  customerLocation = { latitude: 26.0333, longitude: 88.4667, address: 'আপনার বর্তমান অবস্থান' },
  mistris = [],
  height = '420px',
  showRadius = true,
  radiusKm = 10,
}: OsmMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: false, // Prevent page scroll interference
    })

    // OpenStreetMap Standard Tile Layer with Full Place Names & Roads
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapInstanceRef.current = map

    // Fix map container size on render
    setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Center & Zoom when center changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true })
    }
  }, [center, zoom])

  // Update Markers and Radius
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    const markersLayer = markersLayerRef.current
    markersLayer.clearLayers()

    // 1. Customer Location Marker (Blue Ring with Pulse)
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 10;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    const customerMarker = L.marker([customerLocation.latitude, customerLocation.longitude], {
      icon: customerIcon,
      zIndexOffset: 1000,
    })

    customerMarker.bindPopup(`
      <div style="font-family: var(--font-tiro-bangla), sans-serif; text-align: center; padding: 4px;">
        <b style="color: #2563EB; font-size: 13px;">📍 আপনার অবস্থান</b>
        <p style="font-size: 11px; color: #475569; margin-top: 2px;">${customerLocation.address || 'ঠাকুরগাঁও সদর'}</p>
      </div>
    `)
    markersLayer.addLayer(customerMarker)

    // 2. Service Radius Circle (if enabled)
    if (showRadius && radiusKm > 0) {
      const radiusCircle = L.circle([customerLocation.latitude, customerLocation.longitude], {
        radius: radiusKm * 1000, // convert km to meters
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6, 6',
      })
      markersLayer.addLayer(radiusCircle)
    }

    // 3. Mistri Pins on Map
    mistris.forEach((m, idx) => {
      // Calculate realistic local offsets around customer if no exact GPS provided
      const offsetLat =
        m.latitude ?? customerLocation.latitude + ((idx % 2 === 0 ? 1 : -1) * (0.005 + idx * 0.004))
      const offsetLng =
        m.longitude ?? customerLocation.longitude + ((idx % 3 === 0 ? 1 : -1) * (0.006 + idx * 0.005))

      const mistriIcon = L.divIcon({
        className: 'custom-mistri-pin',
        html: `
          <div style="
            background: #F59E0B;
            color: #0F172A;
            width: 38px;
            height: 38px;
            border-radius: 12px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            🔧
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      })

      const marker = L.marker([offsetLat, offsetLng], { icon: mistriIcon })

      const popupHtml = `
        <div style="font-family: var(--font-tiro-bangla), sans-serif; min-width: 170px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="font-weight: bold; font-size: 13px; color: #0F172A;">${m.name_bn}</div>
          </div>
          <div style="font-size: 11px; color: #2563EB; font-weight: 600; margin-bottom: 2px;">
            ${m.category_name_bn}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 8px;">
            <span>★ ${m.rating_avg}</span>
            <span style="color: #059669; font-weight: bold;">${formatDistance(m.distance_km, true)} দূরে</span>
          </div>
          <a href="/mistri/${m.id}" style="
            display: block;
            text-align: center;
            background: #2563EB;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            padding: 6px 12px;
            border-radius: 8px;
            text-decoration: none;
          ">প্রোফাইল ও বুকিং</a>
        </div>
      `

      marker.bindPopup(popupHtml)
      markersLayer.addLayer(marker)
    })
  }, [customerLocation, mistris, showRadius, radiusKm])

  return (
    <div
      style={{ height }}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-10"
    >
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}
