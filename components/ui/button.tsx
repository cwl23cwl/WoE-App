// components/ui/button.tsx - Basic button component

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg', 
    lg: 'px-6 py-3 text-lg rounded-lg'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// components/ui/separator.tsx - Separator component
interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Separator({ orientation = 'horizontal', className = '' }: SeparatorProps) {
  return (
    <div
      className={`bg-gray-200 ${
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
      } ${className}`}
    />
  )
}

// components/ui/label.tsx - Label component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}

// components/ui/Input.tsx - Input component  
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

// components/ui/textarea.tsx - Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

// components/ui/select.tsx - Select components
import { useState, createContext, useContext } from 'react'

const SelectContext = createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export function Select({ 
  children, 
  value, 
  onValueChange 
}: { 
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void 
}) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      {children}
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { value } = useContext(SelectContext)
  
  return (
    <button 
      className={`px-3 py-2 border border-gray-300 rounded-md bg-white text-left ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="absolute z-50 bg-white border rounded-md shadow-lg">{children}</div>
}

export function SelectItem({ 
  value, 
  children 
}: { 
  value: string
  children: React.ReactNode 
}) {
  const { onValueChange } = useContext(SelectContext)
  
  return (
    <button 
      className="w-full px-3 py-2 text-left hover:bg-gray-100"
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  )
}

// components/ui/popover.tsx - Popover components
export function Popover({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}

export function PopoverTrigger({ 
  children, 
  asChild 
}: { 
  children: React.ReactNode
  asChild?: boolean 
}) {
  return <div>{children}</div>
}

export function PopoverContent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`absolute z-50 bg-white border rounded-lg shadow-lg p-4 ${className}`}>
      {children}
    </div>
  )
}

// components/ui/slider.tsx - Slider component
interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step: number
  className?: string
}

export function Slider({ 
  value, 
  onValueChange, 
  min, 
  max, 
  step, 
  className = '' 
}: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full ${className}`}
    />
  )
}