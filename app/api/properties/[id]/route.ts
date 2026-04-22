import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/properties/[id] - Get single property with milestones
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const propertyResult = await query(`
      SELECT
        p.id,
        p.name,
        p.location,
        p.price,
        p.type,
        p.status,
        p.image_url,
        p.client_id,
        p.progress,
        p.beds,
        p.baths,
        p.sqft,
        p.created_at,
        u.name as client_name,
        u.email as client_email
      FROM properties p
      LEFT JOIN users u ON p.client_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (propertyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = propertyResult.rows[0];

    // Get milestones
    const milestonesResult = await query(
      `SELECT id, name, completed, current, payment_status, amount, due_date, photos, ai_note
       FROM property_milestones
       WHERE property_id = $1
       ORDER BY display_order`,
      [id]
    );

    return NextResponse.json({
      property: {
        ...property,
        client: property.client_id ? {
          id: property.client_id,
          name: property.client_name,
          email: property.client_email
        } : null,
        milestones: milestonesResult.rows.map((m: any) => ({
          ...m,
          photos: m.photos || []
        }))
      }
    });
  } catch (error) {
    console.error('Get property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update property details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const allowedFields = ['name', 'location', 'price', 'type', 'status', 'image_url', 'client_id', 'progress', 'beds', 'baths', 'sqft'];
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at
    setClause.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    const query_text = `UPDATE properties SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(query_text, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query(
      'DELETE FROM properties WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
