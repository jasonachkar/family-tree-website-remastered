'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FamilyMember } from './FamilyTree'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { getImageFromReference } from '@/utils/blobStorage'

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

  const shouldShowDetails = true // Always show details regardless of admin status or age

  // Get the actual image source from reference if needed
  const imageSrc = useMemo(() => {
    if (!person.image) return '/placeholder.svg';

    if (person.image.startsWith('img-ref:')) {
      const actualImage = getImageFromReference(person.image);
      return actualImage || '/placeholder.svg';
    }

    return person.image;
  }, [person.image]);

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-between p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border border-gray-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={imageSrc}
            alt={`${person.firstName} ${person.lastName}`}
            layout="fill"
            objectFit="cover"
            className="transition-all duration-300 hover:scale-105"
          />
        </motion.div>
        <motion.h3
          className="text-base font-semibold text-center max-w-full px-2 text-gray-800"
          layout
        >
          {truncateText(`${person.firstName} ${person.lastName}`, 20)}
        </motion.h3>
        {shouldShowDetails && (
          <motion.div
            className="text-center mt-2 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {person.dob && (
              <p className="text-xs text-gray-600">
                Born: {formatDate(person.dob)}
              </p>
            )}
            {person.dod && (
              <p className="text-xs text-gray-600">
                Died: {formatDate(person.dod)}
              </p>
            )}
            {person.role && (
              <p className="text-xs text-indigo-600 font-medium">
                {truncateText(person.role, 20)}
              </p>
            )}
          </motion.div>
        )}
      </div>
      <div className="mt-auto w-full flex justify-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 min-w-[60px] shadow-sm transition-all duration-200 rounded"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 min-w-[60px] shadow-sm transition-all duration-200 rounded"
        >
          View
        </Button>
      </div>
    </motion.div>
  )
}

export default PersonCard
