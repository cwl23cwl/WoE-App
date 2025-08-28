'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => ({ default: mod.Excalidraw })),
  { ssr: false }
);

export default function CanvasCardTest() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<string>('selection');
  const [strokeWidth, setStrokeWidth] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(20);
  const [strokeColor, setStrokeColor] = useState<string>('#000000');

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
            currentItemStrokeColor: strokeColor,
            ...toolSettings,
          }
        });
        
        console.log('✅ setActiveTool completed successfully');
        console.log('📊 Current active tool:', excalidrawAPI.getAppState()?.activeTool?.type);
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
          currentItemStrokeColor: strokeColor,
          currentItemBackgroundColor: 'transparent',
          currentItemOpacity: 100,
          currentItemRoughness: 1,
        };
      case 'text':
        return {
          currentItemStrokeColor: strokeColor,
          currentItemBackgroundColor: 'transparent',
          currentItemOpacity: 100,
        };
      default:
        return {
          currentItemStrokeColor: strokeColor,
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

  const handleColorChange = (newColor: string) => {
    setStrokeColor(newColor);
    if (excalidrawAPI) {
      const currentAppState = excalidrawAPI.getAppState();
      excalidrawAPI.updateScene({
        appState: {
          ...currentAppState,
          currentItemStrokeColor: newColor,
        }
      });
      
      // Also update selected elements
      const selectedElements = excalidrawAPI.getSceneElements().filter((el: any) => el.isSelected);
      if (selectedElements.length > 0) {
        const updatedElements = excalidrawAPI.getSceneElements().map((el: any) => {
          if (el.isSelected) {
            return { ...el, strokeColor: newColor };
          }
          return el;
        });
        excalidrawAPI.updateScene({ elements: updatedElements });
      }
    }
  };

  const handleUndo = () => {
    if (excalidrawAPI) {
      excalidrawAPI.history.undo();
      console.log('↶ Undo performed');
    }
  };

  const handleRedo = () => {
    if (excalidrawAPI) {
      excalidrawAPI.history.redo();
      console.log('↷ Redo performed');
    }
  };

  const handleZoom = (delta: number) => {
    if (excalidrawAPI) {
      const currentAppState = excalidrawAPI.getAppState();
      const newZoom = Math.max(0.1, Math.min(5, currentAppState.zoom.value + delta));
      excalidrawAPI.updateScene({
        appState: {
          ...currentAppState,
          zoom: { value: newZoom }
        }
      });
      console.log('🔍 Zoom changed to:', newZoom);
    }
  };

  const handleResetScene = () => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
      console.log('🗑️ Scene reset');
    }
  };

  const handleExportJSON = () => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      console.log('📤 Export JSON:', { elements, appState });
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
          currentItemStrokeColor: strokeColor,
          currentItemBackgroundColor: 'transparent',
          currentItemStrokeWidth: strokeWidth,
          currentItemRoughness: 1,
          currentItemOpacity: 100,
          currentItemFontSize: fontSize,
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
    const elementCount = elements.length;
    console.log('📝 onChange fired - elements:', elementCount, 'items');
    
    // Log element count delta
    if (window.lastElementCount !== undefined) {
      const delta = elementCount - window.lastElementCount;
      if (delta !== 0) {
        console.log('📊 Element delta:', delta > 0 ? `+${delta}` : delta);
      }
    }
    (window as any).lastElementCount = elementCount;
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {/* Page frame with aspect ratio */}
      <div className="w-full max-w-4xl aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        
        {/* Custom toolbar */}
        <div className="p-4 bg-gray-100 border-b flex-shrink-0">
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Tool buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToolChange('selection')}
                className={`px-3 py-1 rounded text-xs ${
                  activeTool === 'selection' 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Select
              </button>
              <button
                onClick={() => handleToolChange('freedraw')}
                className={`px-3 py-1 rounded text-xs ${
                  activeTool === 'freedraw' 
                    ? 'bg-green-700 text-white' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Pencil
              </button>
              <button
                onClick={() => handleToolChange('highlighter')}
                className={`px-3 py-1 rounded text-xs ${
                  activeTool === 'highlighter' 
                    ? 'bg-yellow-700 text-white' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                Highlight
              </button>
              <button
                onClick={() => handleToolChange('text')}
                className={`px-3 py-1 rounded text-xs ${
                  activeTool === 'text' 
                    ? 'bg-purple-700 text-white' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => handleToolChange('eraser')}
                className={`px-3 py-1 rounded text-xs ${
                  activeTool === 'eraser' 
                    ? 'bg-red-700 text-white' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Eraser
              </button>
            </div>

            {/* Width controls */}
            <div className="flex gap-2 items-center">
              <span className="text-xs font-medium">Width:</span>
              <button
                onClick={() => handleWidthChange(1)}
                className={`px-2 py-1 rounded text-xs ${
                  strokeWidth === 1 ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Thin
              </button>
              <button
                onClick={() => handleWidthChange(3)}
                className={`px-2 py-1 rounded text-xs ${
                  strokeWidth === 3 ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Med
              </button>
              <button
                onClick={() => handleWidthChange(6)}
                className={`px-2 py-1 rounded text-xs ${
                  strokeWidth === 6 ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                Thick
              </button>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                className="w-16"
              />
              <span className="text-xs w-4">{strokeWidth}</span>
            </div>

            {/* Color picker */}
            <div className="flex gap-2 items-center">
              <span className="text-xs font-medium">Color:</span>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-6 rounded border"
              />
              <div className="flex gap-1">
                {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-4 h-4 rounded border-2 ${strokeColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Font size for text */}
            {activeTool === 'text' && (
              <div className="flex gap-2 items-center">
                <span className="text-xs font-medium">Size:</span>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs w-6">{fontSize}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={handleUndo} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                Undo
              </button>
              <button onClick={handleRedo} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                Redo
              </button>
              <button onClick={() => handleZoom(0.1)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                Zoom+
              </button>
              <button onClick={() => handleZoom(-0.1)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                Zoom-
              </button>
            </div>

            {/* Debug controls */}
            <div className="flex gap-2">
              <button onClick={handleResetScene} className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600">
                Reset
              </button>
              <button onClick={handleExportJSON} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Excalidraw container - no transforms, just sizing */}
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
              .excalidraw-container :global(.App-toolbar) {
                display: none !important;
              }
              .excalidraw-container :global(.App-toolbar-content) {
                display: none !important;
              }
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
              UIOptions={{
                canvasActions: {
                  toggleTheme: false,
                  saveToActiveFile: false,
                  loadScene: false,
                  export: false,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}