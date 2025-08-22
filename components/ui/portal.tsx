import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function Portal({ children }: { children: ReactNode }) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Get or create the portal root
    let root = document.getElementById('ui-overlays')
    
    if (!root) {
      root = document.createElement('div')
      root.id = 'ui-overlays'
      root.style.position = 'absolute'
      root.style.top = '0'
      root.style.left = '0'
      root.style.zIndex = '900'
      root.style.pointerEvents = 'none'
      document.body.appendChild(root)
    }
    
    setPortalRoot(root)
    
    return () => {
      // Clean up if component unmounts and portal is empty
      if (root && root.children.length === 0 && root.parentNode) {
        root.parentNode.removeChild(root)
      }
    }
  }, [])

  if (!portalRoot) {
    return null
  }

  return createPortal(children, portalRoot)
}