import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function GET(request: Request) {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    await connectToDatabase();
    
    // Select name, email, role, and createdAt
    const user = await User.findById(decoded.userId).select('name email role createdAt');
    
    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
  }
}
