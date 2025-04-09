"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, Plus, Users, Clock, Settings, ChevronRight } from "lucide-react"
import { useFamilyContext } from "@/contexts/FamilyContext"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { families, addFamily } = useFamilyContext()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState("")
  const [recentFamilies, setRecentFamilies] = useState<any[]>([])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in")
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    // Get recent families from local storage or context
    if (families && families.length > 0) {
      setRecentFamilies(families.slice(0, 3))
    }
  }, [families])

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
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Family Tree
          </Button>
        </div>

        {/* Recent Family Trees */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Family Trees</h2>
            <Link href="/families" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFamilies.length > 0 ? (
              recentFamilies.map((family, index) => (
                <motion.div
                  key={family.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>{family.name}</CardTitle>
                      <CardDescription>Last edited 2 days ago</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{family.memberCount || "25"} members</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/family/${family.id}`} passHref>
                        <Button variant="outline" className="w-full">
                          View Tree
                        </Button>
                      </Link>
                    </CardFooter>
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
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Family Tree
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Add Family Member
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-500 text-sm">Add a new person to one of your family trees.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Add Member
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Record Family Story
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-500 text-sm">Document an important family memory or tradition.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Add Story
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-600" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-500 text-sm">Manage your account preferences and subscription.</p>
              </CardContent>
              <CardFooter>
                <Link href="/settings" passHref>
                  <Button variant="outline" className="w-full">
                    Settings
                  </Button>
                </Link>
              </CardFooter>
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

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Family Trees</span>
                    <span className="font-medium">1 / 1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Family Members</span>
                    <span className="font-medium">25 / 50</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
