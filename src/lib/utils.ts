import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const banglaDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
}

export function toBanglaNumber(value: number | string): string {
  const str = String(value)
  return str.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit)
}

export function formatBDT(amount: number | null | undefined, isBengali = true): string {
  if (amount === null || amount === undefined) return 'আলোচনা সাপেক্ষে'
  const formattedNumber = new Intl.NumberFormat('en-IN').format(amount)
  if (isBengali) {
    return `৳${toBanglaNumber(formattedNumber)}`
  }
  return `৳${formattedNumber}`
}

export function formatDistance(distanceKm: number, isBengali = true): string {
  const formatted = distanceKm.toFixed(1)
  if (isBengali) {
    return `${toBanglaNumber(formatted)} কিমি`
  }
  return `${formatted} km`
}

