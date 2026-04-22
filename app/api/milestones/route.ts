import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

// POST /api/milestones - Create custom milestone for a property
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const { property_id, name, description, cost, image_url } = await request.json();

    if (!property_id || !name || !cost) {
      return NextResponse.json(
        { error: 'Property ID, name, and cost are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Insert new milestone
    const result = await client.query(
      `INSERT INTO property_milestones (property_id, name, description, cost, payment_status, completed, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        property_id,
        name,
        description || null,
        parseInt(cost), // MWK
        'pending',
        false,
        image_url || null
      ]
    );

    // Recalculate property progress
    const progressResult = await client.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
       FROM property_milestones
       WHERE property_id = $1`,
      [property_id]
    );

    const { total, completed } = progressResult.rows[0];
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update property progress
    await client.query(
      'UPDATE properties SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [progress, property_id]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      milestone: result.rows[0],
      message: 'Milestone created successfully'
    }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create milestone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
