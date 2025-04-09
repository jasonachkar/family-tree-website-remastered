'use client'

import { useState, useEffect } from 'react'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { useLoreContext } from '@/contexts/LoreContext'
import { Button } from '@/components/ui/button'
import StoryCard from '@/components/StoryCard'
import AddStoryModal from '@/components/AddStoryModal'
import { Story } from '@/types/Story'
import { Person } from '@/types/Person'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FamilyMember } from '@/components/FamilyTree'
import DataManagement from '@/components/DataManagement'
import { ExportedData } from '@/utils/jsonOperations'
import { useToast } from "@/components/ui/use-toast"
import SplashScreen from '@/components/SplashScreen'

export default function FamilyLorePage({ params }: { params: { id: string } }) {
  const { families, people, setPeople, loadFamilyTreeFromKV, saveFamilyTreeToKV } = useFamilyContext()
  const { getFamilyStories, addStory, updateStory, deleteStory, stories, setStories } = useLoreContext()
  const { user } = useAuth()
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false)
  const [currentFamily, setCurrentFamily] = useState<{ id: string; name: string } | null>(null)
  const [familyPeople, setFamilyPeople] = useState<Person[]>([])
  const [familyStories, setFamilyStories] = useState<Story[]>([])
  const [treeData, setTreeData] = useState<FamilyMember | null>(null)
  const [splashScreen, setSplashScreen] = useState<{ show: boolean; message: string; variant: 'success' | 'error' } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const family = families.find(family => family.id === params.id) || null
        setCurrentFamily(family)
        if (family) {
          const loadedTreeData = await loadFamilyTreeFromKV(params.id)
          setTreeData(loadedTreeData)
          
          // Initialize stories with empty relatedPeople arrays if undefined
          const stories = getFamilyStories(family.id).map(story => ({
            ...story,
            relatedPeople: story.relatedPeople || []
          }))
          setFamilyStories(stories)
          
          // Update people from the tree data
          if (loadedTreeData) {
            const extractedPeople = extractPeopleFromTree(loadedTreeData)
            setFamilyPeople(extractedPeople)
          }
        }
      } catch (error) {
        console.error('Error loading family lore data:', error)
        toast({
          title: "Error",
          description: "Failed to load family lore data. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [families, params.id, getFamilyStories, loadFamilyTreeFromKV, toast])

  useEffect(() => {
    localStorage.setItem(`stories_${params.id}`, JSON.stringify(familyStories))
  }, [familyStories, params.id])

  const extractPeopleFromTree = (node: FamilyMember): Person[] => {
    let people: Person[] = [{
      id: node.id,
      firstName: node.firstName,
      lastName: node.lastName,
      dob: node.dob || '',
      dod: node.dod,
      description: node.description,
      image: node.image || '',
      role: node.role,
      familyId: params.id,
      x: node.x || 0,
      y: node.y || 0
    }]

    if (node.spouses) {
      people = [...people, ...node.spouses.flatMap(spouse => extractPeopleFromTree(spouse))]
    }
    if (node.children) {
      people = [...people, ...node.children.flatMap(child => extractPeopleFromTree(child))]
    }
    return people
  }

  const handleAddStory = async (newStory: { title: string; content: string; relatedPeople: string[] }) => {
    try {
      const story: Story = {
        id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        familyId: params.id,
        title: newStory.title,
        content: newStory.content,
        relatedPeople: newStory.relatedPeople || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const addedStory = await addStory(story)
      setFamilyStories(prev => [...prev, addedStory])
      setIsAddStoryModalOpen(false)
      setSplashScreen({ show: true, message: "Story added successfully!", variant: 'success' })
      toast({
        title: "Story Added",
        description: "Your new story has been added successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error adding story:', error)
      setSplashScreen({ show: true, message: "Failed to add story. Please try again.", variant: 'error' })
      toast({
        title: "Error",
        description: "Failed to add story. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditStory = async (editedStory: Story) => {
    if (!user?.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can edit stories.",
        variant: "destructive",
      })
      return
    }
    try {
      const updatedStory = {
        ...editedStory,
        relatedPeople: editedStory.relatedPeople || [],
        updatedAt: new Date().toISOString(),
      }
      await updateStory(updatedStory.id, updatedStory)
      setFamilyStories(prev => prev.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      ))
      setSplashScreen({ show: true, message: "Story updated successfully!", variant: 'success' })
      toast({
        title: "Story Updated",
        description: "Your story has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error updating story:', error)
      setSplashScreen({ show: true, message: "Failed to update story. Please try again.", variant: 'error' })
      toast({
        title: "Error",
        description: "Failed to update story. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStory = async (id: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete stories.",
        variant: "destructive",
      })
      return
    }
    try {
      await deleteStory(id)
      setFamilyStories(prev => prev.filter(story => story.id !== id))
      setSplashScreen({ show: true, message: "Story deleted successfully!", variant: 'success' })
      toast({
        title: "Story Deleted",
        description: "Your story has been deleted successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error deleting story:', error)
      setSplashScreen({ show: true, message: "Failed to delete story. Please try again.", variant: 'error' })
      toast({
        title: "Error",
        description: "Failed to delete story. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async (data: ExportedData) => {
    try {
      if (data.familyId !== params.id) {
        data.stories = data.stories.map(story => ({
          ...story,
          familyId: params.id,
          relatedPeople: story.relatedPeople || []
        }))
      } else {
        data.stories = data.stories.map(story => ({
          ...story,
          relatedPeople: story.relatedPeople || []
        }))
      }

      if (data.familyTree) {
        setTreeData(data.familyTree)
        await saveFamilyTreeToKV(params.id, data.familyTree)
        
        const extractedPeople = extractPeopleFromTree(data.familyTree)
        setPeople(prev => {
          const otherPeople = prev.filter(person => person.familyId !== params.id)
          return [...otherPeople, ...extractedPeople]
        })
        setFamilyPeople(extractedPeople)
      }

      setStories(prev => {
        const otherStories = prev.filter(story => story.familyId !== params.id)
        return [...otherStories, ...data.stories]
      })
      setFamilyStories(data.stories)
      
      toast({
        title: "Import Successful",
        description: "Your family data has been imported successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error importing data:', error)
      toast({
        title: "Import Failed",
        description: "There was an error importing your family data.",
        variant: "destructive",
      })
    }
  }

  const getData = (): ExportedData => ({
    familyTree: treeData,
    stories: familyStories,
    exportDate: new Date().toISOString(),
    familyId: params.id,
    familyName: currentFamily?.name || 'Unknown Family',
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-pink-600">
            {currentFamily?.name} Family Stories
          </h1>
          <div className="flex gap-4">
            {user?.isAdmin && (
              <Button 
                onClick={() => setIsAddStoryModalOpen(true)} 
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Add New Story
              </Button>
            )}
            {user?.isAdmin && (
              <DataManagement
                onImport={handleImport}
                getData={getData}
                familyName={currentFamily?.name || 'Unknown Family'}
              />
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {familyStories.map((story) => (
              <motion.div
                key={`motion-${story.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <StoryCard
                  key={`story-${story.id}`}
                  story={story}
                  relatedPeople={familyPeople.filter(person => 
                    (story.relatedPeople || []).includes(person.id)
                  )}
                  onEdit={handleEditStory}
                  onDelete={handleDeleteStory}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isAddStoryModalOpen && (
          <AddStoryModal
            familyId={params.id}
            people={familyPeople}
            isOpen={isAddStoryModalOpen}
            onClose={() => setIsAddStoryModalOpen(false)}
            onAddStory={handleAddStory}
            onAddPerson={() => {}}
          />
        )}
        {splashScreen && splashScreen.show && (
          <SplashScreen
            message={splashScreen.message}
            variant={splashScreen.variant}
            duration={3000}
          />
        )}
      </div>
    </div>
  )
}
