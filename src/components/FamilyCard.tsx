import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { uploadImageToSupabase } from '@/utils/supabaseStorage'
import { ChangeEvent } from 'react'

interface FamilyCardProps {
  id: string
  name: string
  image: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function FamilyCard({ id, name, image, onEdit, onDelete }: FamilyCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(image)

  const handleDelete = () => {
    onDelete(id)
    toast({
      title: "Family Deleted",
      description: "The family has been successfully deleted."
    })
    setIsDeleteDialogOpen(false)
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const imageData = reader.result as string
          const imageUrl = await uploadImageToSupabase(imageData);
          setCurrentImage(imageUrl)
        } catch (error) {
          console.error('Error uploading image:', error)
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-sm overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-pink-100">
          <CardContent className="p-0 relative group">
            <div className="relative w-full h-48">
              <Image
                src={currentImage || '/placeholder.svg'}
                alt={`${name} family`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-2 right-2"
            >
              <Heart className="h-6 w-6 text-pink-100 drop-shadow-lg" />
            </motion.div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
              <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50">
            <Button
              asChild
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/family/${id}`}>View Tree</Link>
            </Button>
            <div className="flex space-x-2">
              {user?.isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(id)}
                    className="text-gray-600 hover:text-pink-500 hover:bg-pink-50"
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
                </>
              )}
            </div>
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
