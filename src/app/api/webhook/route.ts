import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getKV, setKV } from "@/utils/redis"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
  try {
    const body = await req.text()
    // Get the Stripe signature directly from the request headers
    const stripeSignature = req.headers.get("stripe-signature")

    if (!stripeSignature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret)
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        // Handle successful checkout
        await handleSuccessfulCheckout(session)
        break
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        // Handle subscription updates
        await handleSubscriptionChange(subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Error handling webhook" }, { status: 500 })
  }
}

async function handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
  // Get the user ID from the client reference ID
  const userId = session.client_reference_id
  if (!userId) {
    console.error("No user ID found in session")
    return
  }

  // Get the subscription ID
  const subscriptionId = session.subscription as string
  if (!subscriptionId) {
    console.error("No subscription ID found in session")
    return
  }

  try {
    // Retrieve the subscription from Stripe to get the plan details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Determine which plan was purchased
    const priceId = subscription.items.data[0].price.id

    // Map the price ID to the appropriate subscription tier
    let tier: "free" | "premium" | "family" = "free"

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_ID) {
      tier = "premium"
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_ID ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_ID) {
      tier = "family"
    }

    // Update the user's subscription in our database
    await updateUserSubscription(userId, tier, subscription.status as any)

    console.log(`Updated user ${userId} subscription to ${tier} (${subscription.status})`)
  } catch (error) {
    console.error(`Error processing checkout for user ${userId}:`, error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    // Get the customer ID
    const customerId = subscription.customer as string

    // Find the user by customer ID
    // In this implementation, we need to look up which user this customer belongs to
    // This would typically be stored when creating the customer in Stripe
    // For now, we'll use metadata if available
    let userId = ""

    // Check if we have metadata with the user ID
    if (subscription.metadata && subscription.metadata.userId) {
      userId = subscription.metadata.userId
    } else {
      // Retrieve the customer to check for metadata
      const customer = await stripe.customers.retrieve(customerId)
      if (customer && !customer.deleted && customer.metadata && customer.metadata.userId) {
        userId = customer.metadata.userId
      } else {
        console.error(`No user ID found for customer ${customerId}`)
        return
      }
    }

    // Determine the subscription tier based on the price
    const priceId = subscription.items.data[0].price.id

    let tier: "free" | "premium" | "family" = "free"

    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_ID) {
      tier = "premium"
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_ID ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_ID) {
      tier = "family"
    }

    // If subscription is canceled or unpaid, revert to free tier
    if (subscription.status === "canceled" || subscription.status === "unpaid") {
      tier = "free"
    }

    // Update the user's subscription
    await updateUserSubscription(userId, tier, subscription.status as any)

    console.log(`Updated subscription for user ${userId} to ${tier} (${subscription.status})`)
  } catch (error) {
    console.error(`Error processing subscription change:`, error)
  }
}

// Helper function to update user subscription in our database
async function updateUserSubscription(
  userId: string,
  tier: "free" | "premium" | "family",
  status: "active" | "inactive" | "trialing" | "past_due" | "canceled"
) {
  try {
    // Get the current user data
    const userData = await getKV(`user_${userId}`)

    if (userData) {
      // Update the subscription information
      const updatedUser = {
        ...userData,
        subscriptionTier: tier,
        subscriptionStatus: status,
      }

      // Save the updated user data
      await setKV(`user_${userId}`, updatedUser)
    } else {
      console.error(`User ${userId} not found in database`)
    }
  } catch (error) {
    console.error(`Error updating user subscription in database:`, error)
    throw error
  }
}
