import React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all', className)}
      {...props}
    >
      {children}
    </div>
  )
}

