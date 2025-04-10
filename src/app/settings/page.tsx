"use client"

import { useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Settings, User, CreditCard, Bell, Shield, LogOut, Check } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { SUBSCRIPTION_LIMITS } from "@/utils/subscriptionLimits"

export default function SettingsPage() {
    const { isSignedIn, isLoaded, user: clerkUser } = useUser()
    const { user: authUser } = useAuth()
    const { signOut } = useClerk()
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    if (!isLoaded) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }

    if (!isSignedIn) {
        router.push("/sign-in")
        return null
    }

    const handleSignOut = async () => {
        setIsLoading(true)
        try {
            await signOut()
            router.push("/")
        } catch (error) {
            console.error("Error signing out:", error)
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                duration: 5000
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Get subscription details
    const subscriptionTier = authUser?.subscriptionTier || "free"
    const subscriptionStatus = authUser?.subscriptionStatus || "inactive"
    const planLimits = SUBSCRIPTION_LIMITS[subscriptionTier]

    // Format subscription tier for display
    const formattedTier = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)

    // Format subscription status for display
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "active": return { text: "Active", color: "text-green-600" };
            case "trialing": return { text: "Trial", color: "text-blue-600" };
            case "past_due": return { text: "Past Due", color: "text-amber-600" };
            case "canceled": return { text: "Canceled", color: "text-red-600" };
            default: return { text: "Inactive", color: "text-gray-600" };
        }
    }

    const statusDisplay = getStatusDisplay(subscriptionStatus)

    return (
        <div className="container py-10">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-8">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">General</span>
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Billing</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Privacy</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Manage your general account settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="theme">Dark Mode</Label>
                                            <p className="text-sm text-muted-foreground">Toggle between light and dark mode.</p>
                                        </div>
                                        <Switch id="theme" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="language">Language</Label>
                                            <p className="text-sm text-muted-foreground">Choose your preferred language.</p>
                                        </div>
                                        <select
                                            id="language"
                                            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your profile information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue={clerkUser?.firstName || ""} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue={clerkUser?.lastName || ""} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={clerkUser?.primaryEmailAddress?.emailAddress || ""}
                                        disabled
                                    />
                                    <p className="text-sm text-muted-foreground">Your email address is verified and cannot be changed.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="billing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Information</CardTitle>
                                <CardDescription>Manage your subscription and billing information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-lg border p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">Current Plan</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-lg font-semibold">{formattedTier} Plan</span>
                                                <span className={`text-sm ${statusDisplay.color} px-2 py-0.5 rounded-full bg-opacity-10 bg-current`}>
                                                    {statusDisplay.text}
                                                </span>
                                            </div>
                                        </div>
                                        <Link href="/pricing">
                                            <Button>{subscriptionTier === "family" ? "Manage" : "Upgrade"}</Button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h3 className="font-medium mb-3">Plan Features</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">
                                                {planLimits.maxFamilies === Infinity
                                                    ? "Unlimited family trees"
                                                    : `Up to ${planLimits.maxFamilies} family tree${planLimits.maxFamilies !== 1 ? 's' : ''}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">
                                                {planLimits.maxFamilyMembers === Infinity
                                                    ? "Unlimited family members"
                                                    : `Up to ${planLimits.maxFamilyMembers} family members per tree`}
                                            </span>
                                        </div>
                                        {Object.entries(planLimits.features).map(([feature, isIncluded]) => (
                                            <div key={feature} className="flex items-center gap-2">
                                                {isIncluded ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <span className="h-4 w-4 flex items-center justify-center text-gray-300">-</span>
                                                )}
                                                <span className={`text-sm ${!isIncluded ? 'text-gray-400' : ''}`}>
                                                    {feature
                                                        .replace(/([A-Z])/g, ' $1')
                                                        .replace(/^./, str => str.toUpperCase())
                                                        .replace(/([a-z])([A-Z])/g, '$1 $2')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h3 className="font-medium mb-2">Payment Methods</h3>
                                    <p className="text-sm text-muted-foreground mb-4">No payment methods added yet.</p>
                                    <Button variant="outline">Add Payment Method</Button>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h3 className="font-medium mb-2">Billing History</h3>
                                    <p className="text-sm text-muted-foreground mb-4">No billing history available.</p>
                                    <Button variant="outline">View Invoices</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>Manage how you receive notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="email-notifications">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                                        </div>
                                        <Switch id="email-notifications" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="marketing-emails">Marketing Emails</Label>
                                            <p className="text-sm text-muted-foreground">Receive marketing and promotional emails.</p>
                                        </div>
                                        <Switch id="marketing-emails" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="update-emails">Product Updates</Label>
                                            <p className="text-sm text-muted-foreground">Receive emails about new features and updates.</p>
                                        </div>
                                        <Switch id="update-emails" defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privacy">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                                <CardDescription>Manage your privacy and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                        </div>
                                        <Switch id="two-factor" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Change Password</Label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input id="current-password" type="password" placeholder="Current password" />
                                            <Input id="new-password" type="password" placeholder="New password" />
                                            <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions that affect your account.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-lg border border-red-200 p-4">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div>
                                            <h3 className="font-medium text-red-600">Sign Out</h3>
                                            <p className="text-sm text-muted-foreground">Sign out from your account on this device.</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            onClick={handleSignOut}
                                            disabled={isLoading}
                                            className="md:w-auto w-full"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            {isLoading ? "Signing Out..." : "Sign Out"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-red-200 p-4">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div>
                                            <h3 className="font-medium text-red-600">Delete Account</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Permanently delete your account and all your data.
                                            </p>
                                        </div>
                                        <Button variant="destructive" className="md:w-auto w-full">
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
