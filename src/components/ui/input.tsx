import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-bold text-slate-800 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'skeuo-input-well block w-full py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-150',
              leftIcon && 'pl-10',
              error && 'border-red-600 focus:border-red-600',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
