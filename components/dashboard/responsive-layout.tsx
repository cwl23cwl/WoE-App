'use client'

import { useState, useEffect } from 'react'
import { SidebarNav } from './sidebar-nav'
import { UserMenu } from './user-menu'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  pendingSubmissions?: number
  totalClasses?: number
  totalStudents?: number
}

export function ResponsiveLayout({ 
  children, 
  pendingSubmissions = 0,
  totalClasses = 0,
  totalStudents = 0 
}: ResponsiveLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white shadow-sm border-b md:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2"
              >
                ☰
              </Button>
              <Logo />
            </div>
            <UserMenu />
          </div>
        </header>
      )}

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobile && isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile 
            ? `fixed top-0 left-0 z-50 h-full transform transition-transform ${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'relative'
          }
        `}>
          <SidebarNav
            isCollapsed={isMobile ? false : isSidebarCollapsed}
            onToggle={toggleSidebar}
            pendingSubmissions={pendingSubmissions}
            totalClasses={totalClasses}
            totalStudents={totalStudents}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          {!isMobile && (
            <header className="bg-white shadow-sm border-b">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {isSidebarCollapsed && <Logo />}
                </div>
                <UserMenu />
              </div>
            </header>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation Backdrop */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  )
}