"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Story } from "@/types/Story"
import { getKV, setKV } from "@/utils/redis"
import { useUser } from "@clerk/nextjs"

interface LoreContextType {
  stories: Story[]
  setStories: React.Dispatch<React.SetStateAction<Story[]>>
  addStory: (story: Omit<Story, "id" | "createdAt" | "updatedAt">) => Promise<Story>
  updateStory: (id: string, story: Partial<Story>) => Promise<void>
  deleteStory: (id: string) => Promise<void>
  getFamilyStories: (familyId: string) => Story[]
}

const LoreContext = createContext<LoreContextType | undefined>(undefined)

export function useLoreContext() {
  const context = useContext(LoreContext)
  if (context === undefined) {
    throw new Error("useLoreContext must be used within a LoreProvider")
  }
  return context
}

export function LoreProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser()
  const [stories, setStories] = useState<Story[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Helper function to check for duplicates
  const hasDuplicates = (existingData: Story[], newData: Story[]): boolean => {
    if (!existingData || !newData) return false
    return newData.some((newItem) => existingData.some((existingItem) => existingItem.id === newItem.id))
  }

  useEffect(() => {
    const loadStories = async () => {
      try {
        if (isSignedIn && user) {
          // Get user-specific stories
          const userStories = await getKV(`stories_${user.id}`)
          if (userStories) {
            setStories(userStories)
          }
        } else {
          // For demo purposes, load some sample data
          const kvStories = await getKV("stories")
          if (kvStories) {
            setStories(kvStories)
          }
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("Error loading stories:", error)
        setIsInitialized(true)
      }
    }

    loadStories()
  }, [isSignedIn, user])

  useEffect(() => {
    const saveStories = async () => {
      if (!isInitialized) return

      try {
        if (isSignedIn && user) {
          // Save user-specific stories
          await setKV(`stories_${user.id}`, stories, true)
        } else {
          // For demo purposes, save to general storage
          await setKV("stories", stories, true)
        }
      } catch (error) {
        console.error("Error saving stories:", error)
      }
    }

    saveStories()
  }, [stories, isInitialized, isSignedIn, user])

  const setStoriesWithValidation = (newStories: Story[] | ((prev: Story[]) => Story[])) => {
    const updatedStories = typeof newStories === "function" ? newStories(stories) : newStories

    if (updatedStories.length === 0 && stories.length > 0) {
      console.warn("Attempted to set empty stories array when data exists")
      return
    }

    setStories(updatedStories)
  }

  const addStory = async (story: Omit<Story, "id" | "createdAt" | "updatedAt">): Promise<Story> => {
    if (!isSignedIn || !user) {
      throw new Error("User must be signed in to add a story")
    }

    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedPeople: story.relatedPeople || [],
    }

    try {
      const updatedStories = [...stories, newStory]
      setStoriesWithValidation(updatedStories)
      await setKV(`stories_${user.id}`, updatedStories, true)
    } catch (error) {
      console.error("Error adding story:", error)
      throw error
    }

    return newStory
  }

  const updateStory = async (id: string, storyUpdate: Partial<Story>): Promise<void> => {
    if (!isSignedIn || !user) {
      throw new Error("User must be signed in to update a story")
    }

    const updatedStories = stories.map((story) =>
      story.id === id ? { ...story, ...storyUpdate, updatedAt: new Date().toISOString() } : story,
    )

    try {
      setStoriesWithValidation(updatedStories)
      await setKV(`stories_${user.id}`, updatedStories, true)
    } catch (error) {
      console.error("Error updating story:", error)
      throw error
    }
  }

  const deleteStory = async (id: string): Promise<void> => {
    if (!isSignedIn || !user) {
      throw new Error("User must be signed in to delete a story")
    }

    const updatedStories = stories.filter((story) => story.id !== id)

    try {
      setStoriesWithValidation(updatedStories)
      await setKV(`stories_${user.id}`, updatedStories, true)
    } catch (error) {
      console.error("Error deleting story:", error)
      throw error
    }
  }

  const getFamilyStories = (familyId: string): Story[] => {
    return stories.filter((story) => story.familyId === familyId)
  }

  return (
    <LoreContext.Provider
      value={{
        stories,
        setStories: setStoriesWithValidation,
        addStory,
        updateStory,
        deleteStory,
        getFamilyStories,
      }}
    >
      {children}
    </LoreContext.Provider>
  )
}
