"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loadStripe } from "@stripe/stripe-js"
import { useUser } from "@clerk/nextjs"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const { isSignedIn, user } = useUser()
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async (priceId: string) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in?redirect=/pricing"
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error("Error redirecting to checkout:", error)
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const plans = {
    free: {
      name: "Free",
      price: { monthly: "$0", yearly: "$0" },
      description: "Basic features for individuals just getting started",
      features: ["Create 1 family tree", "Add up to 50 family members", "Basic tree visualization", "Standard support"],
      notIncluded: ["Advanced relationship mapping", "Family stories", "Data export", "Priority support"],
      priceId: { monthly: "", yearly: "" }, // No price ID for free plan
      popular: false,
    },
    premium: {
      name: "Premium",
      price: { monthly: "$9.99", yearly: "$99.99" },
      description: "Advanced features for serious genealogists",
      features: [
        "Create up to 5 family trees",
        "Add up to 500 family members",
        "Advanced relationship mapping",
        "Family stories",
        "Data export",
        "Priority support",
      ],
      notIncluded: [],
      priceId: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_monthly",
        yearly: "price_yearly",
      },
      popular: true,
    },
    family: {
      name: "Family",
      price: { monthly: "$19.99", yearly: "$199.99" },
      description: "Complete solution for families and historians",
      features: [
        "Unlimited family trees",
        "Unlimited family members",
        "Advanced relationship mapping",
        "Family stories",
        "Data export",
        "Priority support",
        "Collaborative editing",
        "Advanced media storage",
      ],
      notIncluded: [],
      priceId: { monthly: "price_family_monthly", yearly: "price_family_yearly" },
      popular: false,
    },
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose Your Plan</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Select the perfect plan for your family history needs.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center space-x-4 mt-8">
              <div className={`text-sm font-medium ${selectedPlan === "monthly" ? "text-blue-600" : "text-gray-500"}`}>
                Monthly
              </div>
              <button
                onClick={() => setSelectedPlan(selectedPlan === "monthly" ? "yearly" : "monthly")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  selectedPlan === "yearly" ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    selectedPlan === "yearly" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <div className="flex items-center">
                <span
                  className={`text-sm font-medium ${selectedPlan === "yearly" ? "text-blue-600" : "text-gray-500"}`}
                >
                  Yearly
                </span>
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                  Save 20%
                </span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8 w-full max-w-5xl">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col rounded-lg border bg-white shadow-sm"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{plans.free.name}</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">{plans.free.price[selectedPlan]}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-gray-500">{plans.free.description}</p>
                  <Link href={isSignedIn ? "/dashboard" : "/sign-up"} passHref>
                    <Button className="mt-6 w-full" variant="outline">
                      {isSignedIn ? "Access Dashboard" : "Sign Up Free"}
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                    <ul className="space-y-2">
                      {plans.free.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Not included:</h4>
                    <ul className="space-y-2">
                      {plans.free.notIncluded.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <X className="h-4 w-4 text-gray-300" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col rounded-lg border-2 border-blue-600 bg-white shadow-md relative"
              >
                {plans.premium.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 py-1 text-center text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{plans.premium.name}</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">{plans.premium.price[selectedPlan]}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-gray-500">{plans.premium.description}</p>
                  <Button
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleCheckout(plans.premium.priceId[selectedPlan])}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : isSignedIn ? "Upgrade Now" : "Get Started"}
                  </Button>
                </div>
                <div className="flex flex-col p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                    <ul className="space-y-2">
                      {plans.premium.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Family Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col rounded-lg border bg-white shadow-sm"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{plans.family.name}</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">{plans.family.price[selectedPlan]}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-gray-500">{plans.family.description}</p>
                  <Button
                    className="mt-6 w-full"
                    onClick={() => handleCheckout(plans.family.priceId[selectedPlan])}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : isSignedIn ? "Upgrade Now" : "Get Started"}
                  </Button>
                </div>
                <div className="flex flex-col p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                    <ul className="space-y-2">
                      {plans.family.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Compare Features</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                See which plan is right for you and your family.
              </p>
            </div>
          </div>

          <div className="mt-12 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 text-left font-medium text-gray-500">Features</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-500">Free</th>
                  <th className="py-4 px-6 text-center font-medium text-blue-600">Premium</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-500">Family</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Family Trees</td>
                  <td className="py-4 px-6 text-center text-sm">1</td>
                  <td className="py-4 px-6 text-center text-sm">Up to 5</td>
                  <td className="py-4 px-6 text-center text-sm">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Family Members</td>
                  <td className="py-4 px-6 text-center text-sm">Up to 50</td>
                  <td className="py-4 px-6 text-center text-sm">Up to 500</td>
                  <td className="py-4 px-6 text-center text-sm">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Advanced Relationship Mapping</td>
                  <td className="py-4 px-6 text-center text-sm">
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Family Stories</td>
                  <td className="py-4 px-6 text-center text-sm">
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Data Export</td>
                  <td className="py-4 px-6 text-center text-sm">
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Collaborative Editing</td>
                  <td className="py-4 px-6 text-center text-sm">
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-6 text-sm font-medium">Priority Support</td>
                  <td className="py-4 px-6 text-center text-sm">
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Find answers to common questions about our platform.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-3xl gap-8 mt-12">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Can I switch plans later?</h3>
              <p className="text-gray-500">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing
                cycle.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">How secure is my family data?</h3>
              <p className="text-gray-500">
                We take data security seriously. All your family information is encrypted and stored securely. We never
                share your data with third parties.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Can I cancel my subscription?</h3>
              <p className="text-gray-500">
                Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features
                until the end of your current billing period.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Is there a free trial for paid plans?</h3>
              <p className="text-gray-500">
                We offer a 14-day free trial for our Premium plan. You can explore all the features before committing to
                a subscription.
              </p>
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
                Start Building Your Family Tree Today
              </h2>
              <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of families who are preserving their history for future generations.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup" passHref>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
