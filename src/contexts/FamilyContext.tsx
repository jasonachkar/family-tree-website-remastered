"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Person } from "@/types/Person"
import { getKV, setKV } from "@/utils/redis"
import { useUser } from "@clerk/nextjs"

interface Family {
  id: string
  name: string
  image: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface FamilyContextType {
  families: Family[]
  setFamilies: React.Dispatch<React.SetStateAction<Family[]>>
  people: Person[]
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>
  arrows: { start: string; end: string }[]
  setArrows: React.Dispatch<React.SetStateAction<{ start: string; end: string }[]>>
  getFamilyPeople: (familyId: string) => Person[]
  saveFamilyTreeToKV: (familyId: string, treeData: any) => Promise<void>
  loadFamilyTreeFromKV: (familyId: string) => Promise<any>
  addFamily: (name: string, image: string) => Promise<void>
  getAccessibleFamilies: (accessibleFamilyIds: string[]) => Family[]
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export function useFamilyContext() {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error("useFamilyContext must be used within a FamilyProvider")
  }
  return context
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser()
  const [families, setFamilies] = useState<Family[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [arrows, setArrows] = useState<{ start: string; end: string }[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Helper function to check for duplicates
  const hasDuplicates = (existingData: any[], newData: any[]): boolean => {
    if (!existingData || !newData) return false
    return newData.some((newItem) => existingData.some((existingItem) => existingItem.id === newItem.id))
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isSignedIn && user) {
          // Get user-specific families
          const userFamilies = await getKV(`families_${user.id}`)
          if (userFamilies) {
            setFamilies(userFamilies)
          }

          // Get people data for user's families
          const userPeople = await getKV(`people_${user.id}`)
          if (userPeople) {
            setPeople(userPeople)
          }

          // Get arrow data for user's families
          const userArrows = await getKV(`arrows_${user.id}`)
          if (userArrows) {
            setArrows(userArrows)
          }
        } else {
          // For demo purposes, load some sample data
          const kvFamilies = await getKV("families")
          const kvPeople = await getKV("people")
          const kvArrows = await getKV("arrows")

          if (kvFamilies) setFamilies(kvFamilies)
          if (kvPeople) setPeople(kvPeople)
          if (kvArrows) setArrows(kvArrows)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("Error loading data:", error)
        setIsInitialized(true)
      }
    }

    loadData()
  }, [isSignedIn, user])

  useEffect(() => {
    const saveData = async () => {
      if (!isInitialized) return

      try {
        if (isSignedIn && user) {
          // Save user-specific data
          await setKV(`families_${user.id}`, families, true)
          await setKV(`people_${user.id}`, people, true)
          await setKV(`arrows_${user.id}`, arrows, true)
        } else {
          // For demo purposes, save to general storage
          await setKV("families", families, true)
          await setKV("people", people, true)
          await setKV("arrows", arrows, true)
        }
      } catch (error) {
        console.error("Error saving data:", error)
      }
    }

    saveData()
  }, [families, people, arrows, isInitialized, isSignedIn, user])

  const getFamilyPeople = (familyId: string) => {
    return people.filter((person) => person.familyId === familyId)
  }

  const saveFamilyTreeToKV = async (familyId: string, treeData: any): Promise<void> => {
    try {
      if (!familyId) {
        throw new Error("Family ID is required")
      }

      if (!treeData) {
        throw new Error("Tree data is required")
      }

      const key = isSignedIn && user ? `familyTree_${user.id}_${familyId}` : `familyTree_${familyId}`

      await setKV(key, treeData, true)

      // Update the family's updatedAt timestamp
      setFamilies((prev) =>
        prev.map((family) => (family.id === familyId ? { ...family, updatedAt: new Date().toISOString() } : family)),
      )
    } catch (error: any) {
      console.error("Error saving family tree:", {
        message: error.message,
        stack: error.stack,
      })
      throw error
    }
  }

  const loadFamilyTreeFromKV = async (familyId: string) => {
    try {
      if (!familyId) {
        throw new Error("Family ID is required")
      }

      const key = isSignedIn && user ? `familyTree_${user.id}_${familyId}` : `familyTree_${familyId}`

      const storedData = await getKV(key)
      return storedData
    } catch (error: any) {
      console.error("Error loading family tree:", {
        message: error.message,
        stack: error.stack,
      })
      return null
    }
  }

  const addFamily = async (name: string, image: string) => {
    if (!isSignedIn || !user) {
      throw new Error("User must be signed in to add a family")
    }

    const newFamily: Family = {
      id: Date.now().toString(),
      name,
      image,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const updatedFamilies = [...families, newFamily]
      setFamilies(updatedFamilies)
      await setKV(`families_${user.id}`, updatedFamilies, true)

      // Also update the user's accessible families
      const userData = await getKV(`user_${user.id}`)
      if (userData) {
        const updatedUserData = {
          ...userData,
          accessibleFamilies: [...userData.accessibleFamilies, newFamily.id],
        }
        await setKV(`user_${user.id}`, updatedUserData, true)
      }
    } catch (error) {
      console.error("Error saving new family:", error)
      throw error
    }
  }

  const getAccessibleFamilies = (accessibleFamilyIds: string[]) => {
    return families.filter((family) => accessibleFamilyIds.includes(family.id))
  }

  const setFamiliesWithValidation = (newFamilies: Family[] | ((prev: Family[]) => Family[])) => {
    const updatedFamilies = typeof newFamilies === "function" ? newFamilies(families) : newFamilies

    if (updatedFamilies.length === 0 && families.length > 0) {
      console.warn("Attempted to set empty families array when data exists")
      return
    }

    setFamilies(updatedFamilies)
  }

  return (
    <FamilyContext.Provider
      value={{
        families,
        setFamilies: setFamiliesWithValidation,
        people,
        setPeople,
        arrows,
        setArrows,
        getFamilyPeople,
        saveFamilyTreeToKV,
        loadFamilyTreeFromKV,
        addFamily,
        getAccessibleFamilies,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}
