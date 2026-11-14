import { createAuthClient } from 'better-auth/react'
import { useEffect, useState } from 'react'
import type { User, UserRole } from '../types'

export const authClient = createAuthClient({
  baseURL: '/api/auth',
})

export type { User, UserRole }

export const { useSession, signIn, signUp, signOut } = authClient

export function useAuth() {
  const { data: session, isPending, error } = useSession()
  const [mockUser, setMockUser] = useState<User | null>(null)

  // Sync with the mock API's localStorage session so the frontend works
  // end-to-end without a real backend. When a real backend is swapped in,
  // useSession() becomes the source of truth.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mock_user')
      setMockUser(stored ? (JSON.parse(stored) as unknown as User) : null)
    } catch {
      setMockUser(null)
    }
  }, [])

  const user: User | null = (session?.user as unknown as User) || mockUser

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
    isCompany: user?.role === 'company',
    isUser: user?.role === 'user',
    login: signIn,
    register: signUp,
    logout: () => {
      signOut()
      localStorage.removeItem('mock_user')
    },
    error,
  }
}
