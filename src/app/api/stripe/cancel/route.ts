
import { NextResponse, NextRequest } from 'next/server';
import { stripe } from '@/lib/api/stripe';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getUserFromToken } from '@/lib/api/auth';

/**
 * POST /api/stripe/cancel
 * Cancels the user's active subscription immediately.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Cancel at Stripe
    // If it's a demo/test key, this might fail unless we mock it, 
    // but the stripe library handles test mode if configured correctly.
    // If it's a dummy ID (from manual DB edits), it will fail.
    try {
        if (!user.stripeSubscriptionId.startsWith('sub_') && process.env.NODE_ENV !== 'production') {
            // Mock cancellation for non-Stripe IDs in dev
            console.log('[Mock] Cancelled sub:', user.stripeSubscriptionId);
        } else {
            await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        }
    } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        return NextResponse.json({ error: 'Failed to cancel subscription with payment provider' }, { status: 500 });
    }

    // Update local DB immediately (Webhook will double confirm later)
    user.isPaid = false;
    user.stripeSubscriptionId = null;
    await user.save();

    return NextResponse.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
