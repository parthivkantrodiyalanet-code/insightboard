import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

/**
 * GET /api/users
 * Retrieves all users (excluding passwords)
 * @returns Array of user objects
 */
export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Creates a new user account with hashed password and 15-day trial
 * @param request - Contains name, email, password, and optional role
 * @returns Created user object (without password)
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Set trial period (15 days from registration)
    const now = new Date();
    const trialEnds = new Date(now);
    trialEnds.setDate(trialEnds.getDate() + 15);

    const newUser = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'user',
      trialStartedAt: now,
      trialEndsAt: trialEnds,
      isPaid: false,
    });

    // Remove password from response
    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json(userObj, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

