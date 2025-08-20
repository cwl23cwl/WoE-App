'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/ui/logout-button'

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
          alt={user.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
          unoptimized={true}
        />
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
        </div>
        <span className="text-gray-400">
          {isOpen ? '↑' : '↓'}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Image
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
                unoptimized={true}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <p className="text-xs text-gray-400 capitalize mt-1">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">👤</span>
                Profile Settings
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">🔔</span>
                Notifications
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">⚙️</span>
                Account Settings
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">🎨</span>
                Appearance
              </Button>
              
              <hr className="my-2" />
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">❓</span>
                Help & Support
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">📖</span>
                Documentation
              </Button>
              
              <hr className="my-2" />
              
              <div className="px-2">
                <LogoutButton className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}