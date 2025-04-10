'use client'

import { useState, FormEvent, ChangeEvent, useMemo } from 'react'
import { Person } from '@/types/Person'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Pencil, Save, Heart, Calendar, User } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { uploadImageToBlob, deleteImageFromBlob, getImageFromReference } from '@/utils/blobStorage'
import { motion } from 'framer-motion'

interface ViewPersonModalProps {
  person: Person
  onClose: () => void
  onEdit: (editedPerson: Person) => void
  onDelete: (id: string) => void
  isOpen: boolean
}

export default function ViewPersonModal({ person, onClose, onEdit, onDelete, isOpen }: ViewPersonModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPerson, setEditedPerson] = useState<Person>(person)
  const { toast } = useToast()

  // Resolve image references for display
  const imageSrc = useMemo(() => {
    if (!person.image) return '/placeholder.svg';

    if (person.image.startsWith('img-ref:')) {
      const actualImage = getImageFromReference(person.image);
      return actualImage || '/placeholder.svg';
    }

    return person.image;
  }, [person.image]);

  const editedImageSrc = useMemo(() => {
    if (!editedPerson.image) return '/placeholder.svg';

    if (editedPerson.image.startsWith('img-ref:')) {
      const actualImage = getImageFromReference(editedPerson.image);
      return actualImage || '/placeholder.svg';
    }

    return editedPerson.image;
  }, [editedPerson.image]);

  const calculateAge = (dob?: string, dod?: string) => {
    if (!dob) return "Not specified";

    const birthDate = new Date(dob);
    const endDate = dod ? new Date(dod) : new Date();
    const ageDiff = endDate.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    return age + (dod ? ' (deceased)' : '');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPerson(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageData = reader.result as string
          const imageUrl = await uploadImageToBlob(imageData)
          setEditedPerson(prev => ({ ...prev, image: imageUrl }))
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editedPerson.image !== person.image && person.image) {
        await deleteImageFromBlob(person.image)
      }

      const updatedPerson = {
        ...editedPerson,
        name: `${editedPerson.firstName} ${editedPerson.lastName}`
      };

      onEdit(updatedPerson)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Person updated successfully!",
      })
    } catch (error) {
      console.error('Error updating person:', error)
      toast({
        title: "Error",
        description: "Failed to update person. Please try again.",
      })
    }
  }

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Not specified'
    const date = new Date(dateStr + 'T00:00:00Z')
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[700px] max-h-[90vh] p-0 rounded-xl overflow-hidden border border-indigo-100 shadow-xl bg-gradient-to-b from-white to-indigo-50/30 backdrop-blur-sm">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-700">
          <DialogTitle className="text-2xl font-semibold text-white flex items-center gap-2">
            {isEditing ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Edit Person
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                {`${person.firstName} ${person.lastName}`}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.5
                  }}
                >
                  <Heart className="h-5 w-5 text-pink-100 fill-pink-200" />
                </motion.div>
              </motion.span>
            )}
          </DialogTitle>
          <div className="absolute right-4 top-4 flex space-x-2">
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 transition-all duration-200"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="p-6">
          {isEditing ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-indigo-700 mb-1">First Name</label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={editedPerson.firstName}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-indigo-700 mb-1">Last Name</label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={editedPerson.lastName}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-indigo-700 mb-1">Date of Birth</label>
                  <Input
                    type="date"
                    id="dob"
                    name="dob"
                    value={editedPerson.dob}
                    onChange={handleInputChange}
                    className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="dod" className="block text-sm font-medium text-indigo-700 mb-1">Date of Death</label>
                  <Input
                    type="date"
                    id="dod"
                    name="dod"
                    value={editedPerson.dod || ''}
                    onChange={handleInputChange}
                    className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-indigo-700 mb-1">Role</label>
                <Input
                  type="text"
                  id="role"
                  name="role"
                  value={editedPerson.role || ''}
                  onChange={handleInputChange}
                  className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-indigo-700 mb-1">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={editedPerson.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-indigo-700 mb-1">Image</label>
                <div className="rounded-lg border border-dashed border-indigo-300 p-4 hover:border-indigo-500 transition-all bg-indigo-50/50">
                  <Input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="rounded-lg border-indigo-200 file:bg-indigo-500 file:text-white file:border-0 file:rounded-md file:font-medium file:px-3 file:py-2 hover:file:bg-indigo-600 transition-all"
                  />
                  {editedPerson.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 relative h-36 w-36 rounded-lg overflow-hidden mx-auto shadow-md"
                    >
                      <Image
                        src={editedImageSrc}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(person.id)}
                  className="bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  Delete Person
                </Button>
                <div className="space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-[300px_1fr] gap-6"
            >
              <div className="space-y-5">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full aspect-square rounded-xl overflow-hidden border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Image
                    src={imageSrc}
                    alt={`${person.firstName} ${person.lastName}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </motion.div>
                <div className="space-y-2.5 p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
                  <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    Personal Information
                  </h3>
                  <div className="text-sm space-y-2.5">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-indigo-700 min-w-[100px]">Age:</span>
                      <span className="text-gray-800">{calculateAge(person.dob, person.dod)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-indigo-700 min-w-[100px]">Born:</span>
                      <span className="text-gray-800 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        {formatDate(person.dob)}
                      </span>
                    </p>
                    {person.dod && (
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-indigo-700 min-w-[100px]">Died:</span>
                        <span className="text-gray-800 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          {formatDate(person.dod)}
                        </span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-indigo-700 min-w-[100px]">Role:</span>
                      <span className="text-gray-800 italic bg-indigo-50 px-2 py-0.5 rounded-full text-xs">
                        {person.role || 'Not specified'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm h-full">
                  <h3 className="font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Biography</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {person.description || 'No biography available for this person.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}