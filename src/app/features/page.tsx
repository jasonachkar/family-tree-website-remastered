"use client"

import { motion } from "framer-motion"
import { GitBranch, Users, History, Shield, Download, Share2, Zap } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Powerful Features for Your Family Tree
            </h1>
            <p className="mt-4 text-gray-500 md:text-xl">
              Discover all the tools and capabilities that make FamilyTree the perfect platform for preserving your
              family history.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <GitBranch className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Interactive Family Trees</h3>
              <p className="text-gray-500">
                Create beautiful, interactive family trees with our intuitive drag-and-drop interface. Visualize complex
                family relationships across multiple generations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collaborative Editing</h3>
              <p className="text-gray-500">
                Invite family members to contribute to your family tree. Work together to build a comprehensive family
                history that spans generations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Family Stories</h3>
              <p className="text-gray-500">
                Document and preserve important family stories, memories, and traditions. Attach stories to specific
                family members or events.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy Controls</h3>
              <p className="text-gray-500">
                Control who can view and edit your family tree with granular privacy settings. Keep sensitive
                information private while sharing what matters.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Data Export</h3>
              <p className="text-gray-500">
                Export your family tree data in multiple formats for backup or sharing. Never worry about losing your
                valuable family history.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sharing Options</h3>
              <p className="text-gray-500">
                Share your family tree with relatives through various methods, including direct links, PDF exports, or
                beautiful printable charts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Performance</h3>
              <p className="text-gray-500">
                Enjoy smooth, responsive performance even with large family trees containing hundreds of members and
                complex relationships.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to get started?</h2>
            <p className="mt-4 text-gray-500 md:text-xl">
              Join thousands of families who are preserving their history with FamilyTree.
            </p>
            <div className="mt-8">
              <a
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
              >
                Get Started for Free
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
