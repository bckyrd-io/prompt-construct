import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/applications/[id] - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      `SELECT 
        a.id,
        a.user_id,
        a.property_id,
        a.status,
        a.step,
        a.first_name,
        a.last_name,
        a.phone,
        a.address,
        a.city,
        a.state,
        a.zip,
        a.employment,
        a.income,
        a.down_payment,
        a.uploaded_documents,
        a.created_at,
        a.updated_at,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        p.name as property_name,
        p.location as property_location,
        p.price as property_price,
        p.type as property_type,
        p.image_url as property_image
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN properties p ON a.property_id = p.id
      WHERE a.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application: result.rows[0] });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
