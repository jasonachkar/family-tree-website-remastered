'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion'
import { User, Heart, LogOut, Pencil, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setName(user.name || '')
    } else {
      router.push('/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateUser({ name })
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Profile update failed:', error)
      toast({
        title: "Update Failed",
        description: "Profile update failed. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-pink-100 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 border-b border-pink-100">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <User className="h-6 w-6 text-pink-500" />
              Your Profile
              <Heart className="h-6 w-6 text-pink-500" />
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              View and edit your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-pink-50/50 border-pink-100 text-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                  placeholder="Enter your name..."
                />
              </div>
              {isEditing ? (
                <div className="flex justify-between gap-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              <div className="pt-4 border-t border-pink-100">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
