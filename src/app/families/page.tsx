"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useFamilyContext } from "@/contexts/FamilyContext"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronDown, Plus, Search, Filter, CalendarRange } from "lucide-react"
import FamilyCard from "@/components/FamilyCard"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreateFamilyDialog from "@/components/CreateFamilyDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"

export default function FamiliesPage() {
    const { isSignedIn, isLoaded, user: clerkUser } = useUser()
    const { user } = useAuth()
    const { families, canUserAccessFamily } = useFamilyContext()
    const [userFamilies, setUserFamilies] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState("newest")
    const [filterOption, setFilterOption] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [ownerNames, setOwnerNames] = useState<Record<string, string>>({})

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            redirect("/sign-in")
        }
    }, [isLoaded, isSignedIn])

    // Fetch owner names for all families
    useEffect(() => {
        const fetchOwnerNames = async () => {
            if (!families || families.length === 0) return

            const ownerIds = [...new Set(families.map(family => family.ownerId))]
            const nameMap: Record<string, string> = {}

            // Currently this is a simple mapping where we use the current user's name
            // In a real app, you'd fetch user details from your database or Clerk API
            ownerIds.forEach(ownerId => {
                if (user && user.id === ownerId) {
                    nameMap[ownerId] = user.name || clerkUser?.fullName || "Unknown"
                } else {
                    nameMap[ownerId] = "Unknown" // Default for other users
                }
            })

            setOwnerNames(nameMap)
        }

        fetchOwnerNames()
    }, [families, clerkUser, user])

    useEffect(() => {
        if (families && families.length > 0 && user) {
            // First filter by ownership based on filterOption
            let filteredFamilies = families;

            if (filterOption === "owned") {
                filteredFamilies = families.filter(family => family.ownerId === user.id);
            } else if (filterOption === "shared") {
                filteredFamilies = families.filter(
                    family => family.ownerId !== user.id && canUserAccessFamily(user.id, family.id)
                );
            } else {
                // "all" option - only show families the user can access
                filteredFamilies = families.filter(
                    family => family.ownerId === user.id || canUserAccessFamily(user.id, family.id)
                );
            }

            // Sort families based on selected option
            const sortedFamilies = [...filteredFamilies].sort((a, b) => {
                if (sortOption === "newest") {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                } else if (sortOption === "oldest") {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                } else if (sortOption === "alphabetical") {
                    return a.name.localeCompare(b.name)
                }
                return 0
            })

            // Filter by search query
            const searchedFamilies = sortedFamilies.filter((family) =>
                family.name.toLowerCase().includes(searchQuery.toLowerCase())
            )

            setUserFamilies(searchedFamilies)
            setIsLoading(false)
        } else {
            setUserFamilies([])
            setIsLoading(false)
        }
    }, [families, user, sortOption, searchQuery, filterOption, canUserAccessFamily])

    const handleDelete = (id: string) => {
        // This would be handled by FamilyCard component
        // Just update the list after deletion
        setUserFamilies(userFamilies.filter((family) => family.id !== id))
    }

    const handleEdit = (id: string) => {
        // This would be handled by FamilyCard component
    }

    if (!isLoaded || isLoading) {
        return (
            <div className="container px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Skeleton className="h-10 w-64" />
                    <div className="flex flex-col md:flex-row gap-2">
                        <Skeleton className="h-10 w-36" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-60 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Family Trees</h1>
                    <p className="text-gray-500 mt-1">Manage all your family trees in one place</p>
                </div>
                <CreateFamilyDialog />
            </div>

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search families..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-gray-400" />
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                                <SelectItem value="alphabetical">A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={filterOption} onValueChange={setFilterOption}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Trees</SelectItem>
                                <SelectItem value="owned">My Trees</SelectItem>
                                <SelectItem value="shared">Shared With Me</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {userFamilies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userFamilies.map((family, index) => (
                        <motion.div
                            key={family.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <FamilyCard
                                id={family.id}
                                name={family.name}
                                updatedAt={family.updatedAt}
                                ownerId={family.ownerId}
                                ownerName={ownerNames[family.ownerId] || "Unknown"}
                                isShared={user ? family.ownerId !== user.id : false}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <div className="text-center max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No family trees found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? `No families matching "${searchQuery}"`
                                : "You haven't created any family trees yet. Create your first one to get started."}
                        </p>
                        <CreateFamilyDialog />
                    </div>
                </div>
            )}
        </div>
    )
} 