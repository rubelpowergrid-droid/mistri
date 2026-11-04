'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Coordinates } from '@/lib/geo'
import { formatDistance } from '@/lib/utils'

interface InteractiveMapProps {
  customerLocation: Coordinates
  customerAddress?: string
  mistriLocation?: Coordinates | null
  mistriName?: string
  mistriCategory?: string
  height?: string
  showRadiusCircle?: boolean
  radiusKm?: number
  isLiveTracking?: boolean
  className?: string
}

export function InteractiveMap({
  customerLocation,
  customerAddress = 'আপনার কাজের অবস্থান',
  mistriLocation,
  mistriName,
  mistriCategory,
  height = '420px',
  showRadiusCircle = false,
  radiusKm = 10,
  isLiveTracking = false,
  className = '',
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersGroupRef = useRef<L.LayerGroup | null>(null)

  // Initialize Leaflet Map with Real OpenStreetMap Layer
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [customerLocation.latitude, customerLocation.longitude],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    // Real OpenStreetMap Standard Tile Layer with Place & Road Names in Bengali & English
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map)

    const layersGroup = L.layerGroup().addTo(map)
    layersGroupRef.current = layersGroup
    mapInstanceRef.current = map

    setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Dynamic Markers (Customer, Mistri, Route Polyline, Radius Circle)
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return

    const layersGroup = layersGroupRef.current
    layersGroup.clearLayers()

    // 1. Customer Marker (Pulsing Blue Ring)
    const customerIcon = L.divIcon({
      className: 'custom-customer-node',
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
        <p style="font-size: 11px; color: #475569; margin-top: 2px;">${customerAddress}</p>
      </div>
    `)
    layersGroup.addLayer(customerMarker)

    // 2. Coverage Radius Circle
    if (showRadiusCircle && radiusKm > 0) {
      const radiusCircle = L.circle([customerLocation.latitude, customerLocation.longitude], {
        radius: radiusKm * 1000,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6, 6',
      })
      layersGroup.addLayer(radiusCircle)
    }

    // 3. Mistri Moving Marker & Route Line
    if (mistriLocation) {
      const mistriIcon = L.divIcon({
        className: 'custom-mistri-node',
        html: `
          <div style="
            background: #F59E0B;
            color: #0F172A;
            width: 40px;
            height: 40px;
            border-radius: 14px;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            position: relative;
          ">
            🔧
            ${
              isLiveTracking
                ? '<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 2px solid #FFFFFF;"></span>'
                : ''
            }
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      })

      const mistriMarker = L.marker([mistriLocation.latitude, mistriLocation.longitude], {
        icon: mistriIcon,
      })

      mistriMarker.bindPopup(`
        <div style="font-family: var(--font-tiro-bangla), sans-serif; min-width: 160px; padding: 4px;">
          <div style="font-weight: bold; font-size: 13px; color: #0F172A;">👷‍♂️ ${mistriName || 'মিস্ত্রী'}</div>
          <div style="font-size: 11px; color: #2563EB; font-weight: 600;">${mistriCategory || 'অন-রুট সেবা'}</div>
          <div style="font-size: 10px; color: #10B981; font-weight: bold; margin-top: 4px;">● লাইভ জিপিএস সক্রিয়</div>
        </div>
      `)
      layersGroup.addLayer(mistriMarker)

      // Polyline Route connecting Mistri to Customer
      const routePolyline = L.polyline(
        [
          [mistriLocation.latitude, mistriLocation.longitude],
          [customerLocation.latitude, customerLocation.longitude],
        ],
        {
          color: '#2563EB',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }
      )
      layersGroup.addLayer(routePolyline)

      // Fit bounds to keep both in view
      const bounds = L.latLngBounds([
        [customerLocation.latitude, customerLocation.longitude],
        [mistriLocation.latitude, mistriLocation.longitude],
      ])
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [customerLocation, customerAddress, mistriLocation, mistriName, mistriCategory, showRadiusCircle, radiusKm, isLiveTracking])

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-10 ${className}`}
    >
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}
