'use client'

import { UserProfile } from "@clerk/nextjs"
import { motion } from 'framer-motion'

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <UserProfile
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "border-pink-100 shadow-xl bg-white/95 backdrop-blur-sm",
                            headerTitle: "text-2xl font-bold text-center text-pink-600",
                            headerSubtitle: "text-center text-gray-600",
                            formButtonPrimary: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
                            formButtonReset: "text-pink-600 hover:text-pink-700",
                            navbar: "border-pink-100",
                            pageScrollBox: "p-6"
                        }
                    }}
                />
            </motion.div>
        </div>
    )
} 