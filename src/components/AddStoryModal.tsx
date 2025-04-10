'use client'

import { useState, useEffect } from 'react'
import { Person } from '@/types/Person'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, BookMarked, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AddStoryModalProps {
  familyId: string
  people: Person[]
  isOpen: boolean
  onClose: () => void
  onAddStory: (story: { title: string; content: string; relatedPeople: string[] }) => void
  onAddPerson: () => void
}

export default function AddStoryModal({
  familyId,
  people,
  isOpen,
  onClose,
  onAddStory,
  onAddPerson,
}: AddStoryModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedPeople, setSelectedPeople] = useState<string[]>([])

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setContent('')
      setSelectedPeople([])
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddStory({
      title,
      content,
      relatedPeople: selectedPeople || [] // Ensure relatedPeople is always an array
    })
  }

  const handlePersonSelect = (personId: string) => {
    if (!selectedPeople.includes(personId)) {
      setSelectedPeople(prev => [...prev, personId])
    }
  }

  const handleRemovePerson = (personId: string) => {
    setSelectedPeople(prev => prev.filter(id => id !== personId))
  }

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white border-none shadow-lg max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-indigo-600" />
            Create a New Family Story
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Document an important memory, tradition, or event from your family's history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-700 font-medium mb-1.5 block">
                Story Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story a meaningful title..."
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-gray-700 font-medium mb-1.5 block">
                Story Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your family story here..."
                className="min-h-[220px] border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-700 font-medium">
                  People in this Story
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddPerson}
                  className="h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Add New Person
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Select onValueChange={handlePersonSelect}>
                  <SelectTrigger className="w-full border-gray-200">
                    <SelectValue placeholder="Select people in this story" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      <SelectGroup>
                        <SelectLabel>Family Members</SelectLabel>
                        {people.length > 0 ? (
                          people.map((person) => (
                            <SelectItem
                              key={person.id}
                              value={person.id}
                              disabled={selectedPeople.includes(person.id)}
                              className="cursor-pointer hover:bg-indigo-50"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  {person.image ? (
                                    <AvatarImage src={person.image} alt={`${person.firstName} ${person.lastName}`} />
                                  ) : (
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                      {getInitials(person.firstName, person.lastName)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                {person.firstName} {person.lastName}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members" disabled>
                            No family members available
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </ScrollArea>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const personId = people.find(p => !selectedPeople.includes(p.id))?.id
                    if (personId) handlePersonSelect(personId)
                  }}
                  disabled={selectedPeople.length === people.length || people.length === 0}
                  className="h-10 w-10 border-gray-200 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              <AnimatePresence>
                {selectedPeople.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-wrap gap-2 mt-3 max-h-[120px] overflow-auto"
                  >
                    {selectedPeople.map(personId => {
                      const person = people.find(p => p.id === personId)
                      if (!person) return null
                      return (
                        <motion.div
                          key={person.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100"
                        >
                          <Avatar className="h-5 w-5">
                            {person.image ? (
                              <AvatarImage src={person.image} alt={`${person.firstName} ${person.lastName}`} />
                            ) : (
                              <AvatarFallback className="bg-indigo-200 text-indigo-700 text-xs">
                                {getInitials(person.firstName, person.lastName)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm text-indigo-700">
                            {person.firstName} {person.lastName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePerson(person.id)}
                            className="ml-1 text-indigo-400 hover:text-indigo-700 focus:outline-none"
                            aria-label={`Remove ${person.firstName} ${person.lastName}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!title.trim() || !content.trim()}
            >
              Save Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
