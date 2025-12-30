import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/api/auth-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * POST /api/mock-payment
 * Simulates a successful payment for demo/trial purposes
 */
export async function POST() {
  // This endpoint is ONLY for the demo environment to simulate payment
  
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  
  const updatedUser = await User.findByIdAndUpdate(currentUser.userId, {
      isPaid: true,
      stripeCustomerId: 'cus_demo_123', // Dummy
      stripeSubscriptionId: 'sub_demo_123' // Dummy
  }, { new: true });

  if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Issue new token with updated status
  const token = jwt.sign(
    { 
      userId: updatedUser._id, 
      role: updatedUser.role,
      isPaid: updatedUser.isPaid,
      trialEndsAt: updatedUser.trialEndsAt
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const response = NextResponse.json({ success: true });
  
  // Set the cookie
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400, // 1 day
    path: '/',
  });

  return response;
}
