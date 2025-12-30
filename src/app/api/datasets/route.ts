import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Dataset from '@/models/Dataset';
import { getUserFromToken } from '@/lib/api/auth';

/**
 * GET /api/datasets
 * Retrieves all datasets for the authenticated user
 */
export async function GET(request: NextRequest) {
   try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const datasets = await Dataset.find({ userId }).select('name createdAt updatedAt');
    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Fetch datasets error:', error);
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
  } catch (e) {
      console.error('Create dataset error:', e);
      return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
