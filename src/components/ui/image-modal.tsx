'use client'

import React, { useEffect } from 'react'
import { X, ZoomIn, ShieldCheck } from 'lucide-react'

export interface ImageModalData {
  src: string
  title?: string
  subtitle?: string
  alt?: string
}

interface ImageModalProps {
  isOpen: boolean
  data: ImageModalData | null
  onClose: () => void
}

export function ImageModal({ isOpen, data, onClose }: ImageModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !data?.src) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full max-h-[92vh] flex flex-col items-center bg-stone-950/95 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden cursor-default animate-in zoom-in-95 duration-200 text-white"
      >
        {/* Header with Title and Close Button */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-[240px] sm:max-w-xs">
                {data.title || 'মিস্ত্রী কারিগর প্রোফাইল ছবি'}
              </h3>
              {data.subtitle && (
                <p className="text-[11px] text-stone-400 truncate max-w-[240px] sm:max-w-xs">
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Large Image Container */}
        <div className="relative w-full flex items-center justify-center py-3">
          <img
            src={data.src}
            alt={data.alt || data.title || 'Mistri Image'}
            className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-stone-800"
          />
        </div>

        {/* Bottom Helper Hint */}
        <p className="text-[11px] text-stone-400 pt-1 flex items-center gap-1.5">
          <ZoomIn className="h-3.5 w-3.5 text-stone-400" />
          <span>বন্ধ করতে বাইরে চাপুন অথবা ✕ বাটনে চাপ দিন</span>
        </p>
      </div>
    </div>
  )
}
