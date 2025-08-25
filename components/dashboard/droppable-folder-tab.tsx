'use client'

import { useDroppable } from '@dnd-kit/core'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { FolderTab } from '@/lib/types'

interface DroppableFolderTabProps {
  tab: FolderTab
  onTabClick: (tabId: string) => void
}

export function DroppableFolderTab({ tab, onTabClick }: DroppableFolderTabProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: tab.id,
    data: {
      type: 'folder',
      folderId: tab.id === 'uncategorized' || tab.id === 'all' ? null : tab.id
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-200 ${
        isOver ? 'scale-105' : ''
      }`}
    >
      <Button
        variant={tab.isActive ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onTabClick(tab.id)}
        className={`relative transition-all duration-200 ${
          tab.isActive 
            ? 'border-b-2 border-blue-500' 
            : 'hover:bg-gray-100'
        } ${
          isOver ? 'bg-blue-100 border-blue-300' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tab.color }}
          />
          <span>{tab.name}</span>
          {tab.count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          )}
        </div>
      </Button>
    </div>
  )
}