import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Dataset from '@/models/Dataset';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
   try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const datasets = await Dataset.find({ userId }).select('name createdAt updatedAt');
    return NextResponse.json(datasets);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, data } = body;

    // Limit Check
    const user = await import('@/models/User').then(mod => mod.default.findById(userId));
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!user.isPaid) {
        // Dataset Count Limit
        const count = await Dataset.countDocuments({ userId });
        if (count >= 3) {
            return NextResponse.json({ error: 'Free tier limit reached (Max 3 Datasets). Please upgrade.' }, { status: 400 });
        }
        
        // Row Limit
        if (Array.isArray(data) && data.length > 5000) {
             return NextResponse.json({ error: 'Free tier limit reached (Max 5,000 rows). Please upgrade.' }, { status: 400 });
        }
    }

    const dataset = await Dataset.create({
        userId,
        name,
        data
    });
    
    return NextResponse.json(dataset, { status: 201 });
  } catch(e) {
      return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
