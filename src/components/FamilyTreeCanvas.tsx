'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Person } from '@/types/Person'
import { FamilyMember } from './FamilyTree'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Edit2, Trash2, HelpCircle, Save, X, Info } from 'lucide-react'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { getImageFromReference } from '@/utils/blobStorage'
import Image from 'next/image'
import EditMemberDialog from './EditMemberDialog'
import DetailedPersonCard from './DetailedPersonCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

interface FamilyTreeCanvasProps {
  familyId: string
}

export default function FamilyTreeCanvas({ familyId }: FamilyTreeCanvasProps) {
  const { toast } = useToast()
  const { loadFamilyTreeFromKV, saveFamilyTreeToKV } = useFamilyContext()
  const [treeData, setTreeData] = useState<FamilyMember | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [relations, setRelations] = useState<{ from: string, to: string, type: 'parent' | 'spouse' }[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false)
  const [detailedPerson, setDetailedPerson] = useState<FamilyMember | null>(null)
  const [addType, setAddType] = useState<'child' | 'spouse'>('child')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [autoLayout, setAutoLayout] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Load family tree data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await loadFamilyTreeFromKV(familyId)
        if (data) {
          setTreeData(data)
          const flattenedMembers = flattenFamilyTree(data)
          setMembers(flattenedMembers)
          const extractedRelations = extractRelations(data)
          setRelations(extractedRelations)
        } else {
          // Initialize with a root person if no data
          const rootPerson: FamilyMember = {
            id: Date.now().toString(),
            firstName: 'Root',
            lastName: 'Person',
            name: 'Root Person',
            familyId,
            x: window.innerWidth / 2 - 100,
            y: 100,
            children: [],
            spouses: []
          }
          setTreeData(rootPerson)
          setMembers([rootPerson])
        }
      } catch (error) {
        console.error('Error loading family tree:', error)
        toast({
          title: 'Error',
          description: 'Failed to load family tree data.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [familyId, loadFamilyTreeFromKV, toast])

  // Helper function to flatten the family tree for rendering
  const flattenFamilyTree = (root: FamilyMember): FamilyMember[] => {
    const result: FamilyMember[] = [root]

    if (root.children) {
      for (const child of root.children) {
        result.push(...flattenFamilyTree(child))
      }
    }

    if (root.spouses) {
      for (const spouse of root.spouses) {
        result.push(spouse)
      }
    }

    return result
  }

  // Helper function to extract all relationships from the tree
  const extractRelations = (root: FamilyMember): { from: string, to: string, type: 'parent' | 'spouse' }[] => {
    const relations: { from: string, to: string, type: 'parent' | 'spouse' }[] = []

    // Add spouse relationships
    if (root.spouses) {
      for (const spouse of root.spouses) {
        relations.push({
          from: root.id,
          to: spouse.id,
          type: 'spouse'
        })
      }
    }

    // Add parent-child relationships
    if (root.children) {
      for (const child of root.children) {
        relations.push({
          from: root.id,
          to: child.id,
          type: 'parent'
        })

        // Recursive call for children
        relations.push(...extractRelations(child))
      }
    }

    return relations
  }

  // Draw the connecting lines between family members with improved animation and visibility
  const drawConnections = () => {
    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {relations.map(relation => {
          const fromMember = members.find(m => m.id === relation.from)
          const toMember = members.find(m => m.id === relation.to)

          if (!fromMember || !toMember) return null

          // Calculate center points of the cards with better precision
          const fromX = fromMember.x + 80
          const fromY = fromMember.y + 60
          const toX = toMember.x + 80
          const toY = toMember.y + 60

          // Check if path would intersect with any other members
          const willIntersect = members.some(m => {
            if (m.id === fromMember.id || m.id === toMember.id) return false

            // Simple bounding box collision check
            const mLeft = m.x
            const mRight = m.x + 160
            const mTop = m.y
            const mBottom = m.y + 120

            // For spouse connections (direct line)
            if (relation.type === 'spouse') {
              const minX = Math.min(fromX, toX)
              const maxX = Math.max(fromX, toX)
              const minY = Math.min(fromY, toY)
              const maxY = Math.max(fromY, toY)

              return (
                maxX >= mLeft && minX <= mRight &&
                maxY >= mTop && minY <= mBottom
              )
            }

            return false
          })

          let path
          const strokeColor = relation.type === 'spouse' ? "#8b5cf6" : "#6366f1"
          const selectedStrokeColor = relation.type === 'spouse' ? "#7c3aed" : "#4f46e5"
          const isSelected = selectedMember === relation.from || selectedMember === relation.to
          const lineWidth = isSelected ? 3 : 2

          if (relation.type === 'spouse') {
            // For spouse, draw a curved path if there would be an intersection
            if (willIntersect) {
              const midY = (fromY + toY) / 2 - 40 // Curve upward to avoid intersection
              path = `M ${fromX} ${fromY} 
                      Q ${(fromX + toX) / 2} ${midY}, ${toX} ${toY}`
            } else {
              // Direct line with a slight curve for visual appeal
              path = `M ${fromX} ${fromY} 
                      Q ${(fromX + toX) / 2} ${fromY - 10}, ${toX} ${toY}`
            }
          } else {
            // For parent-child, draw a path with vertical and horizontal segments with rounded corners
            const midY = (fromY + toY) / 2

            // Adjust path if it would intersect
            if (willIntersect) {
              // Use a different path to avoid intersection
              path = `M ${fromX} ${fromY} 
                      L ${fromX} ${fromY + 20} 
                      Q ${fromX} ${midY - 10}, ${(fromX + toX) / 2} ${midY}
                      Q ${toX} ${midY + 10}, ${toX} ${toY - 20}
                      L ${toX} ${toY}`
            } else {
              // Standard path with rounded corners
              path = `M ${fromX} ${fromY} 
                      L ${fromX} ${midY - 10}
                      Q ${fromX} ${midY}, ${fromX + 10} ${midY}
                      L ${toX - 10} ${midY}
                      Q ${toX} ${midY}, ${toX} ${midY + 10}
                      L ${toX} ${toY}`
            }
          }

          return (
            <motion.g
              key={`${relation.from}-${relation.to}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                d={path}
                stroke={isSelected ? selectedStrokeColor : strokeColor}
                strokeWidth={lineWidth}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="transition-all duration-300"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {relation.type === 'parent' && (
                <motion.circle
                  cx={toX}
                  cy={toY}
                  r={isSelected ? 4 : 3}
                  fill={isSelected ? selectedStrokeColor : strokeColor}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.2 }}
                />
              )}
            </motion.g>
          )
        })}
      </svg>
    )
  }

  // Handle member position updates with drag events
  const handleDragEnd = (id: string, x: number, y: number) => {
    setMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === id ? { ...member, x, y } : member
      )
    )

    if (treeData) {
      const updatedTree = updatePositionInTree(treeData, id, x, y)
      setTreeData(updatedTree)
      setHasUnsavedChanges(true)
    }
  }

  // Update position in the nested tree structure
  const updatePositionInTree = (node: FamilyMember, id: string, x: number, y: number): FamilyMember => {
    if (node.id === id) {
      return { ...node, x, y }
    }

    const updatedNode = { ...node }

    if (node.children) {
      updatedNode.children = node.children.map(child =>
        updatePositionInTree(child, id, x, y)
      )
    }

    if (node.spouses) {
      updatedNode.spouses = node.spouses.map(spouse =>
        spouse.id === id ? { ...spouse, x, y } : spouse
      )
    }

    return updatedNode
  }

  // Handler for adding a new family member
  const handleAddMember = () => {
    if (!selectedMember) {
      toast({
        title: 'Select a Member',
        description: 'Please select a family member to add a relationship',
      })
      return
    }

    const selectedMemberData = members.find(m => m.id === selectedMember)
    if (!selectedMemberData) return

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      name: '',
      familyId,
      x: selectedMemberData.x + (addType === 'spouse' ? 200 : 0),
      y: selectedMemberData.y + (addType === 'child' ? 200 : 0),
      children: [],
    }

    setEditingMember(newMember)
    setIsEditing(false)
    setIsEditDialogOpen(true)
  }

  // Handler for editing an existing member
  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member)
    setIsEditing(true)
    setIsEditDialogOpen(true)
  }

  // Handler for viewing detailed info of a member
  const handleViewDetails = (member: FamilyMember) => {
    setDetailedPerson(member)
    setIsDetailedViewOpen(true)
  }

  // Modified handler for saving member edit/add with improved positioning
  const handleSaveMember = (updatedMember: FamilyMember) => {
    if (!treeData) return

    // Ensure proper positioning of the member
    if (!isEditing && !updatedMember.x && !updatedMember.y) {
      // This is a new member, let's ensure proper positioning
      const selectedMemberData = members.find(m => m.id === selectedMember)

      if (selectedMemberData) {
        // Dynamic positioning based on relationship type and existing members
        if (addType === 'spouse') {
          // Position spouse next to the selected member with spacing
          // Check if there are existing spouses to avoid overlap
          const existingSpouses = selectedMemberData.spouses?.length || 0
          updatedMember.x = selectedMemberData.x + 200 + (existingSpouses * 40)
          updatedMember.y = selectedMemberData.y
        } else if (addType === 'child') {
          // Position child below parent, with spacing for siblings
          const existingChildren = selectedMemberData.children?.length || 0
          updatedMember.x = selectedMemberData.x - 100 + (existingChildren * 180)
          updatedMember.y = selectedMemberData.y + 200
        }
      }
    }

    if (isEditing) {
      // Update existing member
      const updatedTree = updateMemberInTree(treeData, updatedMember)
      setTreeData(updatedTree)

      // Important: Update both the tree and flattened members list
      const newMembers = flattenFamilyTree(updatedTree)
      setMembers(newMembers)
    } else {
      // Add new member
      const selectedMemberData = members.find(m => m.id === selectedMember)
      if (!selectedMemberData) return

      let updatedTree: FamilyMember

      if (addType === 'child') {
        // Add as child
        updatedTree = addChildToTree(treeData, selectedMember!, updatedMember)

        // Add the relation immediately
        const newRelation = {
          from: selectedMember!,
          to: updatedMember.id,
          type: 'parent' as const
        }
        setRelations(prev => [...prev, newRelation])
      } else {
        // Add as spouse
        updatedTree = addSpouseToTree(treeData, selectedMember!, updatedMember)

        // Add the relation immediately
        const newRelation = {
          from: selectedMember!,
          to: updatedMember.id,
          type: 'spouse' as const
        }
        setRelations(prev => [...prev, newRelation])
      }

      setTreeData(updatedTree)

      // Important: Update members list with the new member
      const newMembers = flattenFamilyTree(updatedTree)
      setMembers(newMembers)
    }

    // Auto-layout the tree if it's getting complex
    if (members.length > 5) {
      optimizeTreeLayout()
    }

    setIsEditDialogOpen(false)
    setHasUnsavedChanges(true)

    // Flash success message
    toast({
      title: isEditing ? 'Member Updated' : 'Member Added',
      description: `${updatedMember.firstName} ${updatedMember.lastName} has been ${isEditing ? 'updated' : 'added'} to the family tree.`
    })
  }

  // Handler for deleting a member
  const handleDeleteMember = (id: string, isSpouse: boolean) => {
    if (!treeData) return

    let updatedTree: FamilyMember

    if (isSpouse) {
      updatedTree = removeSpouseFromTree(treeData, id)
    } else {
      updatedTree = removeMemberFromTree(treeData, id)
    }

    setTreeData(updatedTree)
    setMembers(flattenFamilyTree(updatedTree))
    setRelations(relations.filter(r => r.from !== id && r.to !== id))
    setHasUnsavedChanges(true)
    setIsEditDialogOpen(false)
  }

  // Helper function to update a member in the tree
  const updateMemberInTree = (node: FamilyMember, updatedMember: FamilyMember): FamilyMember => {
    if (node.id === updatedMember.id) {
      return { ...node, ...updatedMember }
    }

    const updatedNode = { ...node }

    if (node.children) {
      updatedNode.children = node.children.map(child =>
        updateMemberInTree(child, updatedMember)
      )
    }

    if (node.spouses) {
      updatedNode.spouses = node.spouses.map(spouse =>
        spouse.id === updatedMember.id ? { ...spouse, ...updatedMember } : spouse
      )
    }

    return updatedNode
  }

  // Helper function to add a child to the tree
  const addChildToTree = (node: FamilyMember, parentId: string, child: FamilyMember): FamilyMember => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), child]
      }
    }

    const updatedNode = { ...node }

    if (node.children) {
      updatedNode.children = node.children.map(c =>
        addChildToTree(c, parentId, child)
      )
    }

    if (node.spouses) {
      updatedNode.spouses = node.spouses.map(spouse =>
        addChildToTree(spouse, parentId, child)
      )
    }

    return updatedNode
  }

  // Helper function to add a spouse to the tree
  const addSpouseToTree = (node: FamilyMember, personId: string, spouse: FamilyMember): FamilyMember => {
    if (node.id === personId) {
      return {
        ...node,
        spouses: [...(node.spouses || []), spouse]
      }
    }

    const updatedNode = { ...node }

    if (node.children) {
      updatedNode.children = node.children.map(child =>
        addSpouseToTree(child, personId, spouse)
      )
    }

    if (node.spouses) {
      updatedNode.spouses = node.spouses.map(s =>
        addSpouseToTree(s, personId, spouse)
      )
    }

    return updatedNode
  }

  // Helper function to remove a member from the tree
  const removeMemberFromTree = (node: FamilyMember, idToRemove: string): FamilyMember => {
    if (node.id === idToRemove) {
      // If this is the node to remove, return null
      return null as unknown as FamilyMember
    }

    const updatedNode = { ...node }

    if (node.children) {
      updatedNode.children = node.children
        .map(child => removeMemberFromTree(child, idToRemove))
        .filter(Boolean) as FamilyMember[]
    }

    if (node.spouses) {
      updatedNode.spouses = node.spouses
        .filter(spouse => spouse.id !== idToRemove)
    }

    return updatedNode
  }

  // Helper function to remove a spouse from the tree
  const removeSpouseFromTree = (node: FamilyMember, spouseId: string): FamilyMember => {
    const updatedNode = { ...node }

    if (node.spouses) {
      updatedNode.spouses = node.spouses.filter(spouse => spouse.id !== spouseId)
    }

    if (node.children) {
      updatedNode.children = node.children.map(child =>
        removeSpouseFromTree(child, spouseId)
      )
    }

    return updatedNode
  }

  // Handler for saving the tree
  const handleSaveTree = async () => {
    if (!treeData || !familyId) return

    try {
      await saveFamilyTreeToKV(familyId, treeData)
      setHasUnsavedChanges(false)
      toast({
        title: 'Success',
        description: 'Family tree saved successfully!',
      })
    } catch (error) {
      console.error('Error saving family tree:', error)
      toast({
        title: 'Error',
        description: 'Failed to save family tree. Please try again.'
      })
    }
  }

  // New function to optimize the layout of the tree
  const optimizeTreeLayout = () => {
    if (!treeData) return

    // Start with the root and work down
    const VERTICAL_SPACING = 200
    const HORIZONTAL_SPACING = 220

    // Create a copy of the tree for layout manipulation
    let optimizedTree = { ...treeData }

    // Recursive function to position a node and its descendants
    const positionNode = (node: FamilyMember, x: number, y: number): FamilyMember => {
      const updatedNode = { ...node, x, y }

      // Position spouses to the right
      if (updatedNode.spouses && updatedNode.spouses.length > 0) {
        const positionedSpouses = updatedNode.spouses.map((spouse, index) => {
          const spouseX = x + HORIZONTAL_SPACING * (index + 1)
          return positionNode(spouse, spouseX, y)
        })
        updatedNode.spouses = positionedSpouses
      }

      // Position children below, centered under parents
      if (updatedNode.children && updatedNode.children.length > 0) {
        const childrenCount = updatedNode.children.length
        const startX = x - ((childrenCount - 1) * HORIZONTAL_SPACING) / 2

        const positionedChildren = updatedNode.children.map((child, index) => {
          const childX = startX + (index * HORIZONTAL_SPACING)
          return positionNode(child, childX, y + VERTICAL_SPACING)
        })

        updatedNode.children = positionedChildren
      }

      return updatedNode
    }

    // Start positioning from the root at center of visible canvas
    const canvasWidth = canvasRef.current?.offsetWidth || 1000
    const startX = canvasWidth / 2
    const startY = 100

    optimizedTree = positionNode(optimizedTree, startX, startY)

    // Update the tree and member positions
    setTreeData(optimizedTree)
    setMembers(flattenFamilyTree(optimizedTree))
  }

  // New function to handle canvas zooming
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    switch (direction) {
      case 'in':
        setZoomLevel(prev => Math.min(prev + 0.1, 2))
        break
      case 'out':
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
        break
      case 'reset':
        setZoomLevel(1)
        setCanvasPosition({ x: 0, y: 0 })
        break
    }
  }

  // Add this effect to handle auto-layout when enabled
  useEffect(() => {
    if (autoLayout && treeData && members.length > 1) {
      optimizeTreeLayout()
    }
  }, [autoLayout, members.length])

  // Enhanced PersonCard component with better animations and visual design
  const PersonCard = ({ member }: { member: FamilyMember }) => {
    const isSelected = selectedMember === member.id

    // Get the actual image source from reference if needed
    const imageSrc = member.image ?
      (member.image.startsWith('img-ref:') ?
        getImageFromReference(member.image) || '/placeholder.svg' :
        member.image) :
      '/placeholder.svg'

    // Use age calculation for better display
    const calculateAge = (dob?: string, dod?: string): string => {
      if (!dob) return 'Age unknown';
      const birthDate = new Date(dob);
      const endDate = dod ? new Date(dod) : new Date();
      let age = endDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = endDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return dod ? `${age} (Deceased)` : `${age} years`;
    };

    return (
      <motion.div
        drag
        dragMomentum={false}
        onDragEnd={(_, info) => {
          handleDragEnd(member.id, member.x + info.offset.x, member.y + info.offset.y)
        }}
        dragConstraints={canvasRef}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 1
        }}
        className={`absolute bg-white rounded-xl overflow-hidden w-[160px] cursor-move z-10
                    ${isSelected
            ? 'ring-2 ring-purple-500 shadow-lg bg-purple-50/30'
            : 'shadow-md hover:shadow-lg border border-gray-100'}`}
        style={{ top: member.y, left: member.x, touchAction: 'none' }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent click from propagating to canvas
          setSelectedMember(member.id);
        }}
        layout
      >
        <div className="p-3 flex flex-col items-center">
          <motion.div
            className="relative w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-indigo-100 group"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Image
              src={imageSrc}
              alt={member.name || 'Family Member'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          <motion.h3
            className="font-medium text-gray-900 text-center truncate w-full"
            layout
          >
            {member.name || `${member.firstName} ${member.lastName}`}
          </motion.h3>

          <motion.div
            className="flex flex-col items-center mt-1 space-y-0.5 w-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.1 }}
          >
            {member.dob && (
              <p className="text-xs text-gray-500 flex items-center">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 mr-1"></span>
                {new Date(member.dob).getFullYear()}
                {member.dod ? ` - ${new Date(member.dod).getFullYear()}` : ''}
              </p>
            )}

            {member.role && (
              <p className="text-xs text-indigo-600 font-medium">
                {member.role}
              </p>
            )}

            {member.dob && (
              <p className="text-xs text-gray-500 italic">
                {calculateAge(member.dob, member.dod)}
              </p>
            )}
          </motion.div>

          <motion.div
            className="flex gap-1 mt-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs bg-white hover:bg-indigo-50 border-indigo-100 hover:border-indigo-200 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleEditMember(member);
              }}
            >
              <Edit2 className="h-3 w-3 mr-1 text-indigo-500" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs bg-white hover:bg-purple-50 border-purple-100 hover:border-purple-200 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(member);
              }}
            >
              View
            </Button>
          </motion.div>
        </div>
        {isSelected && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 10 }}
          />
        )}
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear"
          }}
        />
        <p className="mt-4 text-indigo-600 font-medium">Loading your family tree...</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mb-8">
      {/* Modern Toolbar with improved UI */}
      <div className="mb-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-indigo-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setIsHelpOpen(true)}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Button>

            {/* Help Dialog */}
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <DialogContent className="sm:max-w-md z-50">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-indigo-600" />
                    Family Tree Builder Help
                  </DialogTitle>
                  <DialogDescription>
                    How to use the family tree editor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4 pb-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Basic Controls</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Select:</strong> Click on a person to select them</li>
                      <li><strong>Move:</strong> Drag people to arrange the tree</li>
                      <li><strong>Pan:</strong> Click and drag in empty areas to move around</li>
                      <li><strong>Zoom:</strong> Use zoom buttons at bottom right to zoom in/out</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Building Your Tree</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Add Person:</strong> Select a member, then click "Add Child" or "Add Spouse"</li>
                      <li><strong>Edit Person:</strong> Click on a person and select "Edit"</li>
                      <li><strong>View Details:</strong> Click on a person and select "View"</li>
                      <li><strong>Auto Layout:</strong> Click "Auto Layout" to organize tree automatically</li>
                      <li><strong>Save:</strong> Click "Save Changes" to store your family tree</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" className="bg-indigo-600 hover:bg-indigo-700">
                      Got it!
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex items-center border border-indigo-100 rounded-md overflow-hidden">
              <Button
                variant={addType === 'child' ? "default" : "ghost"}
                size="sm"
                className={`rounded-none ${addType === 'child' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600'}`}
                onClick={() => setAddType('child')}
              >
                Add Child
              </Button>
              <div className="w-px h-6 bg-indigo-100"></div>
              <Button
                variant={addType === 'spouse' ? "default" : "ghost"}
                size="sm"
                className={`rounded-none ${addType === 'spouse' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600'}`}
                onClick={() => setAddType('spouse')}
              >
                Add Spouse
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`ml-2 ${autoLayout ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-600 border-gray-200'}`}
              onClick={() => setAutoLayout(!autoLayout)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Auto Layout {autoLayout ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddMember}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm hover:shadow transition-all"
              disabled={!selectedMember}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add {addType === 'child' ? 'Child' : 'Spouse'}
            </Button>

            <Button
              onClick={handleSaveTree}
              size="sm"
              variant={hasUnsavedChanges ? "default" : "outline"}
              className={hasUnsavedChanges
                ? "bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow transition-all"
                : "text-gray-600 border-gray-200"}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              {hasUnsavedChanges ? "Save Changes" : "Saved"}
            </Button>

            <Button
              onClick={optimizeTreeLayout}
              size="sm"
              variant="outline"
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              Organize
            </Button>
          </div>
        </div>
        {selectedMember && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 flex items-center">
            <span className="mr-2 font-medium">Selected:</span>
            {(() => {
              const selected = members.find(m => m.id === selectedMember)
              return selected ? (
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {selected.firstName} {selected.lastName}
                </span>
              ) : 'Unknown member'
            })()}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-7 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedMember(null)}
            >
              <X className="h-3 w-3 mr-1" />
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Canvas with zoom and pan */}
      <motion.div
        className="relative w-full h-[600px] border border-indigo-100 rounded-lg bg-white/40 backdrop-blur-sm shadow-inner overflow-hidden"
        onMouseDown={(e) => {
          // Only initiate canvas dragging if we click directly on the canvas (not on cards)
          if (!selectedMember && e.target === e.currentTarget) setIsDraggingCanvas(true);
        }}
        onMouseUp={() => setIsDraggingCanvas(false)}
        onMouseLeave={() => setIsDraggingCanvas(false)}
        onMouseMove={(e) => {
          if (isDraggingCanvas) {
            setCanvasPosition(prev => ({
              x: prev.x + e.movementX / zoomLevel,
              y: prev.y + e.movementY / zoomLevel
            }));
          }
        }}
        ref={canvasRef}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px`,
            backgroundSize: `${zoomLevel * 400}px ${zoomLevel * 400}px`,
          }}
        />

        {/* Zoomable content container */}
        <motion.div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomLevel}) translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Connection lines with pointer-events-none to allow clicking through them */}
          <div className="pointer-events-none">
            {drawConnections()}
          </div>

          {/* Person cards */}
          <AnimatePresence>
            {members.map(member => (
              <PersonCard key={member.id} member={member} />
            ))}
          </AnimatePresence>

          {/* Guide message when no selection */}
          {members.length > 0 && !selectedMember && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm max-w-sm text-center border border-indigo-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-600">Click on a family member to select them before adding relationships</p>
            </motion.div>
          )}

          {/* Empty state */}
          {members.length === 0 && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-sm max-w-sm text-center border border-indigo-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-medium text-indigo-700 mb-2">Start Your Family Tree</h3>
              <p className="text-gray-600 mb-4">Add your first family member to begin building your genealogy</p>
              <Button
                onClick={() => {
                  const rootPerson: FamilyMember = {
                    id: Date.now().toString(),
                    firstName: '',
                    lastName: '',
                    name: '',
                    familyId,
                    x: window.innerWidth / 2 - 80,
                    y: 100,
                    children: [],
                  }
                  setEditingMember(rootPerson)
                  setIsEditing(false)
                  setIsEditDialogOpen(true)
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Zoom controls overlay */}
      <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-indigo-100 p-1">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-8 w-8 p-0 text-indigo-700"
            onClick={() => handleZoom('in')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-8 w-8 p-0 text-indigo-700"
            onClick={() => handleZoom('reset')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-8 w-8 p-0 text-indigo-700"
            onClick={() => handleZoom('out')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Edit/Add Member Dialog */}
      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveMember}
          onDelete={handleDeleteMember}
          isEditing={isEditing}
          addType={addType}
          setAddType={setAddType}
        />
      )}

      {/* Detailed View Dialog */}
      {detailedPerson && (
        <DetailedPersonCard
          person={detailedPerson}
          isOpen={isDetailedViewOpen}
          onClose={() => setIsDetailedViewOpen(false)}
        />
      )}
    </div>
  )
}
