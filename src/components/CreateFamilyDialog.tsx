'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFamilyContext } from '@/contexts/FamilyContext'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { uploadImageToBlob } from '@/utils/blobStorage'
import { useAuth } from '@/contexts/AuthContext'
import { canCreateFamily, getLimitMessage } from '@/utils/subscriptionLimits'
import Link from 'next/link'

export default function CreateFamilyDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [image, setImage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { addFamily, saveFamilyTreeToKV, families } = useFamilyContext()
    const { user } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    // Count families that this user owns (not shared with them)
    const userOwnedFamilies = user ? families.filter(family => family.ownerId === user.id) : []
    const canCreate = user ? canCreateFamily(user.subscriptionTier, userOwnedFamilies.length) : false

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Check subscription limits
        if (!canCreate) {
            toast({
                title: "Subscription Limit Reached",
                description: getLimitMessage(user?.subscriptionTier || 'free', 'family'),
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)
        try {
            // Upload image to Blob if provided
            let imageUrl = image
            if (image && image.startsWith('data:')) {
                imageUrl = await uploadImageToBlob(image)
            }

            // Add family to context and database
            const familyId = await addFamily(name, imageUrl)
            console.log('Family created with ID:', familyId)

            // Create initial family tree data
            const initialTreeData = {
                id: familyId,
                firstName: 'Root',
                lastName: 'Person',
                familyId: familyId,
                x: 0,
                y: 0,
                children: [],
                dob: '',
                name: 'Root Person'
            }

            // Save initial tree data
            await saveFamilyTreeToKV(familyId, initialTreeData)
            console.log('Tree data saved for family:', familyId)

            toast({
                title: "Success",
                description: "Family created successfully!",
            })

            // Close the dialog
            setIsOpen(false)

            // Force navigation to the family page with the new ID
            const familyUrl = `/family/${familyId}`
            console.log('Redirecting to:', familyUrl)

            // Use a small timeout to ensure the state updates before redirecting
            setTimeout(() => {
                router.push(familyUrl)
            }, 100)
        } catch (error) {
            console.error('Error creating family:', error)
            toast({
                title: "Error",
                description: "Failed to create family. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    const imageData = reader.result as string
                    const imageUrl = await uploadImageToBlob(imageData)
                    setImage(imageUrl)
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

    const handleClick = () => {
        if (!canCreate) {
            toast({
                title: "Subscription Limit Reached",
                description: getLimitMessage(user?.subscriptionTier || 'free', 'family'),
                variant: "destructive"
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => canCreate ? setIsOpen(open) : null}>
            <DialogTrigger asChild>
                <div>
                    {canCreate ? (
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Family Tree
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleClick}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Family Tree
                            </Button>
                            <Link href="/pricing" className="text-xs text-indigo-600 hover:text-indigo-800">
                                Upgrade your plan to create more family trees
                            </Link>
                        </div>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Family Tree</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Family Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter family name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image">Family Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "Create Family"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
} 