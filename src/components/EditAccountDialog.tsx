'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { useFamilyContext } from '@/contexts/FamilyContext'

interface EditAccountDialogProps {
  account: {
    email: string
    password: string
    accessibleFamilies: string[]
    isMinor: boolean
  }
  isOpen: boolean
  onClose: () => void
  onSave: (email: string, updates: any) => Promise<void>
}

export default function EditAccountDialog({
  account,
  isOpen,
  onClose,
  onSave
}: EditAccountDialogProps) {
  const [password, setPassword] = useState(account.password)
  const [accessibleFamilies, setAccessibleFamilies] = useState<string[]>(account.accessibleFamilies)
  const [isMinor, setIsMinor] = useState(account.isMinor)
  const { families } = useFamilyContext()
  const { toast } = useToast()

  useEffect(() => {
    setPassword(account.password)
    setAccessibleFamilies(account.accessibleFamilies)
    setIsMinor(account.isMinor)
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSave(account.email, {
        password,
        accessibleFamilies,
        isMinor
      })
      toast({
        title: "Account Updated",
        description: "The account has been successfully updated.",
        duration: 3000,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update the account. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-pink-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Edit Account
            <Heart className="w-5 h-5 text-pink-500" />
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={account.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-pink-100 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>
            <div className="grid gap-2">
              <Label>Accessible Families</Label>
              <ScrollArea className="h-[200px] rounded-md border border-pink-100 p-4">
                <div className="grid gap-2">
                  {families.map((family) => (
                    <div key={family.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`family-${family.id}`}
                        checked={accessibleFamilies.includes(family.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAccessibleFamilies([...accessibleFamilies, family.id])
                          } else {
                            setAccessibleFamilies(accessibleFamilies.filter(id => id !== family.id))
                          }
                        }}
                        className="text-pink-500 focus:ring-pink-200 border-pink-200"
                      />
                      <label
                        htmlFor={`family-${family.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {family.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="minor-mode"
                checked={isMinor}
                onCheckedChange={setIsMinor}
                className="data-[state=checked]:bg-pink-500"
              />
              <Label htmlFor="minor-mode">Minor Account</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
