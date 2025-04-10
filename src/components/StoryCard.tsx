'use client'

import { useState, useEffect } from 'react'
import { Story } from '@/types/Story'
import { Person } from '@/types/Person'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Heart, Clock, Users, CalendarClock, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StoryCardProps {
  story: Story
  relatedPeople: Person[]
  onEdit?: (story: Story) => void
  onDelete?: (id: string) => void
}

export default function StoryCard({ story, relatedPeople, onEdit, onDelete }: StoryCardProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false)
  const [currentStory, setCurrentStory] = useState<Story>(story)
  const [editedStory, setEditedStory] = useState<Story>(story)
  const { toast } = useToast()

  // Update local state when prop changes
  useEffect(() => {
    setCurrentStory(story)
    setEditedStory(story)
  }, [story])

  const truncateText = (text: string | undefined | null, maxLength: number = 15): string => {
    if (!text) return ''
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
  }

  const formatLastEdited = (date: string | undefined) => {
    if (!date) return ''
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch (error) {
      return ''
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(story.id)
      toast({
        title: "Story Deleted",
        description: "The story has been successfully deleted."
      })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleEdit = () => {
    if (onEdit && (editedStory.title !== currentStory.title || editedStory.content !== currentStory.content)) {
      const updatedStory = {
        ...editedStory,
        updatedAt: new Date().toISOString()
      }
      onEdit(updatedStory)
      setCurrentStory(updatedStory) // Update the current story state
      toast({
        title: "Story Updated",
        description: "Your changes have been saved successfully.",
        duration: 3000,
      })
      setIsEditDialogOpen(false)
    } else {
      setIsEditDialogOpen(false)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditedStory(currentStory) // Reset edited story to current story
    setIsEditDialogOpen(true)
  }

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className="w-full h-full overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 bg-white"
          onClick={() => setIsDetailedViewOpen(true)}
        >
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-5">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <span className="line-clamp-1">{currentStory.title}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                }}
                className="text-white focus:outline-none"
              >
                <Heart className={`h-5 w-5 transition-all ${isLiked ? 'fill-white' : ''}`} />
              </motion.button>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <p className="text-gray-700 line-clamp-3 mb-2 min-h-[4.5rem]">
              {currentStory.content}
            </p>

            {relatedPeople.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {relatedPeople.slice(0, 3).map(person => (
                  <Badge
                    key={person.id}
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                  >
                    {person.firstName} {person.lastName}
                  </Badge>
                ))}
                {relatedPeople.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    +{relatedPeople.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatLastEdited(currentStory.updatedAt)}</span>
            </div>

            {user?.isAdmin && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditClick}
                    className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleteDialogOpen(true)
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white rounded-lg border-none shadow-lg max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-2 border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-900 break-words">
              {currentStory.title}
            </DialogTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <CalendarClock className="h-4 w-4 mr-1 text-indigo-500" />
              <span>Updated {formatLastEdited(currentStory.updatedAt)}</span>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="py-4 space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentStory.content}
                </p>
              </div>

              {relatedPeople.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-sm font-medium text-gray-700">Related People</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relatedPeople.map(person => (
                      <div
                        key={person.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <Avatar className="h-6 w-6 border border-indigo-200">
                          {person.image ? (
                            <AvatarImage src={person.image} alt={`${person.firstName} ${person.lastName}`} />
                          ) : (
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                              {getInitials(person.firstName, person.lastName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-sm font-medium text-gray-800">
                          {person.firstName} {person.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            {user?.isAdmin && (
              <div className="flex gap-2 mr-auto">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
            <Button
              onClick={() => setIsDetailedViewOpen(false)}
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Story"
        description="Are you sure you want to delete this story? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Story
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
              <Input
                id="title"
                value={editedStory.title}
                onChange={(e) => setEditedStory({ ...editedStory, title: e.target.value })}
                className="border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content" className="text-gray-700 font-medium">Content</Label>
              <Textarea
                id="content"
                value={editedStory.content}
                onChange={(e) => setEditedStory({ ...editedStory, content: e.target.value })}
                className="min-h-[200px] border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setEditedStory(currentStory) // Reset to current story on cancel
                setIsEditDialogOpen(false)
              }}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
