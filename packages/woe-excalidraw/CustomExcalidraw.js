import React, { useEffect, useState } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";

// Font family constants that Excalidraw uses internally
const FONT_FAMILY = {
  Helvetica: 1,
  Cascadia: 2, 
  Virgil: 3,
  Xiaolai: 4,
};

// Custom font mapping for different font families
const CUSTOM_FONT_MAPPING = {
  [FONT_FAMILY.Helvetica]: 'var(--selected-font-family, "Open Sans")',
  [FONT_FAMILY.Cascadia]: '"Cascadia", "JetBrains Mono", monospace',
  [FONT_FAMILY.Virgil]: '"Virgil", "Kalam", cursive',
  [FONT_FAMILY.Xiaolai]: '"Xiaolai", "Kalam", cursive',
};

export function CustomExcalidraw({ 
  enableCustomFonts = true, 
  canvasBackground,
  excalidrawAPI,
  ...props 
}) {
  // Store the actual API object locally
  const [actualAPI, setActualAPI] = useState(null);
  
  useEffect(() => {
    if (!enableCustomFonts) return;
    
    // Inject custom font styles into the page
    const styleId = 'woe-excalidraw-fonts';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Custom font overrides for Excalidraw */
        .excalidraw svg text[font-family="Helvetica"],
        .excalidraw svg text[font-family="Assistant"] {
          font-family: var(--selected-font-family, "Open Sans"), Helvetica, Arial, sans-serif !important;
        }
        
        .excalidraw svg text[font-family="Cascadia"] {
          font-family: "Cascadia", "JetBrains Mono", "Courier New", monospace !important;
        }
        
        .excalidraw svg text[font-family="Virgil"] {
          font-family: "Virgil", "Kalam", cursive !important;
        }
        
        .excalidraw svg text[font-family="Xiaolai"] {
          font-family: "Xiaolai", "Kalam", cursive !important;
        }
        
        /* Set CSS variables for font families */
        .excalidraw {
          --font-family-1: var(--selected-font-family, "Open Sans"), -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          --font-family-2: "Cascadia", "JetBrains Mono", "Monaco", "Courier New", monospace;
          --font-family-3: "Virgil", "Kalam", cursive;
          --font-family-4: "Xiaolai", "Kalam", cursive;
        }
      `;
      document.head.appendChild(style);
    }
  }, [enableCustomFonts]);

  // Background pattern generation functions
  const generateGridPattern = (density, color, opacity) => {
    return `
      <svg width="${density}" height="${density}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="${density}" height="${density}" patternUnits="userSpaceOnUse">
            <path d="M ${density} 0 L 0 0 0 ${density}" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `;
  };

  const generateDotsPattern = (density, color, opacity) => {
    const dotSize = Math.max(1, density / 10);
    return `
      <svg width="${density}" height="${density}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="${density}" height="${density}" patternUnits="userSpaceOnUse">
            <circle cx="${density/2}" cy="${density/2}" r="${dotSize}" fill="${color}" opacity="${opacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    `;
  };

  // Canvas background injection effect
  useEffect(() => {
    if (!canvasBackground?.enabled) return;

    const injectCanvasBackground = () => {
      const canvasElements = document.querySelectorAll('.excalidraw .App-canvas canvas');
      
      canvasElements.forEach((canvas) => {
        const canvasEl = canvas;
        const container = canvasEl.parentElement;
        
        if (!container) return;

        // Remove existing background layer
        const existingBg = container.querySelector('.woe-canvas-background');
        if (existingBg) {
          existingBg.remove();
        }

        // Create background element
        const backgroundDiv = document.createElement('div');
        backgroundDiv.className = 'woe-canvas-background';
        backgroundDiv.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        `;

        // Apply background based on type
        if (canvasBackground.type === 'solid') {
          backgroundDiv.style.backgroundColor = canvasBackground.color;
          backgroundDiv.style.opacity = String(canvasBackground.opacity);
        } else if (canvasBackground.type === 'grid') {
          const gridSvg = generateGridPattern(
            canvasBackground.density,
            canvasBackground.color,
            canvasBackground.opacity
          );
          const encodedSvg = encodeURIComponent(gridSvg);
          backgroundDiv.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;
          backgroundDiv.style.backgroundRepeat = 'repeat';
        } else if (canvasBackground.type === 'dots') {
          const dotsSvg = generateDotsPattern(
            canvasBackground.density,
            canvasBackground.color,
            canvasBackground.opacity
          );
          const encodedSvg = encodeURIComponent(dotsSvg);
          backgroundDiv.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;
          backgroundDiv.style.backgroundRepeat = 'repeat';
        }

        // Insert background behind canvas
        container.insertBefore(backgroundDiv, canvasEl);
      });
    };

    // Initial injection
    setTimeout(injectCanvasBackground, 100);

    // Re-inject on canvas changes
    const observer = new MutationObserver(injectCanvasBackground);
    const excalidrawElement = document.querySelector('.excalidraw');
    
    if (excalidrawElement) {
      observer.observe(excalidrawElement, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observer.disconnect();
      // Clean up background elements
      document.querySelectorAll('.woe-canvas-background').forEach(bg => bg.remove());
    };
  }, [canvasBackground]);

  // NATIVE SVG TEXT BACKGROUND RENDERING - Hook into Excalidraw's SVG rendering
  useEffect(() => {
    if (!actualAPI) {
      console.log('Text background: waiting for API');
      return;
    }

    console.log('Setting up NATIVE SVG text background rendering');

    const renderTextBackgrounds = () => {
      try {
        const elements = actualAPI.getSceneElements();
        const appState = actualAPI.getAppState();
        
        if (!elements || !appState) return;
        
        // Find the SVG element where Excalidraw renders
        const svg = document.querySelector('.excalidraw svg');
        if (!svg) {
          console.log('SVG not found, retrying...');
          setTimeout(renderTextBackgrounds, 100);
          return;
        }
        
        console.log('SVG found! Processing', elements.length, 'elements');
        
        // Remove existing background rectangles
        const existingBgs = svg.querySelectorAll('rect[data-woe-text-bg]');
        existingBgs.forEach(bg => bg.remove());
        
        // Process each text element
        elements.forEach(element => {
          if (element.type === 'text') {
            console.log('Processing text element:', {
              id: element.id,
              text: element.text?.substring(0, 20) || 'no text',
              hasCustomData: !!element.customData,
              hasWoeData: !!element.customData?.woe,
              hasTextBackground: !!element.customData?.woe?.textBackground,
              backgroundEnabled: element.customData?.woe?.textBackground?.enabled,
              backgroundColor: element.customData?.woe?.textBackground?.color
            });
            
            // Check if this text should have a background
            if (element.customData?.woe?.textBackground?.enabled) {
              const bgColor = element.customData.woe.textBackground.color;
              
              console.log('Creating SVG background for text:', element.text?.substring(0, 20));
              
              // Find the corresponding text element in the SVG - try multiple selectors
              console.log('Looking for SVG text element with ID:', element.id);
              
              // Try different ways to find the text element
              let textSvgElement = svg.querySelector(`text[data-id="${element.id}"]`) || 
                                  svg.querySelector(`g[data-id="${element.id}"] text`) ||
                                  svg.querySelector(`[data-element-id="${element.id}"] text`) ||
                                  svg.querySelector(`g[data-element-id="${element.id}"] text`);
              
              // If not found, try to find by matching text content
              if (!textSvgElement) {
                const allTexts = svg.querySelectorAll('text');
                console.log('Found', allTexts.length, 'SVG text elements, searching by content...');
                
                for (const textEl of allTexts) {
                  const textContent = textEl.textContent || textEl.innerHTML;
                  console.log('Checking SVG text content:', textContent, 'vs element text:', element.text);
                  if (textContent === element.text) {
                    textSvgElement = textEl;
                    console.log('Found text element by content match!');
                    break;
                  }
                }
              }
              
              if (textSvgElement) {
                console.log('Found SVG text element, creating background');
                
                // Get text bounds
                const bbox = textSvgElement.getBBox();
                const padding = 4;
                
                // Create background rectangle
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('data-woe-text-bg', element.id);
                rect.setAttribute('x', bbox.x - padding);
                rect.setAttribute('y', bbox.y - padding);
                rect.setAttribute('width', bbox.width + (padding * 2));
                rect.setAttribute('height', bbox.height + (padding * 2));
                rect.setAttribute('fill', bgColor);
                rect.setAttribute('opacity', '0.8');
                rect.setAttribute('rx', '2'); // Rounded corners
                
                // Insert background before the text element
                const parent = textSvgElement.parentElement;
                parent.insertBefore(rect, textSvgElement);
                
                console.log('SVG background rectangle created!');
              } else {
                console.log('SVG text element not found for:', element.id);
              }
            }
          }
        });
        
        console.log('SVG text background rendering complete');
        
      } catch (error) {
        console.error('Error in SVG text background rendering:', error);
      }
    };
    
    // Initial render
    renderTextBackgrounds();
    
    // Set up mutation observer to watch for SVG changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(renderTextBackgrounds);
    });
    
    const excalidrawElement = document.querySelector('.excalidraw');
    if (excalidrawElement) {
      observer.observe(excalidrawElement, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
    
    // Store a global function for manual triggering
    window.woeRenderTextBackgrounds = renderTextBackgrounds;
    
    return () => {
      observer.disconnect();
      window.woeRenderTextBackgrounds = null;
      // Clean up background rectangles
      const svg = document.querySelector('.excalidraw svg');
      if (svg) {
        const existingBgs = svg.querySelectorAll('rect[data-woe-text-bg]');
        existingBgs.forEach(bg => bg.remove());
      }
      console.log('SVG text background hook cleanup');
    };
  }, [actualAPI]);
  
  // Wrap the excalidrawAPI callback to add custom font functionality
  const handleExcalidrawAPI = (api) => {
    if (api) {
      // Store the API locally for text background rendering
      setActualAPI(api);
      console.log('CustomExcalidraw: API received and stored');
    }
    
    if (api && enableCustomFonts) {
      // Store original updateScene method
      const originalUpdateScene = api.updateScene;
      
      // Override updateScene to handle font customization and trigger text background rendering
      api.updateScene = (sceneData) => {
        if (sceneData.appState?.currentItemFontFamily) {
          console.log('CustomExcalidraw: Setting font family', sceneData.appState.currentItemFontFamily);
        }
        const result = originalUpdateScene.call(api, sceneData);
        
        // Trigger re-render for text backgrounds
        if (window.woeForceCanvasRedraw) {
          setTimeout(window.woeForceCanvasRedraw, 10);
        }
        
        return result;
      };
      
      // Set initial font to Open Sans
      setTimeout(() => {
        try {
          api.updateScene({
            appState: {
              currentItemFontFamily: FONT_FAMILY.Helvetica, // Will be styled as Open Sans via CSS
            }
          });
          console.log('CustomExcalidraw: Set default font to Open Sans');
        } catch (error) {
          console.error('CustomExcalidraw: Failed to set default font:', error);
        }
      }, 100);
    }
    
    // Call the original callback
    if (excalidrawAPI) {
      excalidrawAPI(api);
    }
  };

  return (
    <Excalidraw
      {...props}
      excalidrawAPI={handleExcalidrawAPI}
      onPointerUpdate={(payload) => {
        console.log('CustomExcalidraw: Pointer update, API available?', !!actualAPI);
      }}
    />
  );
}

export default CustomExcalidraw;