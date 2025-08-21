'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ModernToolbar } from '@/components/workspace/ModernToolbar'
import { EnhancedWorkspaceTopbar } from '@/components/workspace/EnhancedWorkspaceTopbar'
import { ExcalidrawCanvasFixed } from '@/components/workspace/ExcalidrawCanvasFixed'
import { useWorkspaceStore } from '@/stores/workspace'
import { useRouter } from 'next/navigation'

export default function ModernToolbarTestPage() {
  const router = useRouter()
  const excalidrawRef = useRef<any>(null)
  const { setRole, role, pages, setPages } = useWorkspaceStore()
  const [placement, setPlacement] = useState<'top' | 'left' | 'floating'>('top')

  // Initialize with sample pages if empty
  if (pages.length === 0) {
    setPages([
      { id: '1', scene: { elements: [], appState: { viewBackgroundColor: '#ffffff' } } },
      { id: '2', scene: { elements: [], appState: { viewBackgroundColor: '#ffffff' } } }
    ])
  }

  const toggleRole = () => {
    setRole(role === 'TEACHER' ? 'STUDENT' : 'TEACHER')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Topbar */}
      <EnhancedWorkspaceTopbar
        onBack={() => router.back()}
        excalidrawRef={excalidrawRef}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Modern Toolbar Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button onClick={toggleRole} variant="outline">
                Switch to {role === 'TEACHER' ? 'Student' : 'Teacher'} Mode
              </Button>
              <span className="text-sm text-gray-600">
                Current Role: <span className="font-medium">{role}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Toolbar Placement:</span>
              {(['top', 'left', 'floating'] as const).map((pos) => (
                <Button
                  key={pos}
                  variant={placement === pos ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPlacement(pos)}
                  className="capitalize"
                >
                  {pos}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toolbar Showcase */}
        <div className="grid gap-6">
          {/* Canvas with Different Toolbar Placements */}
          <Card>
            <CardHeader>
              <CardTitle>Canvas with {placement} Toolbar</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className={`relative ${placement === 'left' ? 'flex' : ''}`}>
                {/* Left Toolbar */}
                {placement === 'left' && (
                  <div className="mr-4 flex-shrink-0">
                    <ModernToolbar
                      placement="left"
                      isTeacher={role === 'TEACHER'}
                      className="sticky top-4"
                    />
                  </div>
                )}

                {/* Canvas */}
                <div className="flex-1 relative">
                  {/* Top Toolbar */}
                  {placement === 'top' && (
                    <div className="mb-4">
                      <ModernToolbar
                        placement="top"
                        isTeacher={role === 'TEACHER'}
                      />
                    </div>
                  )}

                  {/* Canvas Area */}
                  <div className="h-96 border-2 border-dashed border-gray-300 rounded-xl bg-white relative">
                    <ExcalidrawCanvasFixed className="rounded-xl" />
                    
                    {/* Floating Toolbar */}
                    {placement === 'floating' && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <ModernToolbar
                          placement="floating"
                          isTeacher={role === 'TEACHER'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Modern Lucide Icons</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Large Hit Targets (48px)</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ESL-Friendly Labels</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Role-Based Styling</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hover/Active States</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Functionality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Thickness Slider</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Color Picker Swatches</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tool Integration</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Responsive Layout</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Accessibility</span>
                <span className="text-green-600 text-xs">✓ Implemented</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}