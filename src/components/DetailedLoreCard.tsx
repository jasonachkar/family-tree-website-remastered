'use client'

import { Story } from '@/types/Story'
import { Person } from '@/types/Person'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Heart, X } from 'lucide-react'

interface DetailedLoreCardProps {
  story: Story
  relatedPeople: Person[]
  isOpen: boolean
  onClose: () => void
}

export default function DetailedLoreCard({ story, relatedPeople, isOpen, onClose }: DetailedLoreCardProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-pink-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            {story.title}
            <Heart className="w-5 h-5 text-pink-500" />
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{story.content}</p>
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
              Last updated: {new Date(story.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
