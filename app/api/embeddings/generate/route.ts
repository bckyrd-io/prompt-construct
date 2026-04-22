import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateBatchEmbeddings, embeddingToPgVector } from '@/lib/embeddings';

// POST /api/embeddings/generate - Generate embeddings for all properties without embeddings
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please add it to your environment variables.' },
        { status: 500 }
      );
    }

    // Fetch all properties that don't have embeddings yet
    const result = await query(
      `SELECT id, name, description
       FROM properties
       WHERE description IS NOT NULL
       AND embedding IS NULL`
    );

    const properties = result.rows;

    if (properties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All properties already have embeddings',
        processed: 0,
        total: 0
      });
    }

    // Generate embeddings for all properties
    const texts = properties.map((p: { name: string; description: string }) => `${p.name}: ${p.description}`);
    const embeddings = await generateBatchEmbeddings(texts);

    // Update each property with its embedding
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const embedding = embeddings[i];

      try {
        await query(
          `UPDATE properties
           SET embedding = $1
           WHERE id = $2`,
          [embeddingToPgVector(embedding), property.id]
        );
        successCount++;
      } catch (error) {
        console.error(`Error updating embedding for property ${property.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated embeddings for ${successCount} properties`,
      processed: successCount,
      errors: errorCount,
      total: properties.length
    });
  } catch (error) {
    console.error('Generate embeddings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/embeddings/generate - Check embedding status
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embeddings,
        COUNT(CASE WHEN embedding IS NULL THEN 1 END) as without_embeddings
       FROM properties
       WHERE description IS NOT NULL`
    );

    const stats = result.rows[0];

    return NextResponse.json({
      total: parseInt(stats.total),
      with_embeddings: parseInt(stats.with_embeddings),
      without_embeddings: parseInt(stats.without_embeddings),
      percentage: stats.total > 0 
        ? Math.round((stats.with_embeddings / stats.total) * 100) 
        : 0
    });
  } catch (error) {
    console.error('Get embedding status error:', error);
    return NextResponse.json(
      { error: 'Failed to get embedding status' },
      { status: 500 }
    );
  }
}
