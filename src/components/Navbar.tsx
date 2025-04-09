"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, LogOut, GitBranch, Info } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser, SignOutButton } from "@clerk/nextjs"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()

  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null)
  const [showFamilyLinks, setShowFamilyLinks] = useState(false)

  useEffect(() => {
    const familyIdMatch = pathname?.match(/^\/family\/([^/]+)/)
    if (familyIdMatch) {
      setCurrentFamilyId(familyIdMatch[1])
      setShowFamilyLinks(true)
    } else {
      setCurrentFamilyId(null)
      setShowFamilyLinks(false)
    }
  }, [pathname])

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white bg-opacity-80 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex justify-between flex-1">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <GitBranch className="h-6 w-6" />
                FamilyTree
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/pricing")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/about") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Info className="inline-block w-4 h-4 mr-1" />
                About
              </Link>
              <Link
                href="/features"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/features")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Features
              </Link>
              <Link
                href="/faq"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/faq") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                FAQ
              </Link>
              {isSignedIn && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/dashboard")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {showFamilyLinks && currentFamilyId && (
                <>
                  <Link
                    href={`/family/${currentFamilyId}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(`/family/${currentFamilyId}`)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Tree
                  </Link>
                  <Link
                    href={`/family/${currentFamilyId}/lore`}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(`/family/${currentFamilyId}/lore`)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Stories
                  </Link>
                </>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {isSignedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.emailAddresses[0].emailAddress[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.fullName || user.emailAddresses[0].emailAddress}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SignOutButton>
                        <div className="flex items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </div>
                      </SignOutButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/pricing") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/about") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Info className="inline-block w-4 h-4 mr-1" />
              About
            </Link>
            <Link
              href="/features"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/features")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              Features
            </Link>
            <Link
              href="/faq"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/faq") ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              FAQ
            </Link>
            {isSignedIn && (
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/dashboard")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Dashboard
              </Link>
            )}
            {showFamilyLinks && currentFamilyId && (
              <>
                <Link
                  href={`/family/${currentFamilyId}`}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(`/family/${currentFamilyId}`)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Tree
                </Link>
                <Link
                  href={`/family/${currentFamilyId}/lore`}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(`/family/${currentFamilyId}/lore`)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Stories
                </Link>
              </>
            )}
            {isSignedIn ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  Profile
                </Link>
                <div className="px-3 py-2">
                  <SignOutButton>
                    <Button variant="outline" className="w-full justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </SignOutButton>
                </div>
              </>
            ) : (
              <div className="px-3 py-2">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
