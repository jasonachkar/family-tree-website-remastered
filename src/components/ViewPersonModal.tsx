'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { Person } from '@/types/Person'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Pencil, Save } from 'lucide-react'

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

  const calculateAge = (dob: string, dod?: string): string => {
    const birthDate = new Date(dob);
    const endDate = dod ? new Date(dod) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    if (dod) {
      return `${age} (Deceased)`;
    }
    return age.toString();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPerson(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedPerson(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onEdit(editedPerson);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            {isEditing ? 'Edit Person' : `${person.firstName} ${person.lastName}`}
          </DialogTitle>
          <div className="absolute right-4 top-4 flex space-x-2">
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="icon"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={editedPerson.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={editedPerson.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <Input
                    type="date"
                    id="dob"
                    name="dob"
                    value={editedPerson.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dod" className="block text-sm font-medium text-gray-700">Date of Death (if applicable)</label>
                  <Input
                    type="date"
                    id="dod"
                    name="dod"
                    value={editedPerson.dod || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <Input
                  type="text"
                  id="role"
                  name="role"
                  value={editedPerson.role || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={editedPerson.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                <Input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="destructive" onClick={() => onDelete(person.id)}>
                  Delete Person
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              <div className="space-y-4">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={person.image || '/placeholder.svg'}
                    alt={`${person.firstName} ${person.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Personal Information</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Age:</span> {calculateAge(person.dob, person.dod)}</p>
                    <p><span className="font-medium">Date of Birth:</span> {new Date(person.dob).toLocaleDateString()}</p>
                    {person.dod && (
                      <p><span className="font-medium">Date of Death:</span> {new Date(person.dod).toLocaleDateString()}</p>
                    )}
                    <p><span className="font-medium">Role:</span> {person.role || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {person.description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
