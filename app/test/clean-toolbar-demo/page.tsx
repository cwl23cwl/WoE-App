'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedWorkspaceTopbar } from '@/components/workspace/EnhancedWorkspaceTopbar'
import { useWorkspaceStore } from '@/stores/workspace'

export default function CleanToolbarDemo() {
  const router = useRouter()
  const { setRole, role, pages, setPages } = useWorkspaceStore()

  // Initialize with sample pages if empty
  if (pages.length === 0) {
    setPages([
      { id: '1', scene: { elements: [], appState: { viewBackgroundColor: '#ffffff' } } }
    ])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* This is what the final toolbar will look like */}
      <EnhancedWorkspaceTopbar
        onBack={() => router.back()}
      />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>✨ Final Production Toolbar Preview</CardTitle>
            <p className="text-gray-600">
              The toolbar above is how it will look in your actual workspace - clean, integrated, and functional.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Role:</span>
              <div className="flex space-x-2">
                <Button 
                  variant={role === 'STUDENT' ? 'primary' : 'outline'} 
                  size="sm"
                  onClick={() => setRole('STUDENT')}
                >
                  Student
                </Button>
                <Button 
                  variant={role === 'TEACHER' ? 'primary' : 'outline'} 
                  size="sm"
                  onClick={() => setRole('TEACHER')}
                >
                  Teacher
                </Button>
              </div>
            </div>

            <div className="text-sm space-y-2 text-gray-600">
              <p><strong>👆 Try switching roles above</strong> - notice how the toolbar styling changes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Student mode:</strong> Solid borders, simpler colors</li>
                <li><strong>Teacher mode:</strong> Dashed borders, more advanced options</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Key Features Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Design & UX</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✅ Modern Lucide icons (Pen, Highlighter, Type, etc.)</li>
                  <li>✅ Large 48px touch targets</li>
                  <li>✅ ESL-friendly plain English labels</li>
                  <li>✅ Smooth hover/active animations</li>
                  <li>✅ Clean shadcn/ui Card styling</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">Functionality</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✅ Interactive color picker with ESL colors</li>
                  <li>✅ Visual thickness slider with live preview</li>
                  <li>✅ Role-based styling (Teacher vs Student)</li>
                  <li>✅ Full Excalidraw integration</li>
                  <li>✅ Responsive layouts (top/left/floating)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🚀 How to Use in Your App</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm font-mono mb-2">Replace your current WorkspaceTopbar with:</p>
              <code className="text-sm bg-white p-2 rounded block">
                {`<EnhancedWorkspaceTopbar 
  excalidrawRef={canvasRef}
  onBack={() => router.back()}
/>`}
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              That's it! The enhanced toolbar will automatically show the modern design with all the ESL-friendly features.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎨 What Students Will See</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500 py-8">
                <p className="mb-2">👆 The toolbar above shows exactly what students will see:</p>
                <ul className="text-sm space-y-1">
                  <li>• "Draw" instead of "Freedraw"</li>
                  <li>• "Highlight" for the highlighter tool</li>
                  <li>• Large, easy-to-tap buttons</li>
                  <li>• Simple color picker with 6-8 colors</li>
                  <li>• Visual feedback for thickness</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            🎉 Modern Toolbar Implementation Complete - Ready for Production!
          </p>
        </div>
      </div>
    </div>
  )
}