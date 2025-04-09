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
import { useAuth } from '@/contexts/AuthContext';

interface FamilyMember extends Person {
  children?: FamilyMember[]
  spouse?: FamilyMember
}

export default function FamilyPage({ params }: { params: { id: string } }) {
  const { families, people, setPeople, loadFamilyTreeFromKV, saveFamilyTreeToKV } = useFamilyContext()
  const { stories, setStories, getFamilyStories } = useLoreContext()
  const [treeData, setTreeData] = useState<FamilyMember | null>(null)
  const { toast } = useToast()
  const [currentFamily, setCurrentFamily] = useState<{ id: string; name: string } | null>(null)
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const family = families.find(family => family.id === params.id) || null
        setCurrentFamily(family)
        if (family) {
          const loadedTreeData = await loadFamilyTreeFromKV(params.id)
          setTreeData(loadedTreeData)
        }
      } catch (error) {
        console.error('Error loading family data:', error)
        toast({
          title: "Error",
          description: "Failed to load family data. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [families, params.id, loadFamilyTreeFromKV, toast])

  const handleUpdateTree = async (updatedTree: FamilyMember) => {
    setTreeData(updatedTree)
    await saveFamilyTreeToKV(params.id, updatedTree)
  }

  const getData = (): ExportedData => {
    return {
      familyTree: treeData,
      stories: getFamilyStories(params.id),
      exportDate: new Date().toISOString(),
      familyId: params.id,
      familyName: currentFamily?.name || 'Unknown Family',
    }
  }

  const handleImport = (data: ExportedData) => {
    if (data.familyId !== params.id) {
      toast({
        title: "Warning",
        description: "The imported data is from a different family. Some data might not be compatible.",
        variant: "destructive",
        duration: 5000,
      })
    }

    // Import family tree data
    if (data.familyTree) {
      setTreeData(data.familyTree)
      saveFamilyTreeToKV(params.id, data.familyTree)
    }

    // Import stories
    const familyStories = data.stories.map(story => ({
      ...story,
      familyId: params.id, // Ensure stories are associated with current family
    }))
    setStories(prev => {
      const otherStories = prev.filter(story => story.familyId !== params.id)
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
              onClick={() => setTreeData({ 
                id: Date.now().toString(), 
                firstName: 'Root', 
                lastName: 'Person', 
                familyId: params.id, 
                x: 0, 
                y: 0,
                children: [] 
              })}
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
