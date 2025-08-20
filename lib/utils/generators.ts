// Utility functions for generating codes, passwords, and validation

/**
 * Generate a 6-digit assignment access code
 */
export function generateAssignmentCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate a simple login code for students (4-6 characters)
 */
export function generateLoginCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a secure password for students
 */
export function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  
  const allChars = lowercase + uppercase + numbers + special
  let password = ''
  
  // Ensure at least one character from each set
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Generate QR code data URL for assignment access
 */
export function generateQRCodeData(assignmentCode: string, baseUrl: string): string {
  const url = `${baseUrl}/assignment/${assignmentCode}`
  // This would typically use a QR code library like qrcode
  // For now, return a placeholder
  return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for ${url}</svg>`)}`
}

/**
 * Generate a unique invite token
 */
export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Validate assignment code format
 */
export function isValidAssignmentCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}

/**
 * Check for schedule conflicts
 */
export function hasScheduleConflict(
  newSchedule: { dayOfWeek: string; startTime: string; endTime: string },
  existingSchedules: { dayOfWeek: string; startTime: string; endTime: string }[]
): boolean {
  return existingSchedules.some(schedule => {
    if (schedule.dayOfWeek !== newSchedule.dayOfWeek) return false
    
    const newStart = timeToMinutes(newSchedule.startTime)
    const newEnd = timeToMinutes(newSchedule.endTime)
    const existingStart = timeToMinutes(schedule.startTime)
    const existingEnd = timeToMinutes(schedule.endTime)
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart)
  })
}

/**
 * Convert time string to minutes for comparison
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Format schedule display string
 */
export function formatScheduleDisplay(schedules: { 
  dayOfWeek: string; 
  startTime: string; 
  endTime: string 
}[]): string {
  if (schedules.length === 0) return 'No schedule set'
  
  const dayAbbreviations: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun'
  }
  
  const groupedByTime = schedules.reduce((acc, schedule) => {
    const timeKey = `${schedule.startTime}-${schedule.endTime}`
    if (!acc[timeKey]) acc[timeKey] = []
    acc[timeKey].push(dayAbbreviations[schedule.dayOfWeek])
    return acc
  }, {} as Record<string, string[]>)
  
  return Object.entries(groupedByTime)
    .map(([time, days]) => `${days.join('/')} ${formatTime(time.split('-')[0])}-${formatTime(time.split('-')[1])}`)
    .join(', ')
}

/**
 * Format time from 24-hour to 12-hour format
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Generate student credentials for login cards
 */
export interface StudentCredentials {
  loginCode: string
  password: string
  displayPassword: string // Simpler password for display
}

export function generateStudentCredentials(): StudentCredentials {
  const loginCode = generateLoginCode()
  const password = generateSecurePassword()
  
  // Generate a simpler display password for login cards
  const simplePassword = Math.floor(1000 + Math.random() * 9000).toString()
  
  return {
    loginCode,
    password,
    displayPassword: simplePassword
  }
}