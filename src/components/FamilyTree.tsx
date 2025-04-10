'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
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
import { uploadImageToBlob, deleteImageFromBlob, getImageFromReference } from '@/utils/blobStorage';

export interface FamilyMember extends Person {
  children?: FamilyMember[]
  spouses?: FamilyMember[]
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

      // Make sure the name is set correctly based on first and last name
      updatedMember.name = `${updatedMember.firstName} ${updatedMember.lastName}`;

      if (updatedMember.image && updatedMember.image !== member.image && updatedMember.image.startsWith('data:')) {
        const imageUrl = await uploadImageToBlob(updatedMember.image)
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
        await deleteImageFromBlob(member.image)
      }
      onDelete(member.id, false)
      onClose()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] rounded-lg border border-gray-200 shadow-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold text-center text-indigo-600 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-indigo-500" />
            {isEditing ? 'Edit Family Member' : 'Add Family Member'}
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
                  className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-md"
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
                  className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-md"
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
                  className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-md"
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
                  className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-md"
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
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-md"
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
                className="min-h-[100px] border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-md"
                placeholder="Enter description..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Image</Label>
              <div
                className={`relative border border-dashed rounded-md p-4 transition-colors duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
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
                    <div className="relative w-28 h-28 rounded-full overflow-hidden group shadow-sm">
                      <Image
                        src={editedMember.image}
                        alt="Member preview"
                        fill
                        className="object-cover transition-all duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-indigo-200"
                          onClick={() => setEditedMember({ ...editedMember, image: '' })}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-indigo-400" />
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-indigo-500 hover:text-indigo-600"
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
                      className="text-indigo-500 border-gray-300"
                    />
                    <Label htmlFor="child">Child</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="spouse"
                      id="spouse"
                      className="text-indigo-500 border-gray-300"
                    />
                    <Label htmlFor="spouse">Spouse</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="flex justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(member.id, false)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm hover:shadow transition-all duration-200"
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
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm hover:shadow transition-all duration-200"
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: "easeOut"
      }}
      onClick={() => setSelectedNode(nodeDatum.id)}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <foreignObject width={240} height={340} x={-120} y={-150}>
        <motion.div
          className={`relative bg-white border ${selectedNode === nodeDatum.id
            ? 'border-indigo-500 shadow-md'
            : 'border-gray-200'
            } rounded-lg p-4 transition-all duration-200 hover:shadow-sm`}
          onDoubleClick={(e) => {
            e.stopPropagation()
            handleDoubleClick(nodeDatum)
          }}
          initial={false}
          animate={{
            scale: selectedNode === nodeDatum.id ? 1.02 : 1,
            boxShadow: selectedNode === nodeDatum.id ? '0 4px 12px -2px rgba(79, 70, 229, 0.1)' : 'none'
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
        <g transform="translate(300, 0)">
          <foreignObject width={240} height={340} x={-120} y={-150}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
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
            d="M-240,0 H-120"
            stroke="#6366F1"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </g>
      )}
    </motion.g>
  )

  const handleUpdateMember = async (updatedMember: FamilyMember) => {
    if (updatedMember.image && updatedMember.image.startsWith('data:')) {
      try {
        const imageUrl = await uploadImageToBlob(updatedMember.image);
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

    // If a new person is being added (no id yet), generate an id
    if (!updatedMember.id) {
      updatedMember.id = Date.now().toString();

      // Set name for display
      updatedMember.name = `${updatedMember.firstName} ${updatedMember.lastName}`;

      // If it's a child, add to children array
      if (addType === 'child' && editingMember) {
        const parent = findNodeInTree(treeData, editingMember.id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(updatedMember);
        }
      }
      // If it's a spouse, add to spouses array
      else if (addType === 'spouse' && editingMember) {
        const person = findNodeInTree(treeData, editingMember.id);
        if (person) {
          if (!person.spouses) {
            person.spouses = [];
          }
          person.spouses.push(updatedMember);
        }
      }
    }

    const updatedTree = updateNodeInTree(treeData, updatedMember);
    setTreeData(updatedTree);
    setHasUnsavedChanges(true);
    toast({
      title: "Changes Pending",
      description: "Click 'Save Changes' to permanently save your updates.",
    });
  };

  const handleDeleteMember = async (memberId: string, isSpouse: boolean) => {
    const memberToDelete = findNodeInTree(treeData, memberId);
    if (memberToDelete && memberToDelete.image) {
      try {
        await deleteImageFromBlob(memberToDelete.image);
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

      // Sanitize the tree data before saving to KV storage 
      // to prevent "Failed to fetch" errors due to large payloads
      const sanitizedTreeData = sanitizeTreeForStorage(treeData);

      // Make sure to save the current tree data to KV
      await saveFamilyTreeToKV(familyId, sanitizedTreeData)

      // Call onUpdate with the latest tree data
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

  // Helper function to sanitize tree data before saving to KV
  // This ensures we don't include large image data URLs in the KV storage
  const sanitizeTreeForStorage = (tree: FamilyMember): FamilyMember => {
    // Create a deep copy with image references kept intact
    // (they are already in the form img-ref:id)
    const sanitized = { ...tree };

    // Process children recursively if they exist
    if (sanitized.children && sanitized.children.length > 0) {
      sanitized.children = sanitized.children.map(child =>
        sanitizeTreeForStorage(child)
      );
    }

    // Process spouses recursively if they exist
    if (sanitized.spouses && sanitized.spouses.length > 0) {
      sanitized.spouses = sanitized.spouses.map(spouse =>
        sanitizeTreeForStorage(spouse)
      );
    }

    return sanitized;
  };

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
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-indigo-50/30 to-purple-50/30 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4 p-4 bg-white/70 backdrop-blur-sm shadow-sm">
          <h2 className="text-2xl font-bold text-indigo-600">{treeData.name || 'Family Tree'}</h2>
          <div className="flex gap-4">
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all duration-300 rounded-md"
            >
              Add Family Member
            </Button>
            <Button
              onClick={saveChanges}
              disabled={!hasUnsavedChanges}
              variant={hasUnsavedChanges ? "default" : "outline"}
              className={hasUnsavedChanges
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all duration-300 rounded-md"
                : "bg-white/50 text-indigo-600 hover:bg-indigo-50 border-indigo-200 rounded-md"}
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

        <div className="h-[calc(100vh-120px)] relative border border-gray-200 rounded-lg overflow-hidden bg-white/95 mx-4">
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white/90 p-2 rounded-md shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              onClick={() => document.querySelector('.rd3t-tree-container')?.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))}
            >
              +
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              onClick={() => document.querySelector('.rd3t-tree-container')?.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))}
            >
              -
            </Button>
          </div>
          <Tree
            data={treeData}
            renderCustomNodeElement={(rd3tProps) => renderNodeContent({ ...rd3tProps, nodeDatum: rd3tProps.nodeDatum as unknown as FamilyMember })}
            orientation="vertical"
            pathFunc="step"
            translate={{ x: window.innerWidth / 2, y: 150 }}
            separation={{ siblings: 2.5, nonSiblings: 3.5 }}
            nodeSize={{ x: 320, y: 350 }}
            rootNodeClassName="node__root"
            branchNodeClassName="node__branch"
            leafNodeClassName="node__leaf"
            pathClassFunc={() => 'tree-link'}
            transitionDuration={800}
            zoomable={true}
            scaleExtent={{ min: 0.4, max: 1.5 }}
            initialDepth={0}
            zoom={0.7}
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
.tree-link {
  stroke: #6366F1;
  stroke-width: 1.5px;
  fill: none;
}

.rd3t-link {
  stroke: #6366F1;
  stroke-width: 1.5px;
}

.node__root > circle,
.node__branch > circle,
.node__leaf > circle {
  fill: transparent;
  stroke: transparent;
}

.rd3t-tree-container {
  background-color: transparent;
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
