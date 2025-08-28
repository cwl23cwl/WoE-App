import { create } from 'zustand'
import { User } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      // Mock login - replace with actual auth logic
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'TEACHER',
        createdAt: new Date(),
      }
      set({ user: mockUser, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  logout: () => {
    set({ user: null })
  },
  setUser: (user) => {
    set({ user })
  },
}))