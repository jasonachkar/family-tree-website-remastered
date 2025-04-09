'use client'

import React, { useState, useRef, useEffect } from 'react'
import Tree from 'react-d3-tree'
import { Person } from '@/types/Person'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useFamilyContext } from '@/contexts/FamilyContext'
import DetailedPersonCard from './DetailedPersonCard'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import PersonCard from './PersonCard'
import { Heart, ImageIcon, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from "@/components/ui/scroll-area"
import CombinedSpouseCard from './CombinedSpouseCard';
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import SplashScreen from './SplashScreen'
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/utils/supabaseStorage';

export interface FamilyMember extends Person {
  children?: FamilyMember[]
  spouses?: FamilyMember[]
  dob?: string
  dod?: string
  image?: string
  name: string
}

interface FamilyTreeProps {
  initialData: FamilyMember
  familyId: string
  onUpdate: (updatedTree: FamilyMember) => void
}

interface EditMemberDialogProps {
  member: FamilyMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: FamilyMember) => void;
  onDelete: (id: string, isSpouse: boolean) => void;
  isEditing: boolean;
  addType: 'child' | 'spouse';
  setAddType: (type: 'child' | 'spouse') => void;
}

const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isEditing,
  addType,
  setAddType,
}) => {
  const [editedMember, setEditedMember] = useState<FamilyMember>({
    ...member,
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    dob: member.dob || '',
    dod: member.dod || '',
    image: member.image || '',
    role: member.role || '',
    description: member.description || '',
    name: member.name || '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setEditedMember({
      ...member,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      dob: member.dob || '',
      dod: member.dod || '',
      image: member.image || '',
      role: member.role || '',
      description: member.description || '',
      name: member.name || '',
    })
  }, [member])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedMember({ ...editedMember, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedMember({ ...editedMember, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const updatedMember = { ...editedMember }
      if (updatedMember.image && updatedMember.image !== member.image && updatedMember.image.startsWith('data:')) {
        const imageUrl = await uploadImageToSupabase(updatedMember.image)
        updatedMember.image = imageUrl
      }
      onSave(updatedMember)
      onClose()
    } catch (error) {
      console.error('Error saving member:', error)
    }
  }

  const handleDelete = async () => {
    try {
      if (member.image && !member.image.startsWith('data:')) {
        await deleteImageFromSupabase(member.image)
      }
      onDelete(member.id, false)
      onClose()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            {isEditing ? 'Edit Family Member' : 'Add Family Member'}
            <Heart className="w-5 h-5 text-pink-500" />
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="grid gap-4 py-4 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={editedMember.firstName}
                  onChange={(e) => setEditedMember({ ...editedMember, firstName: e.target.value })}
                  className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                  placeholder="Enter first name..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={editedMember.lastName}
                  onChange={(e) => setEditedMember({ ...editedMember, lastName: e.target.value })}
                  className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                  placeholder="Enter last name..."
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-gray-700 font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={editedMember.dob}
                  onChange={(e) => setEditedMember({ ...editedMember, dob: e.target.value })}
                  className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dod" className="text-gray-700 font-medium">
                  Date of Death
                </Label>
                <Input
                  id="dod"
                  type="date"
                  value={editedMember.dod}
                  onChange={(e) => setEditedMember({ ...editedMember, dod: e.target.value })}
                  className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700 font-medium">
                Role
              </Label>
              <Input
                id="role"
                value={editedMember.role}
                onChange={(e) => setEditedMember({ ...editedMember, role: e.target.value })}
                className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                placeholder="Enter role..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={editedMember.description}
                onChange={(e) => setEditedMember({ ...editedMember, description: e.target.value })}
                className="min-h-[100px] border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                placeholder="Enter description..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Image</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDragging ? 'border-pink-500 bg-pink-50' : 'border-pink-200 hover:border-pink-300'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  {editedMember.image ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden group">
                      <Image
                        src={editedMember.image}
                        alt="Member preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-pink-200"
                          onClick={() => setEditedMember({ ...editedMember, image: '' })}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 text-pink-400" />
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-pink-500 hover:text-pink-600"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose a file
                        </Button>
                        <p className="text-sm text-gray-500">or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Add as</Label>
                <RadioGroup
                  value={addType}
                  onValueChange={(value) => setAddType(value as 'child' | 'spouse')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="child"
                      id="child"
                      className="text-pink-500 border-pink-200"
                    />
                    <Label htmlFor="child">Child</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="spouse"
                      id="spouse"
                      className="text-pink-500 border-pink-200"
                    />
                    <Label htmlFor="spouse">Spouse</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="flex justify-between px-6 py-4">
          <div className="flex gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(member.id, false)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Member
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ initialData, familyId, onUpdate }) => {
  useEffect(() => {
    localStorage.setItem('currentFamilyId', familyId)
    return () => {
      localStorage.removeItem('currentFamilyId')
    }
  }, [familyId])
  const { saveFamilyTreeToKV, loadFamilyTreeFromKV } = useFamilyContext()
  const { user } = useAuth()
  const [treeData, setTreeData] = useState<FamilyMember>(initialData)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [addType, setAddType] = useState<'child' | 'spouse'>('child')
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [detailedPersonOpen, setDetailedPersonOpen] = useState(false)
  const [detailedPerson, setDetailedPerson] = useState<FamilyMember | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; isSpouse: boolean } | null>(null);
  const { toast } = useToast()
  const [splashScreen, setSplashScreen] = useState<{ show: boolean; message: string; variant: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const loadTreeData = async () => {
      try {
        const loadedData = await loadFamilyTreeFromKV(familyId)
        if (loadedData) {
          setTreeData(loadedData)
        }
      } catch (error) {
        console.error('Error loading family tree:', error)
        toast({
          title: "Error",
          description: "Failed to load family tree data.",
        })
      }
    }

    loadTreeData()
  }, [familyId, loadFamilyTreeFromKV, toast])

  const handleDoubleClick = (person: FamilyMember) => {
    setDetailedPerson(person)
    setDetailedPersonOpen(true)
  }

  const renderNodeContent = ({ nodeDatum }: { nodeDatum: FamilyMember }) => (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
      onClick={() => setSelectedNode(nodeDatum.id)}
      whileHover={{ scale: 1.02 }}
    >
      <foreignObject width={250} height={400} x={-125} y={-150}>
        <motion.div
          className={`relative bg-white/95 backdrop-blur-sm border-2 ${selectedNode === nodeDatum.id
            ? 'border-pink-500 shadow-lg shadow-pink-200/50'
            : 'border-pink-300'
            } rounded-xl p-4 transition-all duration-300 hover:shadow-xl`}
          onDoubleClick={(e) => {
            e.stopPropagation()
            handleDoubleClick(nodeDatum)
          }}
          initial={false}
          animate={{
            scale: selectedNode === nodeDatum.id ? 1.02 : 1,
            borderWidth: selectedNode === nodeDatum.id ? '3px' : '2px'
          }}
        >
          <PersonCard
            person={nodeDatum}
            isMinor={user?.isMinor || false}
            onEdit={(e) => {
              e.stopPropagation()
              setEditingMember(nodeDatum)
              setIsEditing(true)
              setIsDialogOpen(true)
            }}
            onViewDetails={(e) => {
              e.stopPropagation()
              handleDoubleClick(nodeDatum)
            }}
          />
        </motion.div>
      </foreignObject>
      {nodeDatum.spouses && nodeDatum.spouses.length > 0 && (
        <g transform="translate(350, 0)">
          <foreignObject width={250} height={400} x={-125} y={-150}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CombinedSpouseCard
                spouses={nodeDatum.spouses}
                isMinor={user?.isMinor || false}
                onEdit={(spouse) => {
                  setEditingMember(spouse)
                  setIsEditing(true)
                  setIsDialogOpen(true)
                }}
                onViewDetails={handleDoubleClick}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                onDelete={(spouseId) => handleDeleteMember(spouseId, true)}
              />
            </motion.div>
          </foreignObject>
          <motion.path
            d="M-250,0 L-125,0"
            stroke="#F472B6"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </g>
      )}
    </motion.g>
  )

  const handleUpdateMember = async (updatedMember: FamilyMember) => {
    if (updatedMember.image && updatedMember.image.startsWith('data:')) {
      try {
        const imageUrl = await uploadImageToSupabase(updatedMember.image);
        updatedMember.image = imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
        });
        return;
      }
    }

    setTreeData(updateNodeInTree(treeData, updatedMember));
    onUpdate(treeData);
  };

  const handleDeleteMember = async (memberId: string, isSpouse: boolean) => {
    const memberToDelete = findNodeInTree(treeData, memberId);
    if (memberToDelete && memberToDelete.image) {
      try {
        await deleteImageFromSupabase(memberToDelete.image);
      } catch (error) {
        console.error('Error deleting image:', error);
        toast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
        });
      }
    }

    const updatedTree = isSpouse
      ? removeSpouseFromTree(treeData, memberId)
      : removeNodeFromTree(treeData, memberId);

    setTreeData(updatedTree);
    onUpdate(updatedTree);
    setSelectedNode(null);
  };

  const saveChanges = async () => {
    try {
      if (!familyId) {
        throw new Error('Family ID is required')
      }

      if (!treeData) {
        throw new Error('Tree data is missing')
      }

      await saveFamilyTreeToKV(familyId, treeData)
      onUpdate(treeData)
      setHasUnsavedChanges(false)
      setSplashScreen({ show: true, message: "Changes saved successfully!", variant: 'success' })
      toast({
        title: "Changes Saved",
        description: "Your family tree has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error saving changes:', error)
      setSplashScreen({ show: true, message: "Save was not successful. Please try again.", variant: 'error' })
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
      })
    }
  }

  const findMemberById = (node: FamilyMember, id: string): FamilyMember | undefined => {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const child = node.children.find(child => child.id === id);
      if (child) return child;
    }
    if (node.spouses) {
      const spouse = node.spouses.find(spouse => spouse.id === id);
      if (spouse) return spouse;
    }
    return undefined;
  };

  const findNodeInTree = (node: FamilyMember, id: string): FamilyMember | undefined => {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const child = node.children.find(child => child.id === id);
      if (child) return child;
    }
    if (node.spouses) {
      const spouse = node.spouses.find(spouse => spouse.id === id);
      if (spouse) return spouse;
    }
    return undefined;
  };

  const updateNodeInTree = (node: FamilyMember, updatedMember: FamilyMember): FamilyMember => {
    if (node.id === updatedMember.id) {
      return { ...node, ...updatedMember };
    }
    if (node.spouses?.some(spouse => spouse.id === updatedMember.id)) {
      return {
        ...node,
        spouses: node.spouses.map(spouse =>
          spouse.id === updatedMember.id ? { ...spouse, ...updatedMember } : spouse
        )
      };
    }
    return {
      ...node,
      children: node.children?.map(child => updateNodeInTree(child, updatedMember)),
      spouses: node.spouses?.map(spouse => updateNodeInTree(spouse, updatedMember))
    };
  };

  const removeSpouseFromTree = (node: FamilyMember, spouseId: string): FamilyMember => {
    if (node.spouses) {
      const updatedSpouses = node.spouses.filter(spouse => spouse.id !== spouseId);
      return {
        ...node,
        spouses: updatedSpouses
      };
    }
    return node;
  };

  const removeNodeFromTree = (node: FamilyMember, id: string): FamilyMember => {
    if (node.id === id) {
      return {
        id: '',
        firstName: '',
        lastName: '',
        familyId: node.familyId,
        x: 0,
        y: 0,
        name: ''
      };
    }
    if (node.children) {
      const updatedChildren = node.children.map(child => removeNodeFromTree(child, id)).filter((child): child is FamilyMember => child !== null);
      return {
        ...node,
        children: updatedChildren
      };
    }
    if (node.spouses) {
      const updatedSpouses = node.spouses.map(spouse => removeNodeFromTree(spouse, id)).filter((spouse): spouse is FamilyMember => spouse !== null);
      return {
        ...node,
        spouses: updatedSpouses
      };
    }
    return node;
  };

  return (
    <div className="h-screen w-full relative overflow-hidden" style={{
      backgroundImage: 'url("/family-tree-bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div className="absolute inset-0 bg-white bg-opacity-50"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4 p-4 bg-white bg-opacity-80">
          <div className="flex gap-4">
            {user?.isAdmin && (
              <Button
                onClick={() => {
                  setEditingMember({
                    id: '',
                    firstName: '',
                    lastName: '',
                    familyId: treeData.familyId,
                    x: 0,
                    y: 0,
                    dob: '',
                    dod: '',
                    image: '',
                    role: '',
                    description: '',
                    name: ''
                  })
                  setIsEditing(false)
                  setIsDialogOpen(true)
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Add Family Member
              </Button>
            )}
            <Button
              onClick={saveChanges}
              disabled={!hasUnsavedChanges}
              variant={hasUnsavedChanges ? "default" : "outline"}
              className={hasUnsavedChanges
                ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                : "bg-white/50 text-pink-500 hover:bg-pink-50 border-pink-200"}
            >
              {hasUnsavedChanges ? "Save Changes" : "No Changes"}
            </Button>
          </div>
        </div>

        <EditMemberDialog
          member={editingMember || {
            id: '',
            firstName: '',
            lastName: '',
            familyId: treeData.familyId,
            x: 0,
            y: 0,
            dob: '',
            dod: '',
            image: '',
            role: '',
            description: '',
            name: ''
          }}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleUpdateMember}
          onDelete={handleDeleteMember}
          isEditing={isEditing}
          addType={addType}
          setAddType={setAddType}
        />

        <DetailedPersonCard
          person={detailedPerson}
          isOpen={detailedPersonOpen}
          onClose={() => setDetailedPersonOpen(false)}
        />

        <div className="h-[calc(100vh-100px)] relative border-2 border-pink-200 rounded-xl overflow-hidden bg-gradient-to-br from-pink-50/50 to-purple-50/50">
          <Tree
            data={treeData}
            renderCustomNodeElement={(rd3tProps) => renderNodeContent({ ...rd3tProps, nodeDatum: rd3tProps.nodeDatum as unknown as FamilyMember })}
            orientation="vertical"
            pathFunc="step"
            translate={{ x: window.innerWidth / 2, y: 100 }}
            separation={{ siblings: 3, nonSiblings: 4 }}
            nodeSize={{ x: 400, y: 400 }}
            rootNodeClassName="node__root"
            branchNodeClassName="node__branch"
            leafNodeClassName="node__leaf"
            pathClassFunc={() => 'text-pink-400 transition-all duration-300'}
            transitionDuration={800}
            zoomable={true}
            scaleExtent={{ min: 0.5, max: 1.5 }}
          />
        </div>
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setMemberToDelete(null)
          }}
          onConfirm={() => {
            if (memberToDelete) {
              handleDeleteMember(memberToDelete.id, memberToDelete.isSpouse)
            }
          }}
          title="Delete Family Member"
          description="Are you sure you want to delete this family member? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
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

const styles = `
.rd3t-link {
  stroke: #663399;
  stroke-width: 2px;
}
.node__root > circle,
.node__branch > circle,
.node__leaf > circle {
  fill: transparent;
  stroke: transparent;
}
`;

export default function FamilyTreeWithStyles({ initialData, familyId, onUpdate }: FamilyTreeProps) {
  return (
    <>
      <style jsx global>{styles}</style>
      <FamilyTree initialData={initialData} familyId={familyId} onUpdate={onUpdate} />
    </>
  );
}
