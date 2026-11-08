import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-b from-stone-800 to-black text-white border-stone-700 border-t-white/20 shadow-xs',
    neutral: 'bg-gradient-to-b from-white to-slate-100 text-slate-900 border-slate-300 border-t-white shadow-xs',
    success: 'bg-gradient-to-b from-zinc-50 to-zinc-150 text-zinc-950 border-zinc-300 font-bold shadow-xs',
    warning: 'bg-gradient-to-b from-stone-50 to-stone-150 text-stone-900 border-stone-300 shadow-xs font-semibold',
    danger: 'bg-gradient-to-b from-stone-50 to-stone-150 text-red-900 border-red-200 shadow-xs font-semibold',
  }

  return (
    <span
      className={cn(
        'skeuo-pill inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold transition-all',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
