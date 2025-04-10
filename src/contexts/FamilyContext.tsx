"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Person } from "@/types/Person"
import { getKV, setKV } from "@/utils/redis"
import { useUser } from "@clerk/nextjs"
import { uploadImageToBlob } from "@/utils/blobStorage"

interface Family {
  id: string
  name: string
  image: string
  ownerId: string
  createdAt: string
  updatedAt: string
  collaborators?: string[]
  privacyLevel?: 'private' | 'collaborators' | 'public'
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
  addFamily: (name: string, image: string) => Promise<string>
  getAccessibleFamilies: (accessibleFamilyIds: string[]) => Family[]
  inviteCollaborator: (familyId: string, email: string) => Promise<boolean>
  removeCollaborator: (familyId: string, userId: string) => Promise<boolean>
  setFamilyPrivacy: (familyId: string, level: 'private' | 'collaborators' | 'public') => Promise<boolean>
  canUserAccessFamily: (userId: string, familyId: string) => boolean
  getShareableLink: (familyId: string) => string
  exportFamilyTree: (familyId: string, format: 'json' | 'pdf' | 'gedcom') => Promise<string>
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

    try {
      // Upload image to Blob if provided
      let imageUrl = image
      if (image && image.startsWith('data:')) {
        try {
          imageUrl = await uploadImageToBlob(image)
        } catch (error) {
          console.error("Error uploading image:", error)
          throw new Error("Failed to upload family image")
        }
      }

      const newFamily: Family = {
        id: Date.now().toString(),
        name,
        image: imageUrl,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        collaborators: [],
        privacyLevel: 'private'
      }

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

      return newFamily.id
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

  const inviteCollaborator = async (familyId: string, email: string): Promise<boolean> => {
    try {
      if (!isSignedIn || !user) {
        throw new Error("User must be signed in to invite collaborators")
      }

      // Check if user has rights to add collaborators
      const family = families.find(f => f.id === familyId)
      if (!family) {
        throw new Error("Family not found")
      }

      if (family.ownerId !== user.id && !family.collaborators?.includes(user.id)) {
        throw new Error("You don't have permission to invite collaborators")
      }

      // In a real app, you would send an email invitation
      // For now, we'll just simulate by finding the user by email
      // and adding them to collaborators

      // This is a mock API call - replace with actual Clerk API
      // const invitedUser = await clerkClient.users.getUserByEmail(email);
      // For demo, we'll just use email as ID
      const invitedUserId = email

      // Update the family's collaborators
      const updatedFamilies = families.map(f => {
        if (f.id === familyId) {
          const currentCollaborators = f.collaborators || []
          if (currentCollaborators.includes(invitedUserId)) {
            return f // User already a collaborator
          }
          return {
            ...f,
            collaborators: [...currentCollaborators, invitedUserId],
            updatedAt: new Date().toISOString()
          }
        }
        return f
      })

      setFamilies(updatedFamilies)
      await setKV(`families_${user.id}`, updatedFamilies, true)

      return true
    } catch (error) {
      console.error("Error inviting collaborator:", error)
      return false
    }
  }

  const removeCollaborator = async (familyId: string, collaboratorId: string): Promise<boolean> => {
    try {
      if (!isSignedIn || !user) {
        throw new Error("User must be signed in to remove collaborators")
      }

      // Check if user has rights
      const family = families.find(f => f.id === familyId)
      if (!family) {
        throw new Error("Family not found")
      }

      if (family.ownerId !== user.id) {
        throw new Error("Only the owner can remove collaborators")
      }

      // Update the family's collaborators
      const updatedFamilies = families.map(f => {
        if (f.id === familyId) {
          const currentCollaborators = f.collaborators || []
          return {
            ...f,
            collaborators: currentCollaborators.filter(id => id !== collaboratorId),
            updatedAt: new Date().toISOString()
          }
        }
        return f
      })

      setFamilies(updatedFamilies)
      await setKV(`families_${user.id}`, updatedFamilies, true)

      return true
    } catch (error) {
      console.error("Error removing collaborator:", error)
      return false
    }
  }

  const setFamilyPrivacy = async (familyId: string, level: 'private' | 'collaborators' | 'public'): Promise<boolean> => {
    try {
      if (!isSignedIn || !user) {
        throw new Error("User must be signed in to change privacy settings")
      }

      // Check if user has rights
      const family = families.find(f => f.id === familyId)
      if (!family) {
        throw new Error("Family not found")
      }

      if (family.ownerId !== user.id) {
        throw new Error("Only the owner can change privacy settings")
      }

      // Update the family's privacy level
      const updatedFamilies = families.map(f => {
        if (f.id === familyId) {
          return {
            ...f,
            privacyLevel: level,
            updatedAt: new Date().toISOString()
          }
        }
        return f
      })

      setFamilies(updatedFamilies)
      await setKV(`families_${user.id}`, updatedFamilies, true)

      return true
    } catch (error) {
      console.error("Error setting family privacy:", error)
      return false
    }
  }

  const canUserAccessFamily = (userId: string, familyId: string): boolean => {
    const family = families.find(f => f.id === familyId)
    if (!family) return false

    // Owner always has access
    if (family.ownerId === userId) return true

    // Check privacy level
    switch (family.privacyLevel) {
      case 'public':
        return true
      case 'collaborators':
        return family.collaborators?.includes(userId) || false
      case 'private':
      default:
        return family.ownerId === userId
    }
  }

  const getShareableLink = (familyId: string): string => {
    const family = families.find(f => f.id === familyId)
    if (!family) throw new Error("Family not found")

    // In a real app, you might want to generate a secure token
    // For now, just return the direct link
    return `${window.location.origin}/family/${familyId}`
  }

  const exportFamilyTree = async (familyId: string, format: 'json' | 'pdf' | 'gedcom'): Promise<string> => {
    try {
      const treeData = await loadFamilyTreeFromKV(familyId)
      if (!treeData) throw new Error("Tree data not found")

      const family = families.find(f => f.id === familyId)
      if (!family) throw new Error("Family not found")

      // Handle different export formats
      switch (format) {
        case 'json':
          // Create a downloadable JSON file
          const jsonData = JSON.stringify({
            familyTree: treeData,
            family: family,
            exportDate: new Date().toISOString()
          }, null, 2)

          return URL.createObjectURL(new Blob([jsonData], { type: 'application/json' }))

        case 'pdf':
          // In a real app, you would generate a PDF here
          // For now, just return an error message
          throw new Error("PDF export not implemented yet")

        case 'gedcom':
          // In a real app, you would convert to GEDCOM format here
          // For now, just return an error message
          throw new Error("GEDCOM export not implemented yet")

        default:
          throw new Error("Unsupported export format")
      }
    } catch (error) {
      console.error("Error exporting family tree:", error)
      throw error
    }
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
        inviteCollaborator,
        removeCollaborator,
        setFamilyPrivacy,
        canUserAccessFamily,
        getShareableLink,
        exportFamilyTree
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}
