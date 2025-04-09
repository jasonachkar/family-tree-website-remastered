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
        className="absolute -top-6 left-1/2 transform -translate-x-1/2"
      >
        <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
      </motion.div>
      <AnimatePresence>
        {spouses.map((spouse, index) => {
          const shouldShowDetails = user?.isAdmin || spouse.dod || (!isMinor && spouse.dob && calculateAge(spouse.dob) >= 18)

          return (
            <motion.div
              key={spouse.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white/95 backdrop-blur-sm border-2 ${selectedNode === spouse.id
                  ? 'border-pink-500 shadow-lg shadow-pink-200/50'
                  : 'border-pink-300'
                } rounded-xl p-4 mb-4 last:mb-0 transition-all duration-300 hover:shadow-xl`}
              onClick={() => setSelectedNode(spouse.id)}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-pink-200 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={spouse.image || '/placeholder.svg'}
                    alt={`${spouse.firstName} ${spouse.lastName}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-110"
                  />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold text-center max-w-full px-2 text-gray-800"
                  layout
                >
                  {truncateText(`${spouse.firstName} ${spouse.lastName}`)}
                </motion.h3>
                {shouldShowDetails && (
                  <motion.div
                    className="text-center mt-2 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {spouse.dob && (
                      <p className="text-sm text-gray-600">
                        Born: {formatDate(spouse.dob)}
                      </p>
                    )}
                    {spouse.dod && (
                      <p className="text-sm text-gray-600">
                        Died: {formatDate(spouse.dod)}
                      </p>
                    )}
                    {spouse.role && (
                      <p className="text-sm text-pink-600 font-medium">
                        {truncateText(spouse.role)}
                      </p>
                    )}
                  </motion.div>
                )}
                <div className="mt-4 w-full flex justify-center gap-2">
                  {user?.isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(spouse)
                        }}
                        className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px] shadow-sm transition-all duration-300 hover:shadow"
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
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 min-w-[60px] shadow-sm transition-all duration-300 hover:shadow"
                      >
                        Remove
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(spouse)
                    }}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 min-w-[60px] shadow-sm transition-all duration-300 hover:shadow"
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
