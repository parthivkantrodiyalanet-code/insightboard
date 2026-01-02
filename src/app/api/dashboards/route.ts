import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Dashboard from '@/models/Dashboard';
import Dataset from '@/models/Dataset'; // Ensure models are registered
import { getUserFromToken } from '@/lib/api/auth';

/**
 * GET /api/dashboards
 * Retrieves all dashboards for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dashboards = await Dashboard.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'datasetId',
      model: Dataset,
      select: 'name createdAt'
    });

    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Fetch dashboards error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

/* POST Handler */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Limit Check
    const user = await import('@/models/User').then(mod => mod.default.findById(userId));
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    if (!user.isPaid) {
      const count = await Dashboard.countDocuments({ userId, isDemo: { $ne: true } });
      if (count >= 2) {
        return NextResponse.json({ 
          error: 'Free tier limit reached (Max 2 Custom Dashboards). Please upgrade.' 
        }, { status: 400 });
      }
    }

    const body = await request.json();
    const dashboard = await Dashboard.create({
      userId,
      name: body.name || 'Untitled Dashboard',
      description: body.description,
      datasetId: body.datasetId || null
    });

    return NextResponse.json(dashboard, { status: 201 });
  } catch (error) {
    console.error('Create dashboard error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
