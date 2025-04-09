'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FamilyMember } from './FamilyTree'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface CombinedSpouseCardProps {
  spouses: FamilyMember[]
  onEdit: (spouse: FamilyMember) => void
  onDelete: (spouseId: string) => void
  onViewDetails: (spouse: FamilyMember) => void
  selectedNode: string | null
  setSelectedNode: (id: string | null) => void
}

const CombinedSpouseCard: React.FC<CombinedSpouseCardProps> = ({
  spouses,
  onEdit,
  onDelete,
  onViewDetails,
  selectedNode,
  setSelectedNode
}) => {
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

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(spouses.length > 1)
  const [cardHeight, setCardHeight] = useState(220)

  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const updateArrows = (index: number) => {
    setShowLeftArrow(index > 0)
    setShowRightArrow(index < spouses.length - 1)
  }

  useEffect(() => {
    updateArrows(currentIndex)
  }, [currentIndex, spouses.length])

  useEffect(() => {
    const currentSpouse = spouses[currentIndex]
    if (!currentSpouse) return

    let newHeight = 220
    
    if (currentSpouse.dob) newHeight += 20
    if (currentSpouse.dod) newHeight += 20
    if (currentSpouse.role) newHeight += 20
    
    setCardHeight(newHeight)
  }, [currentIndex, spouses])

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => Math.min(spouses.length - 1, prevIndex + 1))
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00Z')
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  const handleDelete = (e: React.MouseEvent, spouseId: string) => {
    e.stopPropagation()
    onDelete(spouseId)
    if (currentIndex >= spouses.length - 1) {
      setCurrentIndex(Math.max(0, spouses.length - 2))
    }
  }

  if (spouses.length === 0) {
    return null
  }

  const currentSpouse = spouses[currentIndex]
  if (!currentSpouse) {
    return null
  }

  const shouldShowDetails = user?.isAdmin || currentSpouse.dod || (!user?.isMinor && calculateAge(currentSpouse.dob) >= 18)

  return (
    <div 
      className="w-[200px] bg-white bg-opacity-90 border-2 border-pink-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative overflow-hidden"
      style={{ height: `${cardHeight}px` }}
    >
      <div className="h-full flex flex-col items-center justify-between p-4">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
            <Image
              src={currentSpouse.image || '/placeholder.svg'}
              alt={`${currentSpouse.firstName} ${currentSpouse.lastName}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-center max-w-full px-2">
            {truncateText(`${currentSpouse.firstName} ${currentSpouse.lastName}`)}
          </h3>
          {shouldShowDetails && (
            <>
              {currentSpouse.dob && (
                <p className="text-sm text-gray-600 text-center mt-1">
                  Born: {formatDate(currentSpouse.dob)}
                </p>
              )}
              {currentSpouse.dod && (
                <p className="text-sm text-gray-600 text-center mt-1">
                  Died: {formatDate(currentSpouse.dod)}
                </p>
              )}
              {currentSpouse.role && (
                <p className="text-sm text-gray-600 text-center mt-1">
                  {truncateText(currentSpouse.role)}
                </p>
              )}
            </>
          )}
        </div>
        <div className="mt-auto w-full flex justify-center gap-2">
          {user?.isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(currentSpouse)
                }}
                className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px]"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDelete(e, currentSpouse.id)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 min-w-[60px]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(currentSpouse)
            }}
            className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px]"
          >
            View
          </Button>
        </div>
      </div>
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      {spouses.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {spouses.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CombinedSpouseCard
