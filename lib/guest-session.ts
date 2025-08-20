'use client'

import { v4 as uuidv4 } from 'uuid'

export interface GuestSession {
  id: string
  assignmentId: string
  assignmentCode: string
  startedAt: Date
  lastActivity: Date
  workData?: {
    excalidrawData?: any
    textContent?: string
    notes?: string
  }
  tempName?: string
}

const GUEST_SESSION_KEY = 'woe_guest_sessions'
const GUEST_CURRENT_KEY = 'woe_current_guest'

export class GuestSessionManager {
  private static instance: GuestSessionManager
  
  static getInstance(): GuestSessionManager {
    if (!GuestSessionManager.instance) {
      GuestSessionManager.instance = new GuestSessionManager()
    }
    return GuestSessionManager.instance
  }

  // Create a new guest session for an assignment
  createGuestSession(assignmentId: string, assignmentCode: string, tempName?: string): GuestSession {
    const session: GuestSession = {
      id: uuidv4(),
      assignmentId,
      assignmentCode,
      startedAt: new Date(),
      lastActivity: new Date(),
      tempName
    }

    // Save session to localStorage
    const sessions = this.getAllGuestSessions()
    sessions[session.id] = session
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessions))
    
    // Set as current session
    this.setCurrentGuestSession(session.id)
    
    return session
  }

  // Get all guest sessions from localStorage
  getAllGuestSessions(): Record<string, GuestSession> {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(GUEST_SESSION_KEY)
      if (!stored) return {}
      
      const sessions = JSON.parse(stored)
      // Convert date strings back to Date objects
      Object.values(sessions).forEach((session: any) => {
        session.startedAt = new Date(session.startedAt)
        session.lastActivity = new Date(session.lastActivity)
      })
      
      return sessions
    } catch {
      return {}
    }
  }

  // Get current guest session
  getCurrentGuestSession(): GuestSession | null {
    if (typeof window === 'undefined') return null
    
    const currentId = localStorage.getItem(GUEST_CURRENT_KEY)
    if (!currentId) return null
    
    const sessions = this.getAllGuestSessions()
    return sessions[currentId] || null
  }

  // Set current guest session
  setCurrentGuestSession(sessionId: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(GUEST_CURRENT_KEY, sessionId)
  }

  // Update guest session work data
  updateGuestWork(sessionId: string, workData: any): void {
    const sessions = this.getAllGuestSessions()
    const session = sessions[sessionId]
    
    if (session) {
      session.workData = workData
      session.lastActivity = new Date()
      sessions[sessionId] = session
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessions))
    }
  }

  // Get guest session by assignment code
  getSessionByCode(assignmentCode: string): GuestSession | null {
    const sessions = this.getAllGuestSessions()
    return Object.values(sessions).find(s => s.assignmentCode === assignmentCode) || null
  }

  // Clear guest session (after account creation)
  clearGuestSession(sessionId: string): void {
    const sessions = this.getAllGuestSessions()
    delete sessions[sessionId]
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessions))
    
    // Clear current if it matches
    const currentId = localStorage.getItem(GUEST_CURRENT_KEY)
    if (currentId === sessionId) {
      localStorage.removeItem(GUEST_CURRENT_KEY)
    }
  }

  // Clear all guest sessions
  clearAllGuestSessions(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(GUEST_SESSION_KEY)
    localStorage.removeItem(GUEST_CURRENT_KEY)
  }

  // Check if user has been working for a while (to prompt account creation)
  shouldPromptAccountCreation(sessionId: string): boolean {
    const session = this.getAllGuestSessions()[sessionId]
    if (!session) return false
    
    const workingTime = Date.now() - session.startedAt.getTime()
    const hasSignificantWork = session.workData && (
      (session.workData.textContent?.length || 0) > 50 ||
      (session.workData.excalidrawData?.elements?.length || 0) > 3
    )
    
    // Prompt after 10 minutes OR if they have significant work
    return workingTime > 10 * 60 * 1000 || Boolean(hasSignificantWork)
  }

  // Get session data for account conversion
  getSessionDataForConversion(sessionId: string) {
    const session = this.getAllGuestSessions()[sessionId]
    return session ? {
      assignmentId: session.assignmentId,
      assignmentCode: session.assignmentCode,
      workData: session.workData,
      tempName: session.tempName,
      startedAt: session.startedAt
    } : null
  }
}