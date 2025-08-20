'use client'

import { useState, useEffect } from 'react'
import { Class, AssignmentFolder } from '@/lib/types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RefinedClassCard } from './refined-class-card'

interface ClassCardsAccordionProps {
  classes: Class[]
  onStudentClick?: (studentId: string) => void
  onMoveAssignment?: (assignmentId: string, folderId: string | null) => void
  onCreateFolder?: (classId: string, name: string, color: string) => void
  onUpdateFolder?: (id: string, updates: Partial<AssignmentFolder>) => void
  onDeleteFolder?: (id: string) => void
  isLoading?: boolean
  defaultOpenFirst?: boolean
}

export function ClassCardsAccordion({
  classes,
  onStudentClick,
  onMoveAssignment,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  isLoading = false,
  defaultOpenFirst = true
}: ClassCardsAccordionProps) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})

  // Initialize open states only once when classes are available
  useEffect(() => {
    if (classes.length > 0 && Object.keys(openStates).length === 0) {
      const initialStates: Record<string, boolean> = {}
      
      if (defaultOpenFirst) {
        initialStates[classes[0].id] = true
      }
      
      setOpenStates(initialStates)
    }
  }, [classes, defaultOpenFirst, openStates])

  const handleCardToggle = (classId: string, isOpen: boolean) => {
    setOpenStates(prev => ({
      ...prev,
      [classId]: isOpen
    }))
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        {[...Array(3)].map((_, i) => (
          <RefinedClassCard 
            key={i} 
            classData={{} as Class} 
            isLoading={true} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {classes.map((classData) => {
        const isOpen = openStates[classData.id] || false
        
        return (
          <Accordion 
            key={classData.id}
            type="single" 
            collapsible 
            value={isOpen ? classData.id : ""}
            onValueChange={(value) => {
              // Simple toggle logic: if we get any value, toggle the current state
              console.log(`Card ${classData.id}: onValueChange with value:`, value, `current isOpen:`, isOpen)
              handleCardToggle(classData.id, !isOpen)
            }}
          >
            <AccordionItem 
              value={classData.id} 
              className="border-none"
            >
              <div className="rounded-2xl border shadow-sm bg-white/70 backdrop-blur overflow-hidden">
                <AccordionTrigger className="p-5 lg:p-6 hover:no-underline hover:bg-gray-50/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                  <RefinedClassCard
                    classData={classData}
                    onStudentClick={onStudentClick}
                    onMoveAssignment={onMoveAssignment}
                    onCreateFolder={onCreateFolder}
                    onUpdateFolder={onUpdateFolder}
                    onDeleteFolder={onDeleteFolder}
                    disableInteractions={true}
                    isLoading={false}
                    renderHeaderOnly={true}
                  />
                </AccordionTrigger>
                <AccordionContent className="px-5 lg:px-6 pb-5 lg:pb-6">
                  <RefinedClassCard
                    classData={classData}
                    onStudentClick={onStudentClick}
                    onMoveAssignment={onMoveAssignment}
                    onCreateFolder={onCreateFolder}
                    onUpdateFolder={onUpdateFolder}
                    onDeleteFolder={onDeleteFolder}
                    disableInteractions={true}
                    isLoading={false}
                    renderContentOnly={true}
                  />
                </AccordionContent>
              </div>
            </AccordionItem>
          </Accordion>
        )
      })}
    </div>
  )
}