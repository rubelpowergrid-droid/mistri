'use client'

import React, { useState } from 'react'
import { MapPin, X, Check, Crosshair } from 'lucide-react'
import { Coordinates, DEFAULT_DISTRICT_COORDINATES } from '@/lib/geo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/locales'

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
  const [address, setAddress] = useState(initialAddress || 'বাসস্ট্যান্ড রোড, ঠাকুরগাঁও সদর')

  if (!isOpen) return null

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          setAddress('আপনার চিহ্নিত জিপিএস ঠিকানা')
        },
        () => {}
      )
    }
  }

  const handleSave = () => {
    onConfirm(coords, address)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-4 shadow-2xl bg-white border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>{isBn ? 'কাজের সঠিক অবস্থান নির্বাচন করুন' : 'Pick Job Location on Map'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Address Input */}
        <Input
          id="pickerAddress"
          label={isBn ? 'ঠিকানা বিবরণ' : 'Address Description'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={isBn ? 'রোড নম্বর, বাড়ি বা ল্যান্ডমার্ক...' : 'Road number, house or landmark...'}
        />

        {/* Interactive Pin-Drop Map Simulation */}
        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = (e.clientY - rect.top) / rect.height
            setCoords({
              latitude: Number((26.0336 + (y - 0.5) * 0.02).toFixed(6)),
              longitude: Number((88.4617 + (x - 0.5) * 0.02).toFixed(6)),
            })
          }}
          className="relative h-60 w-full rounded-2xl bg-slate-900 overflow-hidden cursor-crosshair border border-slate-700"
        >
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

          {/* Draggable/Target Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center pointer-events-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-blue-500/30">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="h-2 w-2 rounded-full bg-slate-900 mt-0.5"></div>
          </div>

          {/* Quick Recenter GPS Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleRecenter()
            }}
            className="absolute top-3 right-3 z-30 p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-md"
            title="বর্তমান অবস্থান পান"
          >
            <Crosshair className="h-4 w-4 text-blue-400" />
          </button>

          <div className="absolute bottom-2 left-2 z-30 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300">
            {isBn ? 'ম্যাপে ক্লিক করে পিনের অবস্থান নির্ধারণ করুন' : 'Click map to place pin'}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
          <span>Lat: {coords.latitude}, Lng: {coords.longitude}</span>
          <span className="text-blue-600 font-bold">{isBn ? 'সঠিক পিন' : 'Pinned'}</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button size="sm" onClick={handleSave} className="font-bold">
            <Check className="h-4 w-4 mr-1" />
            <span>{isBn ? 'অবস্থান নিশ্চিত করুন' : 'Confirm Location'}</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
