'use client'

import React from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FamilyMember } from './FamilyTree'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, User, BookOpen } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetailedPersonCardProps {
  person: FamilyMember | null
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

const calculateAge = (dob: string, dod?: string): number => {
  const birthDate = new Date(dob + 'T00:00:00Z')
  const endDate = dod ? new Date(dod + 'T00:00:00Z') : new Date()
  let age = endDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = endDate.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const DetailedPersonCard: React.FC<DetailedPersonCardProps> = ({ person, isOpen, onClose }) => {
  const { user } = useAuth()
  const isMinor = user?.isMinor || false

  if (!person) {
    return null
  }

  const age = calculateAge(person.dob, person.dod)
  const shouldShowDates = user?.isAdmin || person.dod || (!isMinor && age >= 18)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        <DialogHeader className="p-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white relative">
          <DialogTitle className="text-2xl font-bold text-center">
            Get to know me!
          </DialogTitle>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <Heart className="h-6 w-6 fill-current" />
          </motion.div>
        </DialogHeader>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl"
            >
              <Image
                src={person.image || '/placeholder.svg'}
                alt={`${person.firstName} ${person.lastName}`}
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {person.firstName} {person.lastName}
              </h2>
              <div className="h-1 w-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
            </motion.div>
          </div>

          <div className="mt-8 space-y-6">
            <AnimatePresence>
              {shouldShowDates && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {person.dob && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center gap-2 text-pink-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold">Birth Date</span>
                      </div>
                      <p className="text-gray-700">{formatDate(person.dob)}</p>
                    </div>
                  )}
                  {person.dod && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                      <div className="flex items-center gap-2 text-pink-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold">Death Date</span>
                      </div>
                      <p className="text-gray-700">{formatDate(person.dod)}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                    <div className="flex items-center gap-2 text-pink-600 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">Age</span>
                    </div>
                    <p className="text-gray-700">{age} years{person.dod ? ' (Deceased)' : ''}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {person.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100"
              >
                <div className="flex items-center gap-2 text-pink-600 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-semibold">About</span>
                </div>
                <ScrollArea className="h-[200px]">
                  <p className="text-gray-700 whitespace-pre-wrap pr-4">{person.description}</p>
                </ScrollArea>
              </motion.div>
            )}
          </div>
        </div>
        <DialogFooter className="p-4 border-t border-pink-100">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DetailedPersonCard
