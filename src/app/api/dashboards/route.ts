import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Dashboard from '@/models/Dashboard';
import Widget from '@/models/Widget';
import Dataset from '@/models/Dataset'; // Ensure models are registered
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/* Helper */
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

/* GET Handler */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dashboards = await Dashboard.find({ userId }).sort({ updatedAt: -1 }).populate('datasetId', 'name createdAt');
    console.log(dashboards);
    return NextResponse.json(dashboards);
  } catch (error) {
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
      const count = await Dashboard.countDocuments({ userId });
      if (count >= 2) {
        return NextResponse.json({ 
          error: 'Free tier limit reached (Max 2 Dashboards). Please upgrade.' 
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
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
