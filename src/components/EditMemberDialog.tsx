'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FamilyMember } from './FamilyTree'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import Image from 'next/image'
import { ImageIcon, X, Heart } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { uploadImageToBlob, deleteImageFromBlob, getImageFromReference } from '@/utils/blobStorage'

interface EditMemberDialogProps {
  member: FamilyMember
  isOpen: boolean
  onClose: () => void
  onSave: (editedMember: FamilyMember) => void
  onDelete: (id: string, isSpouse: boolean) => void
  isEditing: boolean
  addType: 'child' | 'spouse'
  setAddType: (type: 'child' | 'spouse') => void
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
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  // Resolve image reference if present
  const imageSrc = useMemo(() => {
    if (!editedMember.image) return '';

    if (editedMember.image.startsWith('img-ref:')) {
      const actualImage = getImageFromReference(editedMember.image);
      return actualImage || '';
    }

    return editedMember.image;
  }, [editedMember.image]);

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
    })
  }, [member])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageData = reader.result as string
          const imageUrl = await uploadImageToBlob(imageData)
          setEditedMember({ ...editedMember, image: imageUrl })
        } catch (error) {
          console.error('Error uploading image:', error)
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
          })
        }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageData = reader.result as string
          const imageUrl = await uploadImageToBlob(imageData)
          setEditedMember({ ...editedMember, image: imageUrl })
        } catch (error) {
          console.error('Error uploading image:', error)
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async () => {
    try {
      if (editedMember.image) {
        await deleteImageFromBlob(editedMember.image)
      }
      onDelete(editedMember.id, addType === 'spouse')
      onClose()
    } catch (error) {
      console.error('Error deleting member:', error)
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
      })
    }
  }

  const onSaveClick = () => {
    // Make sure name is set based on first and last name
    const updatedMember = {
      ...editedMember,
      name: `${editedMember.firstName} ${editedMember.lastName}`
    };
    onSave(updatedMember);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-blue-500" />
              {isEditing ? 'Edit Family Member' : 'Add Family Member'}
              <Heart className="w-5 h-5 text-blue-500" />
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
                    className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
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
                    className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
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
                    className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
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
                    className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
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
                  className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
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
                  className="min-h-[100px] border-blue-100 focus:border-blue-300 focus:ring-blue-200"
                  placeholder="Enter description..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Image</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {editedMember.image ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden group">
                        <Image
                          src={imageSrc}
                          alt="Member preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-blue-200"
                            onClick={() => setEditedMember({ ...editedMember, image: '' })}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-blue-400" />
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-blue-500 hover:text-blue-600"
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
                        className="text-blue-500 border-blue-200"
                      />
                      <Label htmlFor="child">Child</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="spouse"
                        id="spouse"
                        className="text-blue-500 border-blue-200"
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
                  onClick={() => setIsDeleteDialogOpen(true)}
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
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                onClick={onSaveClick}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Family Member"
        description="Are you sure you want to delete this family member? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export default EditMemberDialog
