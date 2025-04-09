'use client'

import { useState, useRef, useEffect } from 'react'
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
import { uploadImageToBlob, deleteImageFromBlob } from '@/utils/blobStorage';

interface EditMemberDialogProps {
  member: FamilyMember
  isOpen: boolean
  onClose: () => void
  onSave: (editedMember: FamilyMember) => void
  onDelete: (id: string) => void
  isEditing: boolean
  addType: 'child' | 'spouse'
  setAddType: (type: 'child' | 'spouse') => void
}

export default function EditMemberDialog({
  member,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isEditing,
  addType,
  setAddType,
}: EditMemberDialogProps) {
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageUrl = await uploadImageToBlob(reader.result as string);
          setEditedMember({ ...editedMember, image: imageUrl })
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
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
          const imageUrl = await uploadImageToBlob(reader.result as string);
          setEditedMember({ ...editedMember, image: imageUrl })
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = () => {
    onDelete(member.id)
    toast({
      title: "Member Deleted",
      description: "The family member has been successfully removed.",
      variant: "destructive",
    })
    onClose()
    setIsDeleteDialogOpen(false)
  }

  const handleImageDelete = async () => {
    if (editedMember.image) {
      try {
        await deleteImageFromBlob(editedMember.image);
        setEditedMember({ ...editedMember, image: '' });
      } catch (error) {
        console.error('Error deleting image:', error);
        toast({
          title: "Image Deletion Failed",
          description: "Failed to delete image. Please try again.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <>
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
                    value={editedMember.dod || ''}
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
                  value={editedMember.role || ''}
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
                  value={editedMember.description || ''}
                  onChange={(e) => setEditedMember({ ...editedMember, description: e.target.value })}
                  className="min-h-[100px] border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                  placeholder="Enter description..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Image</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                    isDragging ? 'border-pink-500 bg-pink-50' : 'border-pink-200 hover:border-pink-300'
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
                            onClick={handleImageDelete}
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
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSave(editedMember)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
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
