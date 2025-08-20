import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary hover:bg-primary-dark text-primary-foreground shadow-soft hover:shadow-brand': variant === 'primary',
            'bg-secondary hover:bg-secondary/90 text-secondary-foreground': variant === 'secondary',
            'bg-accent hover:bg-accent/90 text-accent-foreground': variant === 'accent',
            'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground': variant === 'outline',
            'hover:bg-gray-50 text-gray-600 hover:text-gray-800': variant === 'ghost',
          },
          {
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-6 py-3': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }