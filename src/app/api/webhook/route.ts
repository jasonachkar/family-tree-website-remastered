import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature") || ""

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
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
  // Here you would update your database to reflect the user's subscription
  const userId = session.client_reference_id
  const subscriptionId = session.subscription as string

  console.log(`User ${userId} subscribed with subscription ID: ${subscriptionId}`)

  // In a real implementation, you would update your database
  // Example: await db.user.update({ where: { id: userId }, data: { subscriptionId, subscriptionStatus: 'active' } })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const status = subscription.status
  const customerId = subscription.customer as string

  console.log(`Subscription ${subscription.id} for customer ${customerId} is now ${status}`)

  // In a real implementation, you would update your database
  // Example: await db.user.update({ where: { stripeCustomerId: customerId }, data: { subscriptionStatus: status } })
}
