'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, X, Check } from 'lucide-react'
import { Coordinates, DEFAULT_DISTRICT_COORDINATES } from '@/lib/geo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/locales'

// Dynamic import with SSR disabled to prevent Leaflet window errors
const OsmLocationPicker = dynamic(
  () => import('@/components/maps/osm-location-picker').then((mod) => mod.OsmLocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full bg-slate-100 animate-pulse rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400 border border-slate-200">
        <MapPin className="h-6 w-6 text-slate-300 animate-bounce mb-2" />
        <span>ওপেনস্ট্রিটম্যাপ লোড হচ্ছে...</span>
      </div>
    ),
  }
)

interface LocationPickerModalProps {
  isOpen: boolean
  onClose: () => void
  initialCoordinates?: Coordinates
  initialAddress?: string
  onConfirm: (coords: Coordinates, address: string) => void
}

export function LocationPickerModal({
  isOpen,
  onClose,
  initialCoordinates = DEFAULT_DISTRICT_COORDINATES.thakurgaon,
  initialAddress = '',
  onConfirm,
}: LocationPickerModalProps) {
  const { lang } = useI18n()
  const isBn = lang === 'bn'

  const [coords, setCoords] = useState<Coordinates>(initialCoordinates)
  const [address, setAddress] = useState(initialAddress || 'বাড়ি নং ১২, পূর্ব হাজীপাড়া, ঠাকুরগাঁও সদর')

  if (!isOpen) return null

  const handleSave = () => {
    onConfirm(coords, address)
    onClose()
  }

  const quickJump = (lat: number, lng: number, placeName: string) => {
    setCoords({ latitude: lat, longitude: lng })
    setAddress(placeName)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl bg-white border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="block leading-tight">{isBn ? 'কাজের সঠিক অবস্থান নির্বাচন করুন' : 'Pick Job Location on Map'}</span>
              <span className="text-[11px] font-normal text-slate-500">ম্যাপে ক্লিক করে বা পিন টেনে বাড়ি/দোকান চিহ্নিত করুন</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Area Jump Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">দ্রুত যান:</span>
          <button
            type="button"
            onClick={() => quickJump(26.0336, 88.4617, 'হাজীপাড়া, ঠাকুরগাঁও সদর')}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors border border-slate-200"
          >
            ঠাকুরগাঁও সদর
          </button>
          <button
            type="button"
            onClick={() => quickJump(25.8547, 88.3587, 'পীরগঞ্জ বাজার, ঠাকুরগাঁও')}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors border border-slate-200"
          >
            পীরগঞ্জ
          </button>
          <button
            type="button"
            onClick={() => quickJump(26.3354, 88.5517, 'পঞ্চগড় বাজার')}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors border border-slate-200"
          >
            পঞ্চগড়
          </button>
          <button
            type="button"
            onClick={() => quickJump(25.6279, 88.6332, 'দিনাজপুর সদর')}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors border border-slate-200"
          >
            দিনাজপুর
          </button>
        </div>

        {/* Real OpenStreetMap Tile View */}
        <OsmLocationPicker
          latitude={coords.latitude}
          longitude={coords.longitude}
          onChange={(newLat, newLng) => {
            setCoords({ latitude: newLat, longitude: newLng })
          }}
          height="280px"
        />

        {/* Address Input */}
        <Input
          id="pickerAddress"
          label={isBn ? 'সঠিক ঠিকানা বা বাড়ি নম্বর' : 'Address Description'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={isBn ? 'বাড়ি বা দোকান নম্বর, রোড, পাড়া/মহল্লা...' : 'House/shop number, road, area...'}
        />

        {/* Coordinates Pill */}
        <div className="text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
          <span>জিপিএস পিন: <strong className="font-mono text-slate-800">{coords.latitude}, {coords.longitude}</strong></span>
          <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-md">✓ পিন নিশ্চিত</span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button size="sm" onClick={handleSave} className="font-bold px-4">
            <Check className="h-4 w-4 mr-1" />
            <span>{isBn ? 'অবস্থান নিশ্চিত করুন' : 'Confirm Location'}</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
