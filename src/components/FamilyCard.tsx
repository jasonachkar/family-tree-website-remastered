import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatDistanceToNow } from 'date-fns'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { FamilyMember } from './FamilyTree'

interface FamilyCardProps {
  id: string
  name: string
  updatedAt?: string
  ownerId?: string
  ownerName?: string
  isShared?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function FamilyCard({
  id,
  name,
  updatedAt,
  ownerId,
  ownerName,
  isShared = false,
  onEdit,
  onDelete
}: FamilyCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isOwner = user?.id === ownerId || !isShared
  const { loadFamilyTreeFromKV } = useFamilyContext()
  const [membersCount, setMembersCount] = useState(0)

  useEffect(() => {
    const loadMembersCount = async () => {
      try {
        const treeData = await loadFamilyTreeFromKV(id)
        if (treeData) {
          const count = countFamilyMembers(treeData)
          setMembersCount(count)
        }
      } catch (error) {
        console.error('Error loading family tree:', error)
      }
    }

    loadMembersCount()
  }, [id, loadFamilyTreeFromKV])

  // Function to recursively count all members in the family tree
  const countFamilyMembers = (root: FamilyMember): number => {
    if (!root) return 0

    let count = 1 // Count the root member

    // Count children recursively
    if (root.children && root.children.length > 0) {
      root.children.forEach(child => {
        count += countFamilyMembers(child)
      })
    }

    // Count spouses
    if (root.spouses && root.spouses.length > 0) {
      count += root.spouses.length
    }

    return count
  }

  const handleDelete = () => {
    onDelete(id)
    toast({
      title: "Family Deleted",
      description: "The family has been successfully deleted."
    })
    setIsDeleteDialogOpen(false)
  }

  const formatLastEdited = () => {
    if (!updatedAt) return '';
    try {
      return `Last edited ${formatDistanceToNow(new Date(updatedAt))} ago`;
    } catch (error) {
      return '';
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full overflow-hidden bg-white shadow-sm hover:shadow transition-all duration-300 border border-gray-100 rounded-lg">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">{name}</h3>

              {updatedAt && (
                <p className="text-gray-500 text-sm">
                  {formatLastEdited()}
                </p>
              )}

              <div className="flex items-center text-gray-500 text-sm">
                <Users className="h-4 w-4 mr-2" />
                <span>{membersCount} members</span>
              </div>

              {isShared && (
                <div className="flex items-center text-violet-600 text-sm bg-violet-50 px-2 py-1 rounded-md w-fit">
                  <span>Shared by {ownerName}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between p-6 pt-0">
            <Button
              asChild
              variant="outline"
              className="border border-gray-200 hover:bg-gray-50 text-gray-900 transition-all duration-200 rounded-md"
            >
              <Link href={`/family/${id}`}>View Tree</Link>
            </Button>

            {isOwner && (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(id)}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-gray-600 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Family"
        description="Are you sure you want to delete this family? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}
