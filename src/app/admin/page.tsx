'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import { Users, Key, Home, UserPlus, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([])
  const [isMinor, setIsMinor] = useState(false)
  const [generatedAccounts, setGeneratedAccounts] = useState<{ email: string; isMinor: boolean }[]>([])
  const router = useRouter()
  const { user, generateAccount, getGeneratedAccounts } = useAuth()
  const { families } = useFamilyContext()

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/login')
    } else {
      setGeneratedAccounts(getGeneratedAccounts())
    }
  }, [user, router, getGeneratedAccounts])

  const handleGenerateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateAccount(newEmail, newPassword, selectedFamilies, isMinor)
    setGeneratedAccounts(getGeneratedAccounts())
    setNewEmail('')
    setNewPassword('')
    setSelectedFamilies([])
    setIsMinor(false)
  }

  const handleFamilySelection = (familyId: string) => {
    setSelectedFamilies(prev =>
      prev.includes(familyId)
        ? prev.filter(id => id !== familyId)
        : [...prev, familyId]
    )
  }

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-pink-100 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-pink-100">
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-pink-500" />
                Admin Dashboard
                <Heart className="h-6 w-6 text-pink-500" />
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Manage user accounts and families with love and care
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-pink-600 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Generate New User Account
                </h3>
                <form onSubmit={handleGenerateAccount} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-gray-700">Accessible Families</Label>
                    <div className="grid gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                      {families.map(family => (
                        <div key={family.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`family-${family.id}`}
                            checked={selectedFamilies.includes(family.id)}
                            onCheckedChange={() => handleFamilySelection(family.id)}
                            className="text-pink-500 focus:ring-pink-200 border-pink-200"
                          />
                          <label
                            htmlFor={`family-${family.id}`}
                            className="text-sm font-medium text-gray-700 hover:text-pink-600 cursor-pointer"
                          >
                            {family.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-minor"
                      checked={isMinor}
                      onCheckedChange={setIsMinor}
                      className="data-[state=checked]:bg-pink-500"
                    />
                    <Label htmlFor="is-minor" className="text-gray-700">Is Minor?</Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    Generate Account
                  </Button>
                </form>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Family Management
                  </Button>
                </Link>
                <Link href="/admin/accounts" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    View Accounts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
