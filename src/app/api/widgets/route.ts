import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Widget from '@/models/Widget';
import Dashboard from '@/models/Dashboard';
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

/* POST Handler */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    

    const dashboard = await Dashboard.findOne({ _id: body.dashboardId, userId });
    if (!dashboard) return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });

    // Limit Check
    const user = await import('@/models/User').then(mod => mod.default.findById(userId));
    if (!user.isPaid) {
        const count = await Widget.countDocuments({ dashboardId: body.dashboardId });
        if (count >= 8) {
             return NextResponse.json({ error: 'Free tier limit reached (Max 8 Widgets per Dashboard). Please upgrade.' }, { status: 400 });
        }
    }

    const widget = await Widget.create({
      dashboardId: body.dashboardId,
      title: body.title,
      type: body.type,
      config: body.config
    });

    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

/* DELETE Handler */
export async function DELETE(request: NextRequest) {

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if(!id) return NextResponse.json({error: 'ID required'}, {status: 400});
    

    await connectToDatabase();
    await Widget.findByIdAndDelete(id);
    return NextResponse.json({success: true});
}
