'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('currentUser')
      if (!storedUser && !loading && pathname !== '/login' && pathname !== '/signup') {
        router.push('/login')
      } else if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.sessionToken !== user?.sessionToken) {
          logout()
          router.push('/login')
        }
      }
    }

    checkSession()
  }, [user, loading, router, pathname, logout])

  if (loading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
