'use client'

import { useState, useEffect } from 'react'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { useLoreContext } from '@/contexts/LoreContext'
import FamilyTree from '@/components/FamilyTree'
import { Person } from '@/types/Person'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/use-toast"
import DataManagement from '@/components/DataManagement'
import { ExportedData } from '@/utils/jsonOperations'
import { useAuth } from '@/contexts/AuthContext'

interface FamilyMember extends Person {
  children?: FamilyMember[]
  spouses?: FamilyMember[]
  name: string
}

export default function FamilyPage({ params }: { params: { id: string } }) {
  const { families, people, setPeople, loadFamilyTreeFromKV, saveFamilyTreeToKV } = useFamilyContext()
  const { stories, setStories, getFamilyStories } = useLoreContext()
  const [treeData, setTreeData] = useState<FamilyMember | null>(null)
  const { toast } = useToast()
  const [currentFamily, setCurrentFamily] = useState<{ id: string; name: string } | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        const familyId = params.id
        const family = families.find(family => family.id === familyId) || null
        setCurrentFamily(family)
        if (family) {
          const loadedTreeData = await loadFamilyTreeFromKV(familyId)
          setTreeData(loadedTreeData)
        }
      } catch (error) {
        console.error('Error loading family data:', error)
        toast({
          title: "Error",
          description: "Failed to load family data. Please try again.",
          duration: 5000,
        })
      }
    }

    loadData()
  }, [families, params.id, loadFamilyTreeFromKV, toast])

  const handleUpdateTree = async (updatedTree: FamilyMember) => {
    const familyId = params.id
    setTreeData(updatedTree)
    await saveFamilyTreeToKV(familyId, updatedTree)
  }

  const getData = (): ExportedData => {
    const familyId = params.id
    return {
      familyTree: treeData,
      stories: getFamilyStories(familyId),
      exportDate: new Date().toISOString(),
      familyId: familyId,
      familyName: currentFamily?.name || 'Unknown Family',
    }
  }

  const handleImport = (data: ExportedData) => {
    const familyId = params.id
    if (data.familyId !== familyId) {
      toast({
        title: "Warning",
        description: "The imported data is from a different family. Some data might not be compatible.",
        duration: 5000,
      })
    }

    // Import family tree data
    if (data.familyTree) {
      setTreeData(data.familyTree)
      saveFamilyTreeToKV(familyId, data.familyTree)
    }

    // Import stories
    const familyStories = data.stories.map(story => ({
      ...story,
      familyId: familyId, // Ensure stories are associated with current family
    }))
    setStories(prev => {
      const otherStories = prev.filter(story => story.familyId !== familyId)
      return [...otherStories, ...familyStories]
    })

    toast({
      title: "Import Successful",
      description: "Your family data has been imported successfully.",
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600">{currentFamily?.name || 'Family'} Tree</h1>
          {user?.isAdmin && (
            <DataManagement
              onImport={handleImport}
              getData={getData}
              familyName={currentFamily?.name || 'Unknown Family'}
            />
          )}
        </div>
        {treeData ? (
          <FamilyTree
            initialData={treeData}
            familyId={params.id}
            onUpdate={handleUpdateTree}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <Button
              onClick={() => {
                const familyId = params.id
                setTreeData({
                  id: Date.now().toString(),
                  firstName: 'Root',
                  lastName: 'Person',
                  familyId: familyId,
                  x: 0,
                  y: 0,
                  children: [],
                  dob: '',
                  image: '',
                  name: 'Root Person'
                })
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Create Family Tree
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
