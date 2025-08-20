'use client'

import { useState, useMemo } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  useDroppable,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Assignment, AssignmentFolder, FolderTab } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DraggableAssignmentItem } from './draggable-assignment-item'
import { FolderManager } from './folder-manager'
import { DroppableFolderTab } from './droppable-folder-tab'

interface AssignmentFolderTabsProps {
  assignments: Assignment[]
  folders: AssignmentFolder[]
  onMoveAssignment: (assignmentId: string, folderId: string | null) => void
  onCreateFolder: (name: string, color: string) => void
  onUpdateFolder: (id: string, updates: Partial<AssignmentFolder>) => void
  onDeleteFolder: (id: string) => void
  showFolderManager?: boolean
  onToggleFolderManager?: () => void
}

export function AssignmentFolderTabs({
  assignments,
  folders,
  onMoveAssignment,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  showFolderManager = false,
  onToggleFolderManager
}: AssignmentFolderTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [draggedAssignment, setDraggedAssignment] = useState<Assignment | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  // Group assignments by folder - recalculate on every render to reflect updates
  const assignmentsByFolder = useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      const folderId = assignment.folderId || 'uncategorized'
      if (!acc[folderId]) acc[folderId] = []
      acc[folderId].push(assignment)
      return acc
    }, {} as Record<string, Assignment[]>)
  }, [assignments])

  // Create folder tabs
  const folderTabs: FolderTab[] = [
    {
      id: 'all',
      name: 'All',
      color: '#6B7280',
      count: assignments.length,
      isActive: activeTab === 'all'
    },
    ...folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      count: assignmentsByFolder[folder.id]?.length || 0,
      isActive: activeTab === folder.id
    })),
    {
      id: 'uncategorized',
      name: 'Uncategorized',
      color: '#9CA3AF',
      count: assignmentsByFolder.uncategorized?.length || 0,
      isActive: activeTab === 'uncategorized'
    }
  ]

  // Get assignments for active tab
  const getActiveAssignments = (): Assignment[] => {
    if (activeTab === 'all') return assignments
    if (activeTab === 'uncategorized') return assignmentsByFolder.uncategorized || []
    return assignmentsByFolder[activeTab] || []
  }

  const handleDragStart = (event: DragStartEvent) => {
    const assignment = assignments.find(a => a.id === event.active.id)
    setDraggedAssignment(assignment || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedAssignment(null)

    if (!over) return

    const assignmentId = active.id as string
    const overId = over.id as string

    // Find the current assignment
    const currentAssignment = assignments.find(a => a.id === assignmentId)
    if (!currentAssignment) return

    let targetFolderId: string | null = null

    // Check if dropped on a folder tab
    const targetFolder = folders.find(f => f.id === overId)
    if (targetFolder) {
      targetFolderId = targetFolder.id
    } else if (overId === 'uncategorized' || overId === 'all') {
      targetFolderId = null
    } else {
      // If dropped on something else, don't move
      return
    }

    // Only move if it's actually changing folders
    if (currentAssignment.folderId !== targetFolderId) {
      console.log('Moving assignment:', assignmentId, 'from folder:', currentAssignment.folderId, 'to folder:', targetFolderId)
      onMoveAssignment(assignmentId, targetFolderId)
    } else {
      console.log('Assignment already in target folder, not moving')
    }
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleDropOnTab = (folderId: string | null) => {
    if (!draggedAssignment) return
    onMoveAssignment(draggedAssignment.id, folderId)
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Folder Management Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFolderManager}
          >
            {showFolderManager ? 'Hide' : 'Manage'} Folders
          </Button>
        </div>

        {/* Folder Manager */}
        {showFolderManager && (
          <FolderManager
            folders={folders}
            onCreateFolder={onCreateFolder}
            onUpdateFolder={onUpdateFolder}
            onDeleteFolder={onDeleteFolder}
          />
        )}

        {/* Folder Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {folderTabs.map((tab) => (
            <DroppableFolderTab
              key={tab.id}
              tab={tab}
              onTabClick={handleTabClick}
            />
          ))}
        </div>

        {/* Assignment List */}
        <div className="space-y-3">
          <SortableContext 
            items={getActiveAssignments().map(a => a.id)} 
            strategy={verticalListSortingStrategy}
          >
            {getActiveAssignments().map((assignment) => (
              <DraggableAssignmentItem
                key={assignment.id}
                assignment={assignment}
                folder={assignment.folder}
              />
            ))}
          </SortableContext>

          {getActiveAssignments().length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-gray-500 space-y-2">
                <div className="text-4xl">📝</div>
                <h4 className="font-medium">No assignments in this folder</h4>
                <p className="text-sm">
                  {activeTab === 'all' 
                    ? 'Create your first assignment to get started!'
                    : 'Drag assignments here to organize them.'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedAssignment && (
          <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg transform rotate-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {draggedAssignment.type}
              </Badge>
              <span className="font-medium">{draggedAssignment.title}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}