import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight select-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
      md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
      lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl',
    }

    const variantStyles = {
      primary: 'skeuo-btn-dark',
      secondary: 'skeuo-btn-light',
      outline: 'skeuo-btn-light border-slate-300',
      ghost: 'hover:bg-slate-200/80 text-slate-800 rounded-xl active:bg-slate-300',
      danger: 'bg-gradient-to-b from-stone-900 via-neutral-900 to-black text-white border border-stone-800 border-t-red-500/50 border-b-black shadow-md hover:from-red-950 active:translate-y-0.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
