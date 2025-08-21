import { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      avatar?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
    avatar?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    avatar?: string
  }
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string
  isActive: boolean
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE'
  loginCode?: string
  inviteToken?: string
  inviteExpiry?: Date
  createdAt: Date
  schedules?: Schedule[]
}

export interface AssignmentFolder {
  id: string
  name: string
  description?: string
  color: string
  position: number
  teacherId: string
  teacher: User
  classId: string
  class: Class
  assignments: Assignment[]
  createdAt: Date
  updatedAt: Date
}

export interface Class {
  id: string
  name: string
  description?: string
  code: string
  level: string
  color: string
  isActive: boolean
  maxStudents?: number
  teacherId: string
  teacher: User
  enrollments: Enrollment[]
  assignments: Assignment[]
  folders: AssignmentFolder[]
  schedules: Schedule[]
  createdAt: Date
  updatedAt: Date
}

export interface Enrollment {
  id: string
  joinedAt: Date
  isActive: boolean
  studentId: string
  student: User
  classId: string
  class: Class
}

export interface Assignment {
  id: string
  title: string
  description?: string
  type: 'DRAWING' | 'WRITING' | 'VOCABULARY' | 'SPEAKING'
  
  // Assignment access
  accessCode?: string
  qrCode?: string
  codeExpiry?: Date
  
  // Template and layout
  template: 'BLANK' | 'LINED' | 'GRID' | 'CUSTOM'
  templateData?: any
  
  // Excalidraw data
  excalidrawData?: any
  canvasWidth?: number
  canvasHeight?: number
  
  // Assignment settings
  maxScore?: number
  dueDate?: Date
  isPublished: boolean
  isDraft: boolean
  allowLateSubmission: boolean
  allowCollaboration: boolean
  timeLimit?: number
  
  // Instructions and resources
  instructions?: string
  instructionsTTS: boolean
  resources?: any
  
  // Relationships
  teacherId: string
  teacher: User
  classId: string
  class: Class
  folderId?: string
  folder?: AssignmentFolder
  submissions: Submission[]
  createdAt: Date
  updatedAt: Date
}

export interface Submission {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RETURNED'
  excalidrawData?: any
  textContent?: string
  notes?: string
  score?: number
  maxScore?: number
  feedback?: string
  rubricData?: any
  submittedAt?: Date
  gradedAt?: Date
  returnedAt?: Date
  studentId: string
  student: User
  assignmentId: string
  assignment: Assignment
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  enrollments: Enrollment[]
  submissions: Submission[]
}

export interface Teacher extends User {
  classesTeaching: Class[]
  assignmentsCreated: Assignment[]
  foldersCreated: AssignmentFolder[]
}

export interface DashboardStats {
  totalClasses: number
  totalStudents: number
  pendingSubmissions: number
  upcomingAssignments: number
}

export interface SortConfig {
  key: 'title' | 'dueDate' | 'createdAt' | 'type'
  direction: 'asc' | 'desc'
}

export interface CalendarDay {
  date: Date
  isToday: boolean
  hasClasses: boolean
  classes: Class[]
}

export interface FolderTab {
  id: string
  name: string
  color: string
  count: number
  isActive: boolean
}

export interface DragDropItem {
  id: string
  type: 'assignment'
  data: Assignment
}

// Schedule Management
export interface Schedule {
  id: string
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string // "14:00" format
  endTime: string   // "15:30" format
  title?: string
  notes?: string
  isActive: boolean
  studentId?: string
  student?: User
  classId?: string
  class?: Class
  createdAt: Date
  updatedAt: Date
}

// Assignment Templates
export interface AssignmentTemplateLibrary {
  id: string
  name: string
  description?: string
  category: string
  type: 'DRAWING' | 'WRITING' | 'VOCABULARY' | 'SPEAKING'
  template: 'BLANK' | 'LINED' | 'GRID' | 'CUSTOM'
  templateData?: any
  instructions?: string
  usageCount: number
  isPublic: boolean
  createdBy: string
  teacher: User
  createdAt: Date
  updatedAt: Date
}

// Form Data Types
export interface StudentCreationForm {
  name: string
  email?: string
  timezone?: string
  schedules: ScheduleInput[]
  generateOwnClass?: boolean // Flag to auto-generate a class for the student
}

export interface ScheduleInput {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  title?: string
  notes?: string
}

export interface AssignmentCreationForm {
  title: string
  description?: string
  type: 'DRAWING' | 'WRITING' | 'VOCABULARY' | 'SPEAKING'
  classId: string
  folderId?: string
  template: 'BLANK' | 'LINED' | 'GRID' | 'CUSTOM'
  templateData?: any
  dueDate?: Date
  maxScore?: number
  instructions?: string
  instructionsTTS: boolean
  allowLateSubmission: boolean
  allowCollaboration: boolean
  timeLimit?: number
  resources?: ResourceInput[]
  saveAsDraft: boolean
}

export interface ResourceInput {
  title: string
  url: string
  type: 'link' | 'file' | 'video'
}

// Student Management
export interface StudentListFilters {
  search?: string
  classId?: string
  status?: 'ACTIVE' | 'INVITED' | 'INACTIVE'
  page: number
  limit: number
}

export interface StudentBulkAction {
  type: 'assign_to_class' | 'send_invitations' | 'export_data' | 'deactivate'
  studentIds: string[]
  data?: any
}

// Assignment Management
export interface AssignmentListFilters {
  search?: string
  classId?: string
  folderId?: string
  type?: 'DRAWING' | 'WRITING' | 'VOCABULARY' | 'SPEAKING'
  status?: 'draft' | 'published' | 'due_soon' | 'overdue'
  page: number
  limit: number
}

export interface AssignmentAnalytics {
  assignmentId: string
  totalSubmissions: number
  completionRate: number
  averageScore?: number
  submissionTrend: { date: Date; count: number }[]
}

// UI State Types
export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ModalState {
  isOpen: boolean
  type?: 'student_creation' | 'assignment_creation' | 'student_edit' | 'assignment_edit'
  data?: any
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StudentWithAnalytics extends User {
  completedAssignments: number
  averageScore?: number
  lastActivity?: Date
  scheduleConflicts: boolean
}

export interface ClassWithAnalytics extends Class {
  studentCount: number
  assignmentCount: number
  averageCompletion: number
  nextDueAssignment?: Assignment
}

// Login Card Generation
export interface LoginCard {
  studentName: string
  loginCode: string
  password: string
  schoolName: string
  instructions: string
}