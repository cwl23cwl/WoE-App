import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={clsx(
          'w-full px-4 py-3 rounded-lg border bg-gray-50 text-gray-800 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          error 
            ? 'border-error focus:border-error focus:ring-error/20' 
            : 'border-gray-100 focus:border-primary focus:ring-primary/20',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }