import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Dashboard from '@/models/Dashboard';
import Widget from '@/models/Widget';
import Dataset from '@/models/Dataset';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function getUserFromToken(request: Request) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dashboard = await Dashboard.findOne({ _id: params.id, userId }).populate('datasetId');
    if (!dashboard) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const widgets = await Widget.find({ dashboardId: dashboard._id });

    return NextResponse.json({ dashboard, widgets });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const dashboard = await Dashboard.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: body },
      { new: true }
    );

    if (!dashboard) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete dashboard and associated widgets
    const dashboard = await Dashboard.findOneAndDelete({ _id: params.id, userId });
    
    if (!dashboard) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    await Widget.deleteMany({ dashboardId: params.id });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
