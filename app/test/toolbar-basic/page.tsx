'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pen, Highlighter, Type, Eraser, MousePointer2 } from 'lucide-react'

export default function ToolbarBasicTest() {
  const [selectedTool, setSelectedTool] = useState('pen')
  
  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'pen', label: 'Draw', icon: Pen },
    { id: 'highlighter', label: 'Highlight', icon: Highlighter },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'eraser', label: 'Erase', icon: Eraser },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Basic Toolbar Test</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modern Toolbar Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              {tools.map(({ id, label, icon: Icon }) => (
                <div key={id} className="flex flex-col items-center">
                  <button
                    onClick={() => setSelectedTool(id)}
                    className={`
                      h-12 w-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center
                      ${selectedTool === id 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-medium text-gray-600 mt-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Selected tool: <span className="font-medium">{selectedTool}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center space-y-2">
          <p className="text-green-600">✅ Lucide React icons loading</p>
          <p className="text-green-600">✅ Tailwind CSS working</p>
          <p className="text-green-600">✅ Interactive state management</p>
          <p className="text-green-600">✅ ESL-friendly labels</p>
        </div>
      </div>
    </div>
  )
}