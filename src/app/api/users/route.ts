import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();
    // Exclude password from the result
    const users = await User.find({}).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

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

    const { password, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
