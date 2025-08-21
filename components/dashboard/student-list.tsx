'use client'

import { useState, useMemo, useEffect } from 'react'
import { StudentCard } from './student-card'
import { Assignment } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface Student {
  id: string
  name: string
  email: string
  status?: string
  loginCode?: string
  createdAt: Date | string
  enrollments?: {
    class: {
      id: string
      name: string
      color: string
      level: string
    }
  }[]
  submissions?: {
    id: string
    status: string
    studentId: string
    updatedAt: Date | string
  }[]
}

interface StudentListProps {
  students: Student[]
  assignments?: Assignment[]
  onStudentClick?: (studentId: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function StudentList({ 
  students, 
  assignments = [],
  onStudentClick, 
  isLoading = false,
  emptyMessage = "No students found"
}: StudentListProps) {
  const [density, setDensity] = useState<'compact' | 'expanded'>('expanded')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Debounce search query
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])

  // Helper functions for sorting
  const getLabel = (s: Student) => (s.name?.trim() || s.email?.trim() || '').toString()
  const collator = useMemo(
    () => new Intl.Collator(['en', 'ko'], { sensitivity: 'base', numeric: true }),
    []
  )

  // Filter and sort students
  const visibleStudents = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    const filtered = !q
      ? students
      : students.filter(s =>
          (s.name ?? '').toLowerCase().includes(q) ||
          (s.email ?? '').toLowerCase().includes(q)
        )

    const sorted = [...filtered].sort((a, b) => {
      const A = getLabel(a)
      const B = getLabel(b)
      const cmp = collator.compare(A, B)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return sorted
  }, [students, debouncedQuery, sortDir, collator])
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Density Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={density === 'expanded' ? 'primary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              disabled
            >
              Expanded
            </Button>
            <Button
              variant={density === 'compact' ? 'primary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              disabled
            >
              Compact
            </Button>
          </div>
        </div>
        
        <div className="student-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch auto-rows-fr">
          {[...Array(6)].map((_, i) => (
            <StudentCard 
              key={i} 
              student={{} as Student}
              density={density}
              isLoading={true} 
              className="student-card"
            />
          ))}
        </div>
      </div>
    )
  }

  if (visibleStudents.length === 0 && !isLoading) {
    const hasQuery = debouncedQuery.length > 0
    return (
      <div className="space-y-4">
        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="student-search" className="sr-only">Search students</label>
            <input
              id="student-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students…"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring"
            />
            {!!query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 hover:opacity-100"
                aria-label="Clear search"
              >×</button>
            )}
          </div>
          <div className="inline-flex rounded-md border">
            <button
              type="button"
              onClick={() => setSortDir('asc')}
              className={`px-3 py-2 text-sm ${sortDir==='asc' ? 'bg-gray-100' : ''}`}
              aria-pressed={sortDir==='asc'}
            >A→Z</button>
            <button
              type="button"
              onClick={() => setSortDir('desc')}
              className={`px-3 py-2 text-sm border-l ${sortDir==='desc' ? 'bg-gray-100' : ''}`}
              aria-pressed={sortDir==='desc'}
            >Z→A</button>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasQuery ? 'No matching students' : 'No Students'}
          </h3>
          <p className="text-gray-500">
            {hasQuery ? `No students found matching "${debouncedQuery}"` : emptyMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="student-search" className="sr-only">Search students</label>
          <input
            id="student-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring"
          />
          {!!query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 hover:opacity-100"
              aria-label="Clear search"
            >×</button>
          )}
        </div>
        <div className="inline-flex rounded-md border">
          <button
            type="button"
            onClick={() => setSortDir('asc')}
            className={`px-3 py-2 text-sm ${sortDir==='asc' ? 'bg-gray-100' : ''}`}
            aria-pressed={sortDir==='asc'}
          >A→Z</button>
          <button
            type="button"
            onClick={() => setSortDir('desc')}
            className={`px-3 py-2 text-sm border-l ${sortDir==='desc' ? 'bg-gray-100' : ''}`}
            aria-pressed={sortDir==='desc'}
          >Z→A</button>
        </div>
      </div>

      {/* Density Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={density === 'expanded' ? 'primary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setDensity('expanded')}
          >
            Expanded
          </Button>
          <Button
            variant={density === 'compact' ? 'primary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setDensity('compact')}
          >
            Compact
          </Button>
        </div>
      </div>
      
      {/* Responsive Grid with Equal Heights */}
      <div className="student-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch auto-rows-fr">
        {visibleStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            density={density}
            assignments={assignments}
            onStudentClick={onStudentClick}
            className="student-card"
          />
        ))}
      </div>
    </div>
  )
}