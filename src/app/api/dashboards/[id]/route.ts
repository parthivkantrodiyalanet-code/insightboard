import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Dashboard from '@/models/Dashboard';
import Widget from '@/models/Widget';
import Dataset from '@/models/Dataset';
import { getUserFromToken } from '@/lib/api/auth';

/**
 * GET /api/dashboards/[id]
 * Retrieves a single dashboard and its widgets
 */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dashboard = await Dashboard.findOne({ 
      _id: params.id, 
      userId: new mongoose.Types.ObjectId(userId) 
    }).populate({
      path: 'datasetId',
      model: Dataset
    });
    
    if (!dashboard) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const widgets = await Widget.find({ dashboardId: dashboard._id });

    return NextResponse.json({ dashboard, widgets });
  } catch (error) {
    console.error('Fetch dashboard detail error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const dashboard = await Dashboard.findOneAndUpdate(
      { _id: params.id, userId: new mongoose.Types.ObjectId(userId) },
      { $set: body },
      { new: true }
    );

    if (!dashboard) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Update dashboard error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete dashboard and associated widgets
    const dashboard = await Dashboard.findOneAndDelete({ 
        _id: params.id, 
        userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!dashboard) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    await Widget.deleteMany({ dashboardId: params.id });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete dashboard error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
