import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// GET /api/properties/[id]/milestones - Get milestones for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query(
      `SELECT id, name, completed, current, payment_status, amount, due_date, photos, ai_note, display_order
       FROM property_milestones
       WHERE property_id = $1
       ORDER BY display_order`,
      [id]
    );

    return NextResponse.json({
      milestones: result.rows.map(m => ({
        ...m,
        photos: m.photos || []
      }))
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id]/milestones - Update multiple milestones
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();
  
  try {
    const { id } = await params;
    const { milestones } = await request.json();

    if (!Array.isArray(milestones)) {
      return NextResponse.json(
        { error: 'Milestones must be an array' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Verify property exists
    const propertyCheck = await client.query(
      'SELECT id FROM properties WHERE id = $1',
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Get existing milestone IDs from database
    const existingMilestonesResult = await client.query(
      'SELECT id FROM property_milestones WHERE property_id = $1',
      [id]
    );
    const existingIds = new Set(existingMilestonesResult.rows.map((row: any) => row.id));
    const submittedIds = new Set(milestones.map((m: any) => m.id));

    // Delete milestones that were removed (exist in DB but not in submitted array)
    for (const existingId of existingIds) {
      if (!submittedIds.has(existingId)) {
        await client.query(
          'DELETE FROM property_milestones WHERE id = $1 AND property_id = $2',
          [existingId, id]
        );
      }
    }

    // Process each milestone
    for (const milestone of milestones) {
      const {
        id: milestoneId,
        name,
        completed,
        current,
        payment_status,
        amount,
        due_date,
        photos,
        ai_note
      } = milestone;

      // Negative ID means it's a new milestone - create it
      if (milestoneId < 0) {
        // Get the next display_order
        const maxOrderResult = await client.query(
          'SELECT COALESCE(MAX(display_order), 0) as max_order FROM property_milestones WHERE property_id = $1',
          [id]
        );
        const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

        await client.query(
          `INSERT INTO property_milestones (property_id, name, display_order, completed, current, payment_status, amount, due_date, photos, ai_note)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id,
            name || '',
            nextOrder,
            completed || false,
            current || false,
            payment_status || 'unpaid',
            amount || 0,
            due_date || null,
            photos || [],
            ai_note || null
          ]
        );
      } else {
        // Positive ID means it's an existing milestone - update it
        const setClause: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (name !== undefined) {
          setClause.push(`name = $${paramCount}`);
          values.push(name);
          paramCount++;
        }

        if (completed !== undefined) {
          setClause.push(`completed = $${paramCount}`);
          values.push(completed);
          paramCount++;
        }

        if (current !== undefined) {
          setClause.push(`current = $${paramCount}`);
          values.push(current);
          paramCount++;
        }

        if (payment_status !== undefined) {
          setClause.push(`payment_status = $${paramCount}`);
          values.push(payment_status);
          paramCount++;
        }

        if (amount !== undefined) {
          setClause.push(`amount = $${paramCount}`);
          values.push(amount);
          paramCount++;
        }

        if (due_date !== undefined) {
          setClause.push(`due_date = $${paramCount}`);
          values.push(due_date);
          paramCount++;
        }

        if (photos !== undefined) {
          setClause.push(`photos = $${paramCount}`);
          values.push(photos);
          paramCount++;
        }

        if (ai_note !== undefined) {
          setClause.push(`ai_note = $${paramCount}`);
          values.push(ai_note);
          paramCount++;
        }

        if (setClause.length > 0) {
          setClause.push(`updated_at = CURRENT_TIMESTAMP`);
          values.push(milestoneId);

          const query_text = `UPDATE property_milestones SET ${setClause.join(', ')} WHERE id = $${paramCount} AND property_id = $${paramCount + 1}`;
          values.push(id);

          await client.query(query_text, values);
        }
      }
    }

    // Recalculate progress based on completed milestones
    const progressResult = await client.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
       FROM property_milestones
       WHERE property_id = $1`,
      [id]
    );

    const { total, completed } = progressResult.rows[0];
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update property progress
    await client.query(
      'UPDATE properties SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [progress, id]
    );

    await client.query('COMMIT');

    // Get updated milestones
    const updatedResult = await query(
      `SELECT id, name, completed, current, payment_status, amount, due_date, photos, ai_note, display_order
       FROM property_milestones
       WHERE property_id = $1
       ORDER BY display_order`,
      [id]
    );

    return NextResponse.json({
      success: true,
      progress,
      milestones: updatedResult.rows.map(m => ({
        ...m,
        photos: m.photos || []
      }))
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update milestones error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
