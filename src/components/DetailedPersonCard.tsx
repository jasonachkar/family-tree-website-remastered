'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FamilyMember } from './FamilyTree'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, User, BookOpen, MapPin, Star, X } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { getImageFromReference } from '@/utils/blobStorage'
import { cn } from "@/lib/utils"
import { Person } from "@/types/Person"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface DetailedPersonCardProps {
  person: Person | null
  isOpen: boolean
  onClose: () => void
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00Z')
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

const calculateAge = (dob?: string, dod?: string) => {
  if (!dob) return "Not specified"

  const birthDate = new Date(dob)
  const endDate = dod ? new Date(dod) : new Date()
  const ageDiff = endDate.getTime() - birthDate.getTime()
  const ageDate = new Date(ageDiff)
  const age = Math.abs(ageDate.getUTCFullYear() - 1970)

  return age + (dod ? ' (deceased)' : '')
}

const DetailedPersonCard: React.FC<DetailedPersonCardProps> = ({ person, isOpen, onClose }) => {
  const { user } = useAuth()
  const isMinor = user?.isMinor || false
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!person) {
    return null
  }

  const age = calculateAge(person.dob, person.dod)
  const shouldShowDates = true

  // Resolve image reference if needed
  const imageSrc = useMemo(() => {
    if (!person.image) return '/placeholder.svg';

    if (person.image.startsWith('img-ref:')) {
      const actualImage = getImageFromReference(person.image);
      return actualImage || '/placeholder.svg';
    }

    return person.image;
  }, [person.image]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[650px] rounded-xl backdrop-blur-sm bg-white/90 dark:bg-black/90 shadow-xl border-indigo-100 dark:border-indigo-900">
        <DialogTitle asChild>
          <VisuallyHidden>
            {person.firstName} {person.lastName} Details
          </VisuallyHidden>
        </DialogTitle>
        <DialogHeader className="relative p-6 rounded-t-xl bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative overflow-hidden">
              {person.image ? (
                <div className="relative h-36 w-36 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                  >
                    <Image
                      src={person.image}
                      alt={`${person.firstName} ${person.lastName}`}
                      fill
                      className="object-cover"
                      onLoad={() => setImageLoaded(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                </div>
              ) : (
                <div className="h-36 w-36 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700 flex items-center justify-center text-4xl font-bold text-white">
                  {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col text-white">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold tracking-tight">
                  {person.firstName} {person.lastName}
                </h2>
              </motion.div>

              {person.role && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-1"
                >
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    {person.role}
                  </span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mt-3 space-y-1 text-white/90 text-sm"
              >
                {person.dob && (
                  <div>
                    <span className="text-white/70">Born:</span> {new Date(person.dob).toLocaleDateString()}
                  </div>
                )}

                {person.dod && (
                  <div>
                    <span className="text-white/70">Died:</span> {new Date(person.dod).toLocaleDateString()}
                  </div>
                )}

                <div>
                  <span className="text-white/70">Age:</span> {calculateAge(person.dob, person.dod)}
                </div>
              </motion.div>
            </div>
          </div>
        </DialogHeader>

        {person.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="px-6 py-4"
          >
            <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-400">Biography</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {person.description}
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DetailedPersonCard
