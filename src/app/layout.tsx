import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { FamilyProvider } from "@/contexts/FamilyContext"
import { LoreProvider } from "@/contexts/LoreContext"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ToastContainer } from "@/components/ui/use-toast"
import { ClerkProvider } from "@clerk/nextjs"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FamilyTree - Discover Your Family Story",
  description: "Create beautiful family trees, preserve your history, and connect with relatives across generations.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white flex flex-col`}>
        <ClerkProvider>
          <AuthProvider>
            <FamilyProvider>
              <LoreProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <ToastContainer />
                </div>
              </LoreProvider>
            </FamilyProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}


import './globals.css'