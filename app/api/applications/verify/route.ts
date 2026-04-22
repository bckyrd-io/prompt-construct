import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

// POST /api/applications/verify - Verify user and register first milestone
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const { userId, applicationId } = await request.json();

    if (!userId || !applicationId) {
      return NextResponse.json(
        { error: 'User ID and Application ID are required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Check if application exists and is pending
    const appResult = await client.query(
      'SELECT id, property_id, status FROM applications WHERE id = $1 AND user_id = $2',
      [applicationId, userId]
    );

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = appResult.rows[0];

    if (application.status !== 'pending') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Application is not pending' },
        { status: 400 }
      );
    }

    // Check if milestones already exist for this property
    const existingMilestones = await client.query(
      'SELECT id FROM property_milestones WHERE property_id = $1',
      [application.property_id]
    );

    let milestoneId = null;

    // Only create milestone if none exist
    if (existingMilestones.rows.length === 0) {
      // Create first milestone (Application & Verification)
      const milestoneResult = await client.query(
        `INSERT INTO property_milestones (property_id, name, description, cost, payment_status, completed, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          application.property_id,
          'Application & Verification',
          'Initial application processing and user verification',
          50000, // MWK - verification fee
          'pending',
          false
        ]
      );
      milestoneId = milestoneResult.rows[0].id;
    }

    // Update application status to approved
    await client.query(
      'UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['approved', applicationId]
    );

    // Update property status to payment_in_progress
    await client.query(
      'UPDATE properties SET status = $1, client_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['payment_in_progress', userId, application.property_id]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      milestoneId,
      message: milestoneId
        ? 'User verified successfully. First milestone registered.'
        : 'User verified successfully. Property is ready for payment.'
    }, { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
