'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { data: session } = useSession()
  
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-3xl' }
  }

  const currentSize = sizes[size]

  const getLogoDestination = () => {
    if (!session?.user) {
      return '/'
    }
    
    return session.user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'
  }

  return (
    <Link 
      href={getLogoDestination()}
      className={cn(
        'flex items-center gap-3 hover:opacity-80 transition-opacity',
        className
      )}
    >
      {/* Friendly Character Icon */}
      <div 
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-soft"
        style={{ 
          width: currentSize.icon, 
          height: currentSize.icon 
        }}
      >
        {/* Character Face */}
        <svg 
          width={currentSize.icon * 0.7} 
          height={currentSize.icon * 0.7} 
          viewBox="0 0 24 24" 
          fill="none"
          className="text-white"
        >
          {/* Pencil/Pen Character */}
          <g>
            {/* Pencil Body */}
            <rect x="8" y="2" width="8" height="16" rx="4" fill="currentColor" opacity="0.9"/>
            
            {/* Pencil Tip */}
            <path d="M10 18 L12 22 L14 18 Z" fill="currentColor" opacity="0.7"/>
            
            {/* Eyes */}
            <circle cx="10.5" cy="7" r="1.2" fill="#2E5A8A"/>
            <circle cx="13.5" cy="7" r="1.2" fill="#2E5A8A"/>
            
            {/* Eye highlights */}
            <circle cx="10.8" cy="6.7" r="0.4" fill="white"/>
            <circle cx="13.8" cy="6.7" r="0.4" fill="white"/>
            
            {/* Smile */}
            <path 
              d="M10 10 Q12 12 14 10" 
              stroke="#2E5A8A" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              fill="none"
            />
            
            {/* Pencil Band */}
            <rect x="8" y="12" width="8" height="1.5" fill="#7BA05B"/>
          </g>
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold text-gray-800 ${currentSize.text}`}>
            Write on English
          </span>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            ESL Classroom
          </span>
        </div>
      )}
    </Link>
  )
}

interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 32, className = '' }: LogoMarkProps) {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-soft ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.7} 
        height={size * 0.7} 
        viewBox="0 0 24 24" 
        fill="none"
        className="text-white"
      >
        <g>
          <rect x="8" y="2" width="8" height="16" rx="4" fill="currentColor" opacity="0.9"/>
          <path d="M10 18 L12 22 L14 18 Z" fill="currentColor" opacity="0.7"/>
          <circle cx="10.5" cy="7" r="1.2" fill="#2E5A8A"/>
          <circle cx="13.5" cy="7" r="1.2" fill="#2E5A8A"/>
          <circle cx="10.8" cy="6.7" r="0.4" fill="white"/>
          <circle cx="13.8" cy="6.7" r="0.4" fill="white"/>
          <path 
            d="M10 10 Q12 12 14 10" 
            stroke="#2E5A8A" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
          />
          <rect x="8" y="12" width="8" height="1.5" fill="#7BA05B"/>
        </g>
      </svg>
    </div>
  )
}