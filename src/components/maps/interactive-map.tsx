'use client'

import React, { useState } from 'react'
import { MapPin, Navigation, ZoomIn, ZoomOut, Compass, Wrench, Shield } from 'lucide-react'
import { Coordinates } from '@/lib/geo'
import { formatBDT, formatDistance, toBanglaNumber } from '@/lib/utils'

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
  height = '360px',
  showRadiusCircle = false,
  radiusKm = 10,
  isLiveTracking = false,
  className = '',
}: InteractiveMapProps) {
  const [zoomLevel, setZoomLevel] = useState(14)

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-md ${className}`}
    >
      {/* Map Grid Pattern Background */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      {/* Simulated Town Roads & Geography lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/40" xmlns="http://www.w3.org/2000/svg">
        <line x1="10%" y1="20%" x2="90%" y2="80%" strokeWidth="3" />
        <line x1="20%" y1="90%" x2="80%" y2="10%" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="50%" y1="0%" x2="50%" y2="100%" strokeWidth="4" />
        <line x1="0%" y1="50%" x2="100%" y2="50%" strokeWidth="3" />
      </svg>

      {/* Radius Coverage Circle (if enabled) */}
      {showRadiusCircle && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-dashed border-blue-400/40 bg-blue-500/10 pointer-events-none animate-pulse"></div>
      )}

      {/* Dashed Connecting Line between Customer and Mistri */}
      {mistriLocation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="50%"
            y1="50%"
            x2="35%"
            y2="30%"
            stroke="#2563EB"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Customer Location Pin (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        <div className="relative">
          <div className="h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-500/40 animate-ping"></div>
          <div className="absolute inset-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
        </div>
        <div className="mt-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700 shadow-xl whitespace-nowrap">
          📍 {customerAddress}
        </div>
      </div>

      {/* Mistri Moving Pin (if en route) */}
      {mistriLocation && (
        <div 
          style={{ top: '30%', left: '35%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center transition-all duration-1000 ease-in-out cursor-pointer group"
        >
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-xl font-bold ring-4 ring-amber-400/30 transition-transform group-hover:scale-110">
              <Wrench className="h-5 w-5" />
            </div>
            {isLiveTracking && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
            )}
          </div>
          <div className="mt-1.5 bg-white text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 shadow-xl whitespace-nowrap">
            👷‍♂️ {mistriName || 'মিস্ত্রী অন-রুট'}
          </div>
        </div>
      )}

      {/* Map Controls (Zoom & Center Reset) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/90 text-white hover:bg-slate-700 border border-slate-700 shadow-md"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 1, 8))}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/90 text-white hover:bg-slate-700 border border-slate-700 shadow-md"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Info Pill */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
        <Compass className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
        <span>GPS: {customerLocation.latitude.toFixed(4)}, {customerLocation.longitude.toFixed(4)}</span>
      </div>
    </div>
  )
}
