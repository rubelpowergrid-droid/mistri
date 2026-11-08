import React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'skeuo-surface p-5 text-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
