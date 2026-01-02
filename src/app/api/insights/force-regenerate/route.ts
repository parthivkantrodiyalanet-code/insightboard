
import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db';
import Dataset from '@/models/Dataset';
import { generateDataSummary } from '@/lib/utils/data-analyzer';
import { fetchAIInsights } from '@/lib/utils/gemini';
import { getUserFromToken } from '@/lib/api/auth';

/**
 * POST /api/insights/force-regenerate
 * Forces regeneration of AI insights for a given dataset, ignoring cache.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { datasetId } = await req.json();
    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    // Ensure the dataset belongs to the user or global demo
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Generate fresh insights
    // console.log(`Regenerating insights for dataset ${dataset} by user ${userId}`);
    const summary = generateDataSummary(dataset.name, dataset.data);
    const insights = await fetchAIInsights(summary);

    // Update dataset
    dataset.insights = {
        ...insights,
        generatedAt: new Date()
    };
    await dataset.save();

    return NextResponse.json({ insights: dataset.insights });
  } catch (error) {
    console.error('Insight regeneration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
