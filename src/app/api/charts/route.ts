import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Chart from '@/models/Chart';
import Dataset from '@/models/Dataset';
import { getUserFromToken } from '@/lib/api/auth';

/**
 * GET /api/charts
 * Returns all charts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const charts = await Chart.find({ userId }).populate('datasetId');
    return NextResponse.json(charts);
  } catch {
    // Specifically handle expired tokens vs malformed ones if needed
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { datasetName, data, chartConfig } = body;

    if (!data || !chartConfig) {
       return NextResponse.json({ error: 'Missing data or configuration' }, { status: 400 });
    }

    // 1. Create Dataset
    const newDataset = await Dataset.create({
      userId,
      name: datasetName || 'Untitled Dataset',
      data: data
    });

    // 2. Create Chart linked to Dataset
    const newChart = await Chart.create({
      userId,
      datasetId: newDataset._id,
      title: chartConfig.title || 'New Chart',
      type: chartConfig.type,
      xAxisKey: chartConfig.xAxisKey,
      yAxisKey: chartConfig.yAxisKey,
      color: chartConfig.color
    });

    return NextResponse.json({ chart: newChart, dataset: newDataset }, { status: 201 });

  } catch (error) {
    console.error('Create chart error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
