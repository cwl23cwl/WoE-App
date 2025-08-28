import { create } from 'zustand'
import { Class, Student, Assignment } from '@/lib/types'

interface ClassroomState {
  classes: Class[]
  students: Student[]
  assignments: Assignment[]
  isLoading: boolean
  addClass: (classData: Omit<Class, 'id' | 'createdAt'>) => void
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => void
  addAssignment: (assignmentData: Omit<Assignment, 'id' | 'createdAt'>) => void
  setClasses: (classes: Class[]) => void
  setStudents: (students: Student[]) => void
  setAssignments: (assignments: Assignment[]) => void
}

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  classes: [],
  students: [],
  assignments: [],
  isLoading: false,
  addClass: (classData) => {
    const newClass: Class = {
      ...classData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    set({ classes: [...get().classes, newClass] })
  },
  addStudent: (studentData) => {
    const newStudent: Student = {
      ...studentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    set({ students: [...get().students, newStudent] })
  },
  addAssignment: (assignmentData) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    set({ assignments: [...get().assignments, newAssignment] })
  },
  setClasses: (classes) => set({ classes }),
  setStudents: (students) => set({ students }),
  setAssignments: (assignments) => set({ assignments }),
}))