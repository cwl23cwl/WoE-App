'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => ({ default: mod.Excalidraw })),
  { ssr: false }
);

export default function CanvasSmokeTest() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<string>('selection');
  const [strokeWidth, setStrokeWidth] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(20);

  const handleToolChange = (toolType: string) => {
    if (excalidrawAPI) {
      console.log('🔧 Setting active tool to:', toolType);
      try {
        // Map highlighter to freedraw
        const actualTool = toolType === 'highlighter' ? 'freedraw' : toolType;
        
        // Update the tool
        excalidrawAPI.setActiveTool({ type: actualTool });
        
        // Also update app state for better tool switching
        const currentAppState = excalidrawAPI.getAppState();
        const toolSettings = getToolSettings(toolType);
        
        excalidrawAPI.updateScene({
          appState: {
            ...currentAppState,
            activeTool: { type: actualTool },
            currentItemStrokeWidth: strokeWidth,
            currentItemFontSize: fontSize,
            ...toolSettings,
          }
        });
        
        console.log('✅ setActiveTool completed successfully');
        setActiveTool(toolType);
      } catch (error) {
        console.error('❌ setActiveTool error:', error);
      }
    } else {
      console.warn('⚠️ excalidrawAPI not available yet');
    }
  };

  const getToolSettings = (toolType: string) => {
    switch (toolType) {
      case 'highlighter':
        return {
          currentItemStrokeColor: '#ffff00',
          currentItemBackgroundColor: 'transparent',
          currentItemOpacity: 60,
          currentItemRoughness: 0,
        };
      case 'freedraw':
        return {
          currentItemStrokeColor: '#000000',
          currentItemBackgroundColor: 'transparent',
          currentItemOpacity: 100,
          currentItemRoughness: 1,
        };
      case 'text':
        return {
          currentItemStrokeColor: '#000000',
          currentItemBackgroundColor: 'transparent',
          currentItemOpacity: 100,
        };
      default:
        return {
          currentItemStrokeColor: '#000000',
          currentItemBackgroundColor: 'transparent',
          currentItemOpacity: 100,
          currentItemRoughness: 1,
        };
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setStrokeWidth(newWidth);
    if (excalidrawAPI) {
      const currentAppState = excalidrawAPI.getAppState();
      excalidrawAPI.updateScene({
        appState: {
          ...currentAppState,
          currentItemStrokeWidth: newWidth,
        }
      });
      
      // Also update selected elements
      const selectedElements = excalidrawAPI.getSceneElements().filter((el: any) => el.isSelected);
      if (selectedElements.length > 0) {
        const updatedElements = excalidrawAPI.getSceneElements().map((el: any) => {
          if (el.isSelected) {
            return { ...el, strokeWidth: newWidth };
          }
          return el;
        });
        excalidrawAPI.updateScene({ elements: updatedElements });
      }
    }
  };

  const handleExcalidrawAPIReady = (api: any) => {
    console.log('🚀 Excalidraw API ready:', api);
    setExcalidrawAPI(api);
    
    // Initialize with proper app state defaults
    try {
      api.updateScene({ 
        appState: { 
          viewBackgroundColor: '#ffffff',
          // Set initial drawing defaults
          currentItemStrokeColor: '#000000',
          currentItemBackgroundColor: 'transparent',
          currentItemStrokeWidth: 1,
          currentItemRoughness: 1,
          currentItemOpacity: 100,
          // Ensure editor is editable
          viewModeEnabled: false,
          zenModeEnabled: false,
        } 
      });
      console.log('✅ Initial app state set successfully');
    } catch (error) {
      console.error('❌ updateScene error:', error);
    }
  };

  const handleChange = (elements: any, appState: any) => {
    console.log('📝 onChange fired - elements:', elements.length, 'items');
  };

  // Handle Tab key for text indentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && excalidrawAPI) {
        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        
        // Check if we're in text editing mode
        const editingElement = elements.find((el: any) => el.id === appState.editingElement);
        if (editingElement && editingElement.type === 'text') {
          e.preventDefault();
          console.log('🔤 Tab intercepted in text mode');
          
          // Insert spaces (4 spaces for tab)
          const textElement = editingElement;
          const currentText = textElement.text || '';
          const spaces = '    '; // 4 spaces for tab
          
          // Try to get cursor position (simplified approach)
          const updatedText = currentText + spaces;
          
          // Update the text element
          const updatedElements = elements.map((el: any) => {
            if (el.id === editingElement.id) {
              return { ...el, text: updatedText };
            }
            return el;
          });
          
          excalidrawAPI.updateScene({ elements: updatedElements });
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [excalidrawAPI]);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Custom toolbar */}
      <div className="p-4 bg-gray-100 border-b flex-shrink-0">
        <div className="flex flex-wrap gap-4">
          {/* Tool buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleToolChange('selection')}
              className={`px-4 py-2 rounded ${
                activeTool === 'selection' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Select
            </button>
            <button
              onClick={() => handleToolChange('freedraw')}
              className={`px-4 py-2 rounded ${
                activeTool === 'freedraw' 
                  ? 'bg-green-700 text-white' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Pencil
            </button>
            <button
              onClick={() => handleToolChange('highlighter')}
              className={`px-4 py-2 rounded ${
                activeTool === 'highlighter' 
                  ? 'bg-yellow-700 text-white' 
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              Highlighter
            </button>
            <button
              onClick={() => handleToolChange('text')}
              className={`px-4 py-2 rounded ${
                activeTool === 'text' 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => handleToolChange('eraser')}
              className={`px-4 py-2 rounded ${
                activeTool === 'eraser' 
                  ? 'bg-red-700 text-white' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Eraser
            </button>
          </div>

          {/* Width presets */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Width:</span>
            <button
              onClick={() => handleWidthChange(1)}
              className={`px-3 py-1 rounded text-sm ${
                strokeWidth === 1 ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              Thin
            </button>
            <button
              onClick={() => handleWidthChange(3)}
              className={`px-3 py-1 rounded text-sm ${
                strokeWidth === 3 ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              Med
            </button>
            <button
              onClick={() => handleWidthChange(6)}
              className={`px-3 py-1 rounded text-sm ${
                strokeWidth === 6 ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              Thick
            </button>
          </div>

          {/* Width slider */}
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => handleWidthChange(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-8">{strokeWidth}</span>
          </div>

          {/* Font size for text */}
          {activeTool === 'text' && (
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Size:</span>
              <input
                type="range"
                min="12"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-8">{fontSize}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Excalidraw container with fixed positioning */}
      <div className="flex-1 relative min-h-0">
        <div 
          className="absolute inset-0 excalidraw-container"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            pointerEvents: 'auto'
          }}
        >
          <style jsx>{`
            /* Temporarily showing built-in toolbar for testing */
            .excalidraw-container :global(.excalidraw) {
              pointer-events: auto !important;
            }
            .excalidraw-container :global(.excalidraw .excalidraw-wrapper) {
              pointer-events: auto !important;
            }
          `}</style>
          <Excalidraw
            excalidrawAPI={handleExcalidrawAPIReady}
            onChange={handleChange}
            // Removed UIOptions to test if they were causing conflicts
          />
        </div>
      </div>
    </div>
  );
}