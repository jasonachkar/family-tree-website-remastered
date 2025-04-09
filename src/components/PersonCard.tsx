'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FamilyMember } from './FamilyTree'
import { useAuth } from '@/contexts/AuthContext'

interface PersonCardProps {
  person: FamilyMember
  onEdit: (e: React.MouseEvent) => void
  onViewDetails: (e: React.MouseEvent) => void
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onEdit, onViewDetails }) => {
  const { user } = useAuth()

  const calculateAge = (dob: string): number => {
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

  const shouldShowDetails = user?.isAdmin || person.dod || (!user?.isMinor && calculateAge(person.dob) >= 18)

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
          <Image
            src={person.image || '/placeholder.svg'}
            alt={`${person.firstName} ${person.lastName}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <h3 className="text-lg font-semibold text-center max-w-full px-2">
          {truncateText(`${person.firstName} ${person.lastName}`)}
        </h3>
        {shouldShowDetails && (
          <div className="text-center mt-1">
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
              <p className="text-sm text-gray-600">
                {truncateText(person.role)}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-auto w-full flex justify-center gap-2">
        {user?.isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px]"
          >
            Edit
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewDetails}
          className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px]"
        >
          View
        </Button>
      </div>
    </div>
  )
}

export default PersonCard
