'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FamilyMember } from './FamilyTree'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

interface CombinedSpouseCardProps {
  spouses: FamilyMember[]
  onEdit: (spouse: FamilyMember) => void
  onViewDetails: (person: FamilyMember) => void
  selectedNode: string | null
  setSelectedNode: (id: string | null) => void
  onDelete: (spouseId: string) => Promise<void>
  isMinor: boolean
}

const CombinedSpouseCard: React.FC<CombinedSpouseCardProps> = ({
  spouses,
  onEdit,
  onViewDetails,
  selectedNode,
  setSelectedNode,
  onDelete,
  isMinor
}) => {
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

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200">
          <Heart className="w-4 h-4 text-indigo-500" />
        </div>
      </motion.div>
      <AnimatePresence>
        {spouses.map((spouse, index) => {
          // Always show details
          const shouldShowDetails = true

          return (
            <motion.div
              key={spouse.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`relative bg-white border ${selectedNode === spouse.id
                ? 'border-indigo-500 shadow-md'
                : 'border-gray-200'
                } rounded-lg p-3 mb-3 last:mb-0 transition-all duration-200 hover:shadow-sm`}
              onClick={() => setSelectedNode(spouse.id)}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border border-gray-200 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={spouse.image || '/placeholder.svg'}
                    alt={`${spouse.firstName} ${spouse.lastName}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-all duration-300 hover:scale-105"
                  />
                </motion.div>
                <motion.h3
                  className="text-base font-semibold text-center max-w-full px-2 text-gray-800"
                  layout
                >
                  {truncateText(`${spouse.firstName} ${spouse.lastName}`, 20)}
                </motion.h3>
                {shouldShowDetails && (
                  <motion.div
                    className="text-center mt-2 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {spouse.dob && (
                      <p className="text-xs text-gray-600">
                        Born: {formatDate(spouse.dob)}
                      </p>
                    )}
                    {spouse.dod && (
                      <p className="text-xs text-gray-600">
                        Died: {formatDate(spouse.dod)}
                      </p>
                    )}
                    {spouse.role && (
                      <p className="text-xs text-indigo-600 font-medium">
                        {truncateText(spouse.role, 20)}
                      </p>
                    )}
                  </motion.div>
                )}
                <div className="mt-auto w-full flex justify-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(spouse)
                    }}
                    className="border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 min-w-[60px] shadow-sm transition-all duration-200 rounded"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(spouse.id)
                    }}
                    className="border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700 min-w-[60px] shadow-sm transition-all duration-200 rounded"
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(spouse)
                    }}
                    className="border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 min-w-[60px] shadow-sm transition-all duration-200 rounded"
                  >
                    View
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default CombinedSpouseCard
