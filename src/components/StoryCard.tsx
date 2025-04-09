'use client'

import { useState, useEffect } from 'react'
import { Story } from '@/types/Story'
import { Person } from '@/types/Person'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from '@/contexts/AuthContext'

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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(story.id)
      toast({
        title: "Story Deleted",
        description: "The story has been successfully deleted.",
        variant: "destructive",
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          className="w-full h-[200px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={() => setIsDetailedViewOpen(true)}
        >
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <span>{truncateText(currentStory.title || '', 30)}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                }}
                className="text-white focus:outline-none"
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
            </CardTitle>
          </CardHeader>
          {currentStory && (
          <CardContent className="p-4">
            <p className="text-gray-700 mb-2">{truncateText(currentStory.content || '', 50)}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {new Date(currentStory.updatedAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {user?.isAdmin && (
                  <>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        className="text-pink-600 border-pink-600 hover:bg-pink-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDeleteDialogOpen(true)
                        }}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
          )}
        </Card>
      </motion.div>

      <Dialog open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-pink-100 [word-break:break-all]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 [word-break:break-all]">
              <Heart className="w-5 h-5 text-pink-500" />
              {currentStory.title}
              <Heart className="w-5 h-5 text-pink-500" />
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap [word-break:break-all]">
                  {currentStory.content}
                </p>
              </div>
              {relatedPeople.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Related People:</h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedPeople.map(person => (
                      <span
                        key={person.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                      >
                        {person.firstName} {person.lastName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-400 pt-4">
                Last updated: {new Date(currentStory.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </ScrollArea>
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
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Edit Story
              <Heart className="w-5 h-5 text-pink-500" />
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
              <Input
                id="title"
                value={editedStory.title}
                onChange={(e) => setEditedStory({ ...editedStory, title: e.target.value })}
                className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content" className="text-gray-700 font-medium">Content</Label>
              <Textarea
                id="content"
                value={editedStory.content}
                onChange={(e) => setEditedStory({ ...editedStory, content: e.target.value })}
                className="min-h-[200px] border-pink-100 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-pink-100">
            <Button
              variant="outline"
              onClick={() => {
                setEditedStory(currentStory) // Reset to current story on cancel
                setIsEditDialogOpen(false)
              }}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
