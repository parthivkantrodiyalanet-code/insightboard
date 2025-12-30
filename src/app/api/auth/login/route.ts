import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: body.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create Token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        isPaid: user.isPaid,
        trialEndsAt: user.trialEndsAt
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({
      token,
      user: userObj
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
