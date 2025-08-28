'use client'

import { signOut } from 'next-auth/react'
import { Button } from './Button'

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  className?: string
}

export function LogoutButton({ variant = 'outline', className }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={className}
    >
      Sign Out
    </Button>
  )
}