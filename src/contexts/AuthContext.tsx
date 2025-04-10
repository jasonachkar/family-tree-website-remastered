"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { setKV, getKV } from "@/utils/redis"

interface User {
  id: string
  email: string
  isAdmin: boolean
  accessibleFamilies: string[]
  name?: string
  isMinor: boolean
  subscriptionTier: "free" | "premium" | "family"
  subscriptionStatus: "active" | "inactive" | "trialing" | "past_due" | "canceled"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  autoSaveChanges: () => Promise<void>
  updateUserSubscription: (
    tier: "free" | "premium" | "family",
    status: "active" | "inactive" | "trialing" | "past_due" | "canceled",
  ) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      if (isLoaded) {
        if (isSignedIn && clerkUser) {
          try {
            // Try to get user data from KV store
            const userData = await getKV(`user_${clerkUser.id}`)

            if (userData) {
              setUser(userData)
            } else {
              // Create new user data if not found
              const newUser: User = {
                id: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress || "",
                isAdmin: true, // Make all users admins by default
                accessibleFamilies: [],
                name: clerkUser.fullName || "",
                isMinor: false,
                subscriptionTier: "free",
                subscriptionStatus: "active",
              }

              await setKV(`user_${clerkUser.id}`, newUser)
              setUser(newUser)
            }
          } catch (error) {
            console.error("Error loading user data:", error)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    }

    loadUserData()
  }, [isLoaded, isSignedIn, clerkUser])

  const autoSaveChanges = useCallback(async () => {
    // Implement auto-saving logic here if needed
    console.log("Auto-saving changes...")
  }, [])

  const updateUserSubscription = async (
    tier: "free" | "premium" | "family",
    status: "active" | "inactive" | "trialing" | "past_due" | "canceled",
  ) => {
    if (!user || !clerkUser) return

    try {
      const updatedUser = {
        ...user,
        subscriptionTier: tier,
        subscriptionStatus: status,
      }

      await setKV(`user_${clerkUser.id}`, updatedUser)
      setUser(updatedUser)
    } catch (error) {
      console.error("Error updating user subscription:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        autoSaveChanges,
        updateUserSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
