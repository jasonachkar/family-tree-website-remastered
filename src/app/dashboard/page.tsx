"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, Plus, Users, Clock, Settings, ChevronRight, RefreshCw } from "lucide-react"
import { useFamilyContext } from "@/contexts/FamilyContext"
import { redirect, useRouter } from "next/navigation"
import CreateFamilyDialog from '@/components/CreateFamilyDialog'
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { families, loadFamilyTreeFromKV } = useFamilyContext()
  const [recentFamilies, setRecentFamilies] = useState<any[]>([])
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [totalMemberCount, setTotalMemberCount] = useState(0)
  const [userFamiliesCount, setUserFamiliesCount] = useState(0)
  const router = useRouter()
  const [selectedFamilyForMember, setSelectedFamilyForMember] = useState<string>("")
  const [selectedFamilyForStory, setSelectedFamilyForStory] = useState<string>("")
  const [isFamilySelectorForMemberOpen, setIsFamilySelectorForMemberOpen] = useState(false)
  const [isFamilySelectorForStoryOpen, setIsFamilySelectorForStoryOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in")
    }
  }, [isLoaded, isSignedIn])

  // Get and update access timestamps from localStorage
  const getAccessTimestamps = useCallback(() => {
    try {
      const storedTimestamps = localStorage.getItem('familyAccessTimestamps');
      return storedTimestamps ? JSON.parse(storedTimestamps) : {};
    } catch (error) {
      console.error('Error reading access timestamps:', error);
      return {};
    }
  }, []);

  const updateAccessTimestamp = useCallback((familyId: string) => {
    try {
      const timestamps = getAccessTimestamps();
      timestamps[familyId] = Date.now();
      localStorage.setItem('familyAccessTimestamps', JSON.stringify(timestamps));
    } catch (error) {
      console.error('Error updating access timestamp:', error);
    }
  }, [getAccessTimestamps]);

  // Function to count members in a family tree
  const countFamilyMembers = (root: any): number => {
    if (!root) return 0

    let count = 1 // Count the root member

    // Count children recursively
    if (root.children && root.children.length > 0) {
      root.children.forEach((child: any) => {
        count += countFamilyMembers(child)
      })
    }

    // Count spouses
    if (root.spouses && root.spouses.length > 0) {
      count += root.spouses.length
    }

    return count
  }

  // Load recent families data
  const loadRecentFamilies = useCallback(async () => {
    if (!families || families.length === 0 || !user) {
      setRecentFamilies([]);
      setMemberCounts({});
      return;
    }

    setIsRefreshing(true);

    try {
      // Get access timestamps from localStorage
      const accessTimestamps = getAccessTimestamps();

      // Filter families the user has access to (owned or shared with them)
      const accessibleFamilies = families.filter(f =>
        f.ownerId === user.id ||
        (f.collaborators && f.collaborators.includes(user.id)) ||
        (f.privacyLevel === 'public')
      );

      // Calculate user-owned families count
      const userFamilies = families.filter(f => f.ownerId === user.id);
      setUserFamiliesCount(userFamilies.length);

      // Combine creation, update, and access timestamps to determine recency
      const familiesWithRecency = accessibleFamilies.map(family => {
        // Get latest timestamp: creation, update, or access
        const createdAt = new Date(family.createdAt || 0).getTime();
        const updatedAt = new Date(family.updatedAt || 0).getTime();
        const accessedAt = accessTimestamps[family.id] || 0;

        // Use the most recent timestamp as the recency score
        const recencyScore = Math.max(createdAt, updatedAt, accessedAt);

        return {
          ...family,
          recencyScore
        };
      });

      // Sort by recency score (most recent first)
      const sortedFamilies = familiesWithRecency.sort((a, b) =>
        b.recencyScore - a.recencyScore
      );

      // Take the 3 most recent families
      const recent = sortedFamilies.slice(0, 3);
      setRecentFamilies(recent);

      // Load member counts for each family
      const counts: Record<string, number> = {};

      // Calculate total member count across all user-owned families
      let userTotalMembers = 0;

      // Process all families to get member counts
      for (const family of families) {
        try {
          const treeData = await loadFamilyTreeFromKV(family.id);
          if (treeData) {
            const familyMemberCount = countFamilyMembers(treeData);
            counts[family.id] = familyMemberCount;

            // Only add to user's total if this family is owned by user
            if (family.ownerId === user.id) {
              userTotalMembers += familyMemberCount;
            }
          } else {
            counts[family.id] = 0;
          }
        } catch (error) {
          console.error(`Error loading tree data for family ${family.id}:`, error);
          counts[family.id] = 0;
        }
      }

      setTotalMemberCount(userTotalMembers);
      setMemberCounts(counts);
    } catch (error) {
      console.error("Error loading recent families:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [families, loadFamilyTreeFromKV, user, getAccessTimestamps]);

  // Load data when families change or on manual refresh
  useEffect(() => {
    loadRecentFamilies();

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      loadRecentFamilies();
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [families, lastRefresh, loadRecentFamilies]);

  // Add an effect to listen for storage events (for cross-tab updates)
  useEffect(() => {
    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('familyTree_') || e.key === 'familyAccessTimestamps')) {
        loadRecentFamilies();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadRecentFamilies]);

  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  const formatLastEdited = (date: string) => {
    if (!date) return 'Never edited';
    try {
      return `Last edited ${formatDistanceToNow(new Date(date))} ago`;
    } catch (error) {
      return 'Never edited';
    }
  }

  // Handle click on View Tree button to update access timestamp
  const handleViewTree = (familyId: string) => {
    updateAccessTimestamp(familyId);
  };

  const handleAddMember = () => {
    if (!selectedFamilyForMember) return
    updateAccessTimestamp(selectedFamilyForMember)
    router.push(`/family/${selectedFamilyForMember}`)
    setIsFamilySelectorForMemberOpen(false)
  }

  const handleAddStory = () => {
    if (!selectedFamilyForStory) return
    updateAccessTimestamp(selectedFamilyForStory)
    router.push(`/family/${selectedFamilyForStory}/stories`)
    setIsFamilySelectorForStoryOpen(false)
  }

  if (!isLoaded || !isSignedIn) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName || "User"}</h1>
            <p className="text-gray-500 mt-1">Manage your family trees and stories</p>
          </div>
          <CreateFamilyDialog />
        </div>

        {/* Recent Family Trees */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Family Trees</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-600 hover:text-blue-600"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/families" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFamilies.length > 0 ? (
              recentFamilies.map((family, index) => (
                <motion.div
                  key={`${family.id}-${lastRefresh}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-sm transition-shadow border border-gray-100">
                    <div className="p-6 space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900">{family.name}</h3>
                      <p className="text-gray-500 text-sm">
                        {formatLastEdited(family.updatedAt)}
                      </p>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{memberCounts[family.id] || 0} members</span>
                      </div>

                      <div className="pt-3">
                        <Link href={`/family/${family.id}`} passHref
                          onClick={() => handleViewTree(family.id)}
                        >
                          <Button variant="outline" className="w-auto border border-gray-200 hover:bg-gray-50 text-gray-900">
                            View Tree
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No family trees yet</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md">
                  Create your first family tree to start documenting your family history.
                </p>
                <CreateFamilyDialog />
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-sm transition-shadow border border-gray-100">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Add Family Member</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  Add a new person to one of your family trees.
                </p>
                <div className="pt-3">
                  <Dialog open={isFamilySelectorForMemberOpen} onOpenChange={setIsFamilySelectorForMemberOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Select a Family</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Choose a family to add a member to:
                          </label>
                          <Select
                            value={selectedFamilyForMember}
                            onValueChange={setSelectedFamilyForMember}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a family" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Your Families</SelectLabel>
                                {user && families
                                  .filter(family => family.ownerId === user.id)
                                  .map(family => (
                                    <SelectItem key={family.id} value={family.id}>
                                      {family.name}
                                    </SelectItem>
                                  ))
                                }
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={handleAddMember}
                            disabled={!selectedFamilyForMember}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-sm transition-shadow border border-gray-100">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Record Family Story</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  Document an important family memory or tradition.
                </p>
                <div className="pt-3">
                  <Dialog open={isFamilySelectorForStoryOpen} onOpenChange={setIsFamilySelectorForStoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Add Story
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Select a Family</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Choose a family to add a story to:
                          </label>
                          <Select
                            value={selectedFamilyForStory}
                            onValueChange={setSelectedFamilyForStory}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a family" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Your Families</SelectLabel>
                                {user && families
                                  .filter(family => family.ownerId === user.id)
                                  .map(family => (
                                    <SelectItem key={family.id} value={family.id}>
                                      {family.name}
                                    </SelectItem>
                                  ))
                                }
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={handleAddStory}
                            disabled={!selectedFamilyForStory}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-sm transition-shadow border border-gray-100">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Account Settings</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  Manage your account preferences and subscription.
                </p>
                <div className="pt-3">
                  <Link href="/settings" passHref>
                    <Button variant="outline" className="w-full">
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Subscription Status */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>Current plan and usage information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Free Plan</p>
                    <p className="text-sm text-gray-500">Basic features for individuals</p>
                  </div>
                  <Link href="/pricing" passHref>
                    <Button className="bg-blue-600 hover:bg-blue-700">Upgrade</Button>
                  </Link>
                </div>

                {/* Only count families owned by the current user */}
                {user && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Family Trees</span>
                        <span className="font-medium">
                          {userFamiliesCount} / 1
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(userFamiliesCount / 1 * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Family Members</span>
                        <span className="font-medium">
                          {totalMemberCount} / 50
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(totalMemberCount / 50 * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
