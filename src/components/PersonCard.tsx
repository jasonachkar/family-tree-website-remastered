'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FamilyMember } from './FamilyTree'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface PersonCardProps {
  person: FamilyMember
  onEdit: (e: React.MouseEvent) => void
  onViewDetails: (e: React.MouseEvent) => void
  isMinor: boolean
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onEdit, onViewDetails, isMinor }) => {
  const { user } = useAuth()

  const calculateAge = (dob: string | undefined): number => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const truncateText = (text: string, maxLength: number = 15) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00Z')
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  const shouldShowDetails = user?.isAdmin || person.dod || (!isMinor && person.dob && calculateAge(person.dob) >= 18)

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-between p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-pink-200 shadow-md"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={person.image || '/placeholder.svg'}
            alt={`${person.firstName} ${person.lastName}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-110"
          />
        </motion.div>
        <motion.h3
          className="text-lg font-semibold text-center max-w-full px-2 text-gray-800"
          layout
        >
          {truncateText(`${person.firstName} ${person.lastName}`)}
        </motion.h3>
        {shouldShowDetails && (
          <motion.div
            className="text-center mt-2 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {person.dob && (
              <p className="text-sm text-gray-600">
                Born: {formatDate(person.dob)}
              </p>
            )}
            {person.dod && (
              <p className="text-sm text-gray-600">
                Died: {formatDate(person.dod)}
              </p>
            )}
            {person.role && (
              <p className="text-sm text-pink-600 font-medium">
                {truncateText(person.role)}
              </p>
            )}
          </motion.div>
        )}
      </div>
      <div className="mt-auto w-full flex justify-center gap-2">
        {user?.isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px] shadow-sm transition-all duration-300 hover:shadow"
          >
            Edit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px] shadow-sm transition-all duration-300 hover:shadow"
        >
          View
        </Button>
      </div>
    </motion.div>
  )
}

export default PersonCard
