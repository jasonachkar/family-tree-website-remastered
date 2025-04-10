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
import { use } from 'react'
import {
  Book,
  Search,
  Plus,
  ArrowLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Filter,
  CalendarRange
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

export default function FamilyLorePage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params promise
  const { id } = use(params)
  const { families, people, setPeople, loadFamilyTreeFromKV, saveFamilyTreeToKV } = useFamilyContext()
  const { getFamilyStories, addStory, updateStory, deleteStory, stories, setStories } = useLoreContext()
  const { user } = useAuth()
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false)
  const [currentFamily, setCurrentFamily] = useState<{ id: string; name: string } | null>(null)
  const [familyPeople, setFamilyPeople] = useState<Person[]>([])
  const [familyStories, setFamilyStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [treeData, setTreeData] = useState<FamilyMember | null>(null)
  const [splashScreen, setSplashScreen] = useState<{ show: boolean; message: string; variant: 'success' | 'error' } | null>(null)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("newest")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<string | null>("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsRefreshing(true)
        const family = families.find(family => family.id === id) || null
        setCurrentFamily(family)
        if (family) {
          const loadedTreeData = await loadFamilyTreeFromKV(id)
          setTreeData(loadedTreeData)

          // Initialize stories with empty relatedPeople arrays if undefined
          const stories = getFamilyStories(family.id).map(story => ({
            ...story,
            relatedPeople: story.relatedPeople || []
          }))
          setFamilyStories(stories)
          setFilteredStories(stories)

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
          description: "Failed to load family lore data. Please try again."
        })
      } finally {
        setIsRefreshing(false)
      }
    }

    loadData()
  }, [families, id, getFamilyStories, loadFamilyTreeFromKV, toast])

  // Filter stories based on search query, sort option, and person filter
  useEffect(() => {
    let filtered = [...familyStories]

    // Apply person filter
    if (selectedPerson && selectedPerson !== "all") {
      filtered = filtered.filter(story =>
        story.relatedPeople && story.relatedPeople.includes(selectedPerson)
      )
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.content.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else if (sortOption === "oldest") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      } else if (sortOption === "alphabetical") {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    setFilteredStories(filtered)
  }, [familyStories, searchQuery, sortOption, selectedPerson])

  useEffect(() => {
    localStorage.setItem(`stories_${id}`, JSON.stringify(familyStories))
  }, [familyStories, id])

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
      familyId: id,
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
        familyId: id,
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
        description: "Failed to add story. Please try again."
      })
    }
  }

  const handleEditStory = async (editedStory: Story) => {
    if (!user?.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can edit stories."
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
        description: "Failed to update story. Please try again."
      })
    }
  }

  const handleDeleteStory = async (id: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete stories."
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
        description: "Failed to delete story. Please try again."
      })
    }
  }

  const handleImport = async (data: ExportedData) => {
    try {
      if (data.familyId !== id) {
        data.stories = data.stories.map(story => ({
          ...story,
          familyId: id,
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
        await saveFamilyTreeToKV(id, data.familyTree)

        const extractedPeople = extractPeopleFromTree(data.familyTree)
        setPeople(prev => {
          const otherPeople = prev.filter(person => person.familyId !== id)
          return [...otherPeople, ...extractedPeople]
        })
        setFamilyPeople(extractedPeople)
      }

      setStories(prev => {
        const otherStories = prev.filter(story => story.familyId !== id)
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
        description: "There was an error importing your family data."
      })
    }
  }

  const getData = (): ExportedData => ({
    familyTree: treeData,
    stories: familyStories,
    exportDate: new Date().toISOString(),
    familyId: id,
    familyName: currentFamily?.name || 'Unknown Family',
  })

  const handleRefresh = () => {
    const loadData = async () => {
      try {
        setIsRefreshing(true)
        const family = families.find(family => family.id === id) || null
        if (family) {
          const stories = getFamilyStories(family.id).map(story => ({
            ...story,
            relatedPeople: story.relatedPeople || []
          }))
          setFamilyStories(stories)
        }
      } catch (error) {
        console.error('Error refreshing stories:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 md:py-12">
        {/* Header with breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/dashboard" className="hover:text-indigo-600 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <Link href={`/family/${id}`} className="hover:text-indigo-600">
              {currentFamily?.name || "Family"}
            </Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-indigo-600 font-medium">Stories</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Book className="h-7 w-7 mr-2 text-indigo-600" />
                {currentFamily?.name} Family Stories
              </h1>
              <p className="text-gray-500 mt-1">
                Documenting the special memories and traditions of your family
              </p>
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-indigo-600"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>

              {user?.isAdmin && (
                <Button
                  onClick={() => setIsAddStoryModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
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
          </div>
        </div>

        {/* Filters and search section */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-gray-200"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-gray-400 hidden sm:block" />
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full sm:w-36 border-gray-200">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                  <Select value={selectedPerson || "all"} onValueChange={setSelectedPerson}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-200">
                      <SelectValue placeholder="Filter by Person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All People</SelectItem>
                      {familyPeople.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stories grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={`motion-${story.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No stories found</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {searchQuery || selectedPerson
                ? "No stories matching your current filters."
                : "You haven't added any stories to this family tree yet."}
            </p>
            {user?.isAdmin && (
              <Button
                onClick={() => setIsAddStoryModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Story
              </Button>
            )}
          </div>
        )}

        {isAddStoryModalOpen && (
          <AddStoryModal
            familyId={id}
            people={familyPeople}
            isOpen={isAddStoryModalOpen}
            onClose={() => setIsAddStoryModalOpen(false)}
            onAddStory={handleAddStory}
            onAddPerson={() => { }}
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
