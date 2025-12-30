import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Dataset from '@/models/Dataset';
import { generateDataSummary } from '@/lib/utils/data-analyzer';
import { fetchAIInsights } from '@/lib/utils/gemini';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /api/insights
 * Generates and caches AI-driven insights for a given dataset
 */
async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { datasetId } = await request.json();
    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Check if insights are already cached and fresh
    // For now, let's just use them if they exist. 
    // In a real app we might check if 'updatedAt' of dataset is newer than 'generatedAt' of insights.
    if (dataset.insights && dataset.insights.keyInsights) {
      return NextResponse.json({ insights: dataset.insights });
    }

    const summary = generateDataSummary(dataset.name, dataset.data);
    const insights = await fetchAIInsights(summary);

    // Cache the insights
    dataset.insights = {
      ...insights,
      generatedAt: new Date()
    };
    await dataset.save();

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error in /api/insights:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
