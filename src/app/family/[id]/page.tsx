'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { useLoreContext } from '@/contexts/LoreContext'
import { Person } from '@/types/Person'
import { FamilyMember } from '@/components/FamilyTree'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ExportedData } from '@/utils/jsonOperations'
import { useAuth } from '@/contexts/AuthContext'
import FamilyTreeCanvas from '@/components/FamilyTreeCanvas'
import DataManagement from '@/components/DataManagement'
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GitBranch,
  Book,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Users,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function FamilyPage({ params }: { params: { id: string } }) {
  // Use the useParams hook to properly access the route parameters in client components
  const routeParams = useParams()
  const familyId = routeParams.id as string

  const { families, saveFamilyTreeToKV, loadFamilyTreeFromKV, canUserAccessFamily } = useFamilyContext()
  const { getFamilyStories } = useLoreContext()
  const { toast } = useToast()
  const [treeData, setTreeData] = useState<FamilyMember | null>(null)
  const [family, setFamily] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canAccess, setCanAccess] = useState(false)
  const [history, setHistory] = useState<FamilyMember[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const [memberCount, setMemberCount] = useState(0)
  const [storyCount, setStoryCount] = useState(0)

  const createDefaultTreeData = (familyId: string): FamilyMember => {
    return {
      id: 'root',
      name: 'Root Member',
      firstName: 'Root',
      lastName: 'Member',
      familyId: familyId,
      x: 300,
      y: 100,
      children: [],
      spouses: []
    } as FamilyMember
  }

  // Count family members
  const countFamilyMembers = (node: FamilyMember | null): number => {
    if (!node) return 0

    let count = 1 // Count the root member

    // Count children recursively
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        count += countFamilyMembers(child)
      })
    }

    // Count spouses
    if (node.spouses && node.spouses.length > 0) {
      count += node.spouses.length
    }

    return count
  }

  useEffect(() => {
    const loadData = async () => {
      if (!familyId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setIsRefreshing(true)
        const foundFamily = families.find(f => f.id === familyId) || null
        setFamily(foundFamily)
        setCanAccess(user ? canUserAccessFamily(user.id, familyId) : false)

        let loadedTreeData = null
        if (foundFamily) {
          loadedTreeData = await loadFamilyTreeFromKV(familyId)

          // If no tree data exists yet, create default and save it
          if (!loadedTreeData) {
            console.log('No tree data found, creating default tree')
            loadedTreeData = createDefaultTreeData(familyId)
            await saveFamilyTreeToKV(familyId, loadedTreeData)
          }

          // Count members
          const count = countFamilyMembers(loadedTreeData)
          setMemberCount(count)

          // Count stories
          const stories = getFamilyStories(familyId)
          setStoryCount(stories.length)
        }

        setTreeData(loadedTreeData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading family tree:', error)
        toast({
          title: 'Error',
          description: 'Failed to load family tree'
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    loadData()
  }, [families, familyId, loadFamilyTreeFromKV, saveFamilyTreeToKV, canUserAccessFamily, user, toast, getFamilyStories])

  const handleUpdateTree = async (updatedTree: FamilyMember) => {
    setTreeData(updatedTree)
    await saveFamilyTreeToKV(familyId, updatedTree)
  }

  const getData = (): ExportedData => {
    return {
      familyTree: treeData,
      stories: getFamilyStories(familyId),
      exportDate: new Date().toISOString(),
      familyId: familyId,
      familyName: family?.name || 'Unknown Family',
    }
  }

  const handleImport = (data: ExportedData) => {
    if (!data.familyTree) {
      toast({
        title: 'Error',
        description: 'Invalid import data: Missing family tree structure'
      })
      return
    }

    if (data.familyTree) {
      setTreeData(data.familyTree)
      saveFamilyTreeToKV(familyId, data.familyTree)
    }

    toast({
      title: 'Success',
      description: 'Family tree imported successfully'
    })
  }

  const handleZoomIn = () => {
    setScale(prevScale => prevScale * 1.1)
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale(prevScale => prevScale * 0.9)
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.1))
  }

  const handleZoomReset = () => {
    setScale(1)
    setZoomLevel(1)
  }

  const undoLastChange = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1)
      setTreeData(history[historyIndex - 1])
    }
  }

  const redoChange = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1)
      setTreeData(history[historyIndex + 1])
    }
  }

  const handleRefresh = () => {
    const loadData = async () => {
      try {
        setIsRefreshing(true)
        const loadedTreeData = await loadFamilyTreeFromKV(familyId)
        setTreeData(loadedTreeData)

        // Count members
        const count = countFamilyMembers(loadedTreeData)
        setMemberCount(count)
      } catch (error) {
        console.error('Error refreshing family tree:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    loadData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 text-lg">Loading family tree...</p>
        </div>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this family tree. Please contact the owner for access.
          </p>
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
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
            <span className="text-indigo-600 font-medium">Family Tree</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <GitBranch className="h-7 w-7 mr-2 text-indigo-600" />
                {family?.name} Family Tree
              </h1>
              <p className="text-gray-500 mt-1">
                Visualize and manage your family relationships
              </p>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
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

              <Link href={`/family/${familyId}/lore`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Stories
                </Button>
              </Link>

              <DataManagement
                onImport={handleImport}
                getData={getData}
                familyName={family?.name || 'Unknown Family'}
              />
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Family Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Family Stories</p>
                <p className="text-2xl font-bold text-gray-900">{storyCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <RotateCcw className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">History</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historyIndex > -1 ? `${historyIndex + 1}/${history.length}` : "None"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tree Canvas Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white rounded-lg border border-gray-200 shadow-sm min-h-[calc(100vh-350px)] overflow-hidden"
        >
          <div
            className="family-tree-container w-full overflow-auto min-h-[calc(100vh-350px)]"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.3s ease',
            }}
          >
            <FamilyTreeCanvas familyId={familyId} />
          </div>

          <div className="absolute bottom-0 right-0 p-4 bg-white rounded-tl-lg shadow-md border border-gray-200 text-sm text-gray-500">
            Click on a person to view/edit details. Drag to pan the tree.
          </div>
        </motion.div>
      </div>
    </div>
  )
}
