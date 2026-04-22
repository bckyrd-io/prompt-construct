import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// GET /api/applications - List all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let queryString = `
      SELECT 
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
        p.name as property_name,
        p.location as property_location,
        p.price as property_price
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN properties p ON a.property_id = p.id
    `;

    const params: any[] = [];

    if (userId) {
      queryString += ' WHERE a.user_id = $1';
      params.push(userId);
    }

    queryString += ' ORDER BY a.created_at DESC';

    const result = await query(queryString, params);

    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Submit new application
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const {
      property_id,
      employment,
      income,
      down_payment,
      email
    } = body;

    // Get user ID from session/auth header
    const authHeader = request.headers.get('authorization');
    let userId: number | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Try to get user from token
      try {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
        if (tokenData.userId) {
          userId = tokenData.userId;
        }
      } catch {
        // Invalid token format
      }
    }

    // If no token, try to get from request body (for backwards compatibility)
    if (!userId) {
      
      if (email) {
        const userResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [email]
        );
        if (userResult.rows.length > 0) {
          userId = userResult.rows[0].id;
        }
      }
    }

    if (!property_id || !employment || !income) {
      return NextResponse.json(
        { error: 'Property ID, employment status, and income are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User not found. Please sign up or log in first.' },
        { status: 404 }
      );
    }

    // Check property status - block applications for acquired or payment_in_progress properties
    const propertyResult = await client.query(
      'SELECT status FROM properties WHERE id = $1',
      [property_id]
    );

    if (propertyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const propertyStatus = propertyResult.rows[0].status;
    if (propertyStatus === 'acquired' || propertyStatus === 'payment_in_progress') {
      return NextResponse.json(
        { error: 'This property is not available for new applications' },
        { status: 400 }
      );
    }

    // Check if user already has an application for this property
    const existingApp = await client.query(
      'SELECT id FROM applications WHERE user_id = $1 AND property_id = $2',
      [userId, property_id]
    );

    if (existingApp.rows.length > 0) {
      return NextResponse.json(
        { error: 'You already have an application for this property' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Insert application (simplified - only critical fields)
    const result = await client.query(
      `INSERT INTO applications (
        user_id, property_id, employment, income, down_payment,
        status, step
      ) VALUES ($1, $2, $3, $4, $5, 'pending', 1)
      RETURNING *`,
      [
        userId,
        property_id,
        employment,
        income,
        down_payment || 0
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      applicationId: result.rows[0].id,
      application: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
