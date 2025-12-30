import { NextResponse } from 'next/server';
import { stripe } from '@/lib/api/stripe';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events to sync subscription status
 */
export async function POST(req: Request) {
  let event;
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_SECRET_KEY?.includes('demo')) {
        // Real signature verification
        if (!signature) throw new Error('Missing signature');
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
        // Mock / Debug mode: Trust the body or parse it directly
        // This is strictly for the demo/dev environment
        console.log('[Stripe Webhook] Skipping signature verification (Demo/Mock mode)');
        event = JSON.parse(body);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Webhook Error';
    console.error(`Webhook Error: ${errorMsg}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }

  // Handle the event
  console.log('[Stripe Webhook] Received event:', event.type);

  try {
      await connectToDatabase();
      
      switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            
            if (userId) {
                console.log(`[Stripe Webhook] Enabling subscription for user ${userId}`);
                await User.findByIdAndUpdate(userId, {
                    isPaid: true,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    // Optionally extend trialEndsAt to null or future?
                    // Usually we kept trial for historical record or just ignore it if isPaid is true.
                    // The middleware checks isPaid OR trial active. So true is enough.
                });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            // Handle cancellation
            const subscription = event.data.object;
             // We'd need to find user by stripeSubscriptionId if we didn't have metadata here
             // But usually we sync subscription ID.
            const user = await User.findOne({ stripeSubscriptionId: subscription.id });
            if (user) {
                 console.log(`[Stripe Webhook] Disabling subscription for user ${user._id}`);
                 await User.findByIdAndUpdate(user._id, { isPaid: false });
            }
            break;
        }
        default:
            // console.log(`Unhandled event type ${event.type}`);
      }
  } catch (err) {
      console.error('Error processing webhook event:', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
