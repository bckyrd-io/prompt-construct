import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

// PUT /api/applications/[id]/step - Update application step
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await getClient();

  try {
    const { step } = await request.json();

    if (!step || step < 1 || step > 5) {
      return NextResponse.json(
        { error: 'Valid step (1-5) is required' },
        { status: 400 }
      );
    }

    const result = await client.query(
      `UPDATE applications 
       SET step = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [step, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Update application step error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
