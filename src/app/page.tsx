"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Users, GitBranch, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Discover Your Family Story
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create beautiful family trees, preserve your history, and connect with relatives across generations.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/sign-up" passHref>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing" passHref>
                  <Button size="lg" variant="outline">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-[400px]"
              >
                <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Tree Trunk */}
                  <path d="M300 350V200" stroke="#8B5E3C" strokeWidth="20" strokeLinecap="round" />
                  {/* Tree Branches */}
                  <path
                    d="M300 200L200 150M300 200L400 150M200 150L150 100M200 150L250 100M400 150L350 100M400 150L450 100"
                    stroke="#8B5E3C"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* People Circles */}
                  <circle cx="300" cy="350" r="30" fill="#3B82F6" />
                  <circle cx="150" cy="100" r="25" fill="#3B82F6" />
                  <circle cx="250" cy="100" r="25" fill="#3B82F6" />
                  <circle cx="350" cy="100" r="25" fill="#3B82F6" />
                  <circle cx="450" cy="100" r="25" fill="#3B82F6" />
                  <circle cx="200" cy="150" r="25" fill="#3B82F6" />
                  <circle cx="400" cy="150" r="25" fill="#3B82F6" />
                  <circle cx="300" cy="200" r="25" fill="#3B82F6" />

                  {/* Decorative Elements */}
                  <circle cx="150" cy="100" r="15" fill="white" opacity="0.5" />
                  <circle cx="250" cy="100" r="15" fill="white" opacity="0.5" />
                  <circle cx="350" cy="100" r="15" fill="white" opacity="0.5" />
                  <circle cx="450" cy="100" r="15" fill="white" opacity="0.5" />
                  <circle cx="200" cy="150" r="15" fill="white" opacity="0.5" />
                  <circle cx="400" cy="150" r="15" fill="white" opacity="0.5" />
                  <circle cx="300" cy="200" r="15" fill="white" opacity="0.5" />
                  <circle cx="300" cy="350" r="20" fill="white" opacity="0.5" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform provides all the tools you need to create, manage, and share your family history.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li className="flex items-start gap-4">
                  <Users className="mt-1 h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold">Family Tree Builder</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Create beautiful, interactive family trees with our intuitive drag-and-drop interface.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <GitBranch className="mt-1 h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold">Relationship Mapping</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Visualize complex family relationships and connections across generations.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <History className="mt-1 h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold">Family Stories</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Preserve and share important family stories, memories, and traditions.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-full h-[400px]"
              >
                <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Feature Illustration */}
                  <rect x="100" y="50" width="300" height="300" rx="20" fill="#F0F9FF" />

                  {/* Tree Structure */}
                  <path
                    d="M250 300V200M250 200L180 150M250 200L320 150M180 150L140 100M180 150L220 100M320 150L280 100M320 150L360 100"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Person Cards */}
                  <rect x="220" y="280" width="60" height="40" rx="5" fill="#3B82F6" />
                  <rect x="120" y="80" width="40" height="40" rx="5" fill="#3B82F6" />
                  <rect x="200" y="80" width="40" height="40" rx="5" fill="#3B82F6" />
                  <rect x="280" y="80" width="40" height="40" rx="5" fill="#3B82F6" />
                  <rect x="360" y="80" width="40" height="40" rx="5" fill="#3B82F6" />
                  <rect x="160" y="130" width="40" height="40" rx="5" fill="#3B82F6" />
                  <rect x="300" y="130" width="40" height="40" rx="5" fill="#3B82F6" />
                  <rect x="230" y="180" width="40" height="40" rx="5" fill="#3B82F6" />

                  {/* UI Elements */}
                  <rect x="130" y="90" width="20" height="4" rx="2" fill="white" />
                  <rect x="130" y="100" width="20" height="4" rx="2" fill="white" />
                  <rect x="210" y="90" width="20" height="4" rx="2" fill="white" />
                  <rect x="210" y="100" width="20" height="4" rx="2" fill="white" />
                  <rect x="290" y="90" width="20" height="4" rx="2" fill="white" />
                  <rect x="290" y="100" width="20" height="4" rx="2" fill="white" />
                  <rect x="370" y="90" width="20" height="4" rx="2" fill="white" />
                  <rect x="370" y="100" width="20" height="4" rx="2" fill="white" />
                  <rect x="170" y="140" width="20" height="4" rx="2" fill="white" />
                  <rect x="170" y="150" width="20" height="4" rx="2" fill="white" />
                  <rect x="310" y="140" width="20" height="4" rx="2" fill="white" />
                  <rect x="310" y="150" width="20" height="4" rx="2" fill="white" />
                  <rect x="240" y="190" width="20" height="4" rx="2" fill="white" />
                  <rect x="240" y="200" width="20" height="4" rx="2" fill="white" />
                  <rect x="230" y="290" width="40" height="4" rx="2" fill="white" />
                  <rect x="230" y="300" width="40" height="4" rx="2" fill="white" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Testimonials</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover how our platform has helped people connect with their family history.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Sarah Johnson</h3>
                    <p className="text-sm text-gray-500">Family Historian</p>
                  </div>
                </div>
                <p className="text-gray-500">
                  "This platform has transformed how I document my family history. The intuitive interface and powerful
                  features make it easy to create detailed family trees."
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Michael Rodriguez</h3>
                    <p className="text-sm text-gray-500">Genealogy Enthusiast</p>
                  </div>
                </div>
                <p className="text-gray-500">
                  "I've tried many genealogy tools, but this one stands out. The ability to collaborate with family
                  members and share stories has brought us closer together."
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Emily Chen</h3>
                    <p className="text-sm text-gray-500">Family Reunion Organizer</p>
                  </div>
                </div>
                <p className="text-gray-500">
                  "Planning our family reunion was so much easier with this tool. We were able to connect with distant
                  relatives and create a comprehensive family tree."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Your Family Tree?
              </h2>
              <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of families who are preserving their history for future generations.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/sign-up" passHref>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing" passHref>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
