"use client"

import { motion } from "framer-motion"
import { GitBranch, Users, History, Shield } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About FamilyTree</h1>
                <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our mission is to help families preserve their history and connect across generations.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="rounded-full bg-blue-100 p-3 md:p-4">
                    <GitBranch className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Our Story</h2>
                    <p className="text-gray-500">
                      FamilyTree was founded by a team of genealogy enthusiasts and software developers who wanted to
                      create a better way for families to document and share their history. We believe that every family
                      has a unique story worth preserving for future generations.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="rounded-full bg-blue-100 p-3 md:p-4">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Our Mission</h2>
                    <p className="text-gray-500">
                      Our mission is to make family history accessible and engaging for everyone. We're committed to
                      providing intuitive tools that help you discover, document, and share your family's unique story
                      with future generations.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="rounded-full bg-blue-100 p-3 md:p-4">
                    <History className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Our Values</h2>
                    <p className="text-gray-500">
                      We believe in the importance of family connections, the power of shared stories, and the value of
                      preserving history. Our platform is built on the principles of accessibility, privacy, and
                      continuous improvement.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="rounded-full bg-blue-100 p-3 md:p-4">
                    <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Privacy & Security</h2>
                    <p className="text-gray-500">
                      We understand that family history is personal. That's why we've built our platform with privacy
                      and security at its core. Your data is encrypted, securely stored, and never shared without your
                      explicit permission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Team</h2>
              <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Meet the passionate person behind FamilyTree.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src="/jason.png"
                    alt="Jason Achkar Diab"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-bold">Jason Achkar Diab</h3>
                <p className="text-blue-600">Founder & CEO</p>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  Genealogy enthusiast with over 5 years of experience in software development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Contact Us</h2>
              <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="w-full max-w-md mt-8">
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your message"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
