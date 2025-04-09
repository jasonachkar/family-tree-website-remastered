'use client'

import { useState, useEffect } from 'react'
import { Person } from '@/types/Person'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Plus, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm shadow-xl border-pink-100">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            Create a New Memory
            <Sparkles className="h-5 w-5 text-pink-500" />
          </DialogTitle>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a beautiful title..."
              className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700 font-medium">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your precious memory here..."
              className="min-h-[200px] border-pink-100 focus:border-pink-300 focus:ring-pink-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Related People</Label>
            <div className="flex items-center space-x-2">
              <Select onValueChange={handlePersonSelect}>
                <SelectTrigger className="w-full border-pink-100">
                  <SelectValue placeholder="Choose people in this memory" />
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
                            className="cursor-pointer hover:bg-pink-50"
                          >
                            {person.firstName} {person.lastName}
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
                onClick={onAddPerson}
                className="border-pink-200 hover:bg-pink-50"
              >
                <Plus className="h-4 w-4 text-pink-500" />
              </Button>
            </div>
            <AnimatePresence>
              {selectedPeople.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap gap-2 mt-2"
                >
                  {selectedPeople.map(personId => {
                    const person = people.find(p => p.id === personId)
                    if (!person) return null
                    return (
                      <motion.span
                        key={person.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 border border-pink-200"
                      >
                        {person.firstName} {person.lastName}
                        <button
                          type="button"
                          onClick={() => handleRemovePerson(person.id)}
                          className="ml-2 hover:text-pink-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-pink-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-pink-200 hover:bg-pink-50 text-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              Save Memory
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
