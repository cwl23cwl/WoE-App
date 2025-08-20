import { Role } from '@prisma/client'

type Session = {
  user: {
    id: string
    email: string
    name: string
    role: Role
    avatar?: string
  }
} | null

export async function getSession(): Promise<Session> {
  // This will be implemented later when we need server-side auth
  return null
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function requireRole(role: Role) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error('Forbidden')
  }
  return user
}

export function isTeacher(role: Role) {
  return role === 'TEACHER'
}

export function isStudent(role: Role) {
  return role === 'STUDENT'
}

export function isAdmin(role: Role) {
  return role === 'ADMIN'
}