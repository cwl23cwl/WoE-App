'use client'

import { useState } from 'react'
import { AssignmentFolder } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface FolderManagerProps {
  folders: AssignmentFolder[]
  onCreateFolder: (name: string, color: string) => void
  onUpdateFolder: (id: string, updates: Partial<AssignmentFolder>) => void
  onDeleteFolder: (id: string) => void
  className?: string
}

const FOLDER_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
]

export function FolderManager({ 
  folders, 
  onCreateFolder, 
  onUpdateFolder, 
  onDeleteFolder,
  className = ''
}: FolderManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return

    onCreateFolder(newFolderName.trim(), newFolderColor)
    setNewFolderName('')
    setNewFolderColor(FOLDER_COLORS[0])
    setIsCreating(false)
  }

  const handleStartEdit = (folder: AssignmentFolder) => {
    setEditingId(folder.id)
    setEditName(folder.name)
    setEditColor(folder.color)
  }

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingId) return

    onUpdateFolder(editingId, {
      name: editName.trim(),
      color: editColor
    })
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }

  const handleDeleteFolder = (folder: AssignmentFolder) => {
    if (folder.assignments.length > 0) {
      const confirmed = window.confirm(
        `This folder contains ${folder.assignments.length} assignment(s). Are you sure you want to delete it? Assignments will be moved to "Uncategorized".`
      )
      if (!confirmed) return
    }

    onDeleteFolder(folder.id)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Manage Folders</h3>
        <Button 
          size="sm" 
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          + New Folder
        </Button>
      </div>

      {/* Create New Folder */}
      {isCreating && (
        <Card className="p-4 border-dashed border-2 border-blue-300 bg-blue-50">
          <div className="space-y-3">
            <Input
              placeholder="Folder name (e.g., Creative Writing)"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color:</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newFolderColor === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFolderColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateFolder}>
                Create
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false)
                  setNewFolderName('')
                  setNewFolderColor(FOLDER_COLORS[0])
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Folders */}
      <div className="space-y-2">
        {folders.map((folder) => (
          <Card key={folder.id} className="p-4">
            {editingId === folder.id ? (
              <div className="space-y-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {FOLDER_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          editColor === color 
                            ? 'border-gray-800 scale-110' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{folder.name}</h4>
                    <p className="text-sm text-gray-500">
                      {folder.assignments.length} assignment{folder.assignments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleStartEdit(folder)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDeleteFolder(folder)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
        
        {folders.length === 0 && !isCreating && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📁</div>
            <p>No folders yet. Create your first folder to organize assignments!</p>
          </div>
        )}
      </div>
    </div>
  )
}