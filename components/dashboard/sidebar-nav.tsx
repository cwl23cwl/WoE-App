'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  isActive?: boolean
}

interface SidebarNavProps {
  isCollapsed?: boolean
  onToggle?: () => void
  pendingSubmissions?: number
  totalClasses?: number
  totalStudents?: number
}

export function SidebarNav({ 
  isCollapsed = false, 
  onToggle, 
  pendingSubmissions = 0,
  totalClasses = 0,
  totalStudents = 0 
}: SidebarNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/teacher/dashboard',
      icon: '🏠',
      isActive: pathname === '/teacher/dashboard'
    },
    {
      label: 'Classes',
      href: '/dashboard/classes',
      icon: '📚',
      badge: totalClasses,
      isActive: pathname.startsWith('/dashboard/classes')
    },
    {
      label: 'Students',
      href: '/dashboard/students',
      icon: '👥',
      badge: totalStudents,
      isActive: pathname.startsWith('/dashboard/students')
    },
    {
      label: 'Assignments',
      href: '/dashboard/assignments',
      icon: '📝',
      badge: pendingSubmissions,
      isActive: pathname.startsWith('/dashboard/assignments')
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: '📅',
      isActive: pathname.startsWith('/dashboard/calendar')
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: '📊',
      isActive: pathname.startsWith('/dashboard/analytics')
    }
  ]

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">Teacher Dashboard</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? '→' : '←'}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href as any}>
              <div className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${item.isActive 
                  ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge 
                        variant={item.isActive ? "primary" : "secondary"}
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span className="mr-2">⚙️</span>
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span className="mr-2">❓</span>
                Help & Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}