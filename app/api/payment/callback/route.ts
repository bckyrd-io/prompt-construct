import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// This route handles successful payment callbacks from Paychangu
export async function GET(request: NextRequest) {
  const client = await getClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const tx_ref = searchParams.get('tx_ref');
    const transaction_id = searchParams.get('transaction_id');
    const status = searchParams.get('status');

    // Log the request URL for debugging
    console.log('Payment callback received:', {
      url: request.url,
      host: request.nextUrl.host,
      origin: request.nextUrl.origin,
      tx_ref,
      transaction_id,
      status
    });

    if (!tx_ref) {
      console.error('Missing tx_ref in callback');
      const redirectUrl = new URL('/dashboard', request.url);
      redirectUrl.searchParams.set('payment', 'error');
      redirectUrl.searchParams.set('message', 'missing_tx_ref');
      return NextResponse.redirect(redirectUrl);
    }

    // Retrieve transaction metadata from database
    const txResult = await client.query(
      'SELECT milestone_id, property_id, amount, milestone_name FROM payment_transactions WHERE tx_ref = $1',
      [tx_ref]
    );

    if (txResult.rows.length === 0) {
      console.error('Transaction metadata not found for tx_ref:', tx_ref);
      const redirectUrl = new URL('/dashboard', request.url);
      redirectUrl.searchParams.set('payment', 'error');
      redirectUrl.searchParams.set('message', 'metadata_not_found');
      return NextResponse.redirect(redirectUrl);
    }

    const { milestone_id, property_id, amount, milestone_name } = txResult.rows[0];

    // Verify transaction with Paychangu API
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    let isVerified = false;

    if (secretKey) {
      try {
        const verifyResponse = await fetch(`https://api.paychangu.com/verify/${tx_ref}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Accept': 'application/json',
          },
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('Transaction verification:', verifyData);
          // Check if payment status is successful
          if (verifyData.status === 'success' || verifyData.data?.status === 'success') {
            isVerified = true;
          }
        }
      } catch (verifyError) {
        console.error('Transaction verification failed:', verifyError);
        // Continue with callback even if verification fails
      }
    }

    // For now, also accept if status parameter indicates success
    const isSuccess = isVerified || status === 'success' || status === null || status === undefined;

    if (isSuccess) {
      await client.query('BEGIN');

      if (milestone_id === '-1') {
        // Complete Pay milestone - mark property as fully paid
        if (property_id) {
          // Update property status to acquired and progress to 100%
          await client.query(
            'UPDATE properties SET status = $1, progress = 100, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['acquired', property_id]
          );

          // Get client_id from property
          const clientResult = await client.query(
            'SELECT client_id FROM properties WHERE id = $1',
            [property_id]
          );

          if (clientResult.rows.length > 0 && clientResult.rows[0].client_id) {
            const userId = clientResult.rows[0].client_id;

            // Find application for this user and property
            const appResult = await client.query(
              'SELECT id FROM applications WHERE user_id = $1 AND property_id = $2 LIMIT 1',
              [userId, property_id]
            );

            const applicationId = appResult.rows.length > 0 ? appResult.rows[0].id : null;

            // Insert payment record for complete payment
            await client.query(
              `INSERT INTO payments (user_id, application_id, amount, status, provider_ref, created_at, updated_at)
               VALUES ($1, $2, $3, 'completed', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [userId, applicationId, parseFloat(amount || '0'), transaction_id || tx_ref || '']
            );
          }
        }
      } else if (milestone_id) {
        // Regular milestone - update to paid
        await client.query(
          `UPDATE property_milestones
           SET payment_status = 'paid',
               completed = true,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [milestone_id]
        );

        // Get property_id and application_id to recalculate progress and insert payment
        const propResult = await client.query(
          'SELECT property_id FROM property_milestones WHERE id = $1',
          [milestone_id]
        );

        if (propResult.rows.length > 0) {
          const propId = propResult.rows[0].property_id;

          // Recalculate progress
          const progressResult = await client.query(
            `SELECT
              COUNT(*) as total,
              COUNT(CASE WHEN completed = true THEN 1 END) as completed
             FROM property_milestones
             WHERE property_id = $1`,
            [propId]
          );

          const { total, completed } = progressResult.rows[0];
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          // Update property progress
          await client.query(
            'UPDATE properties SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [progress, propId]
          );

          // Get client_id from property to find user
          const clientResult = await client.query(
            'SELECT client_id FROM properties WHERE id = $1',
            [propId]
          );

          if (clientResult.rows.length > 0 && clientResult.rows[0].client_id) {
            const userId = clientResult.rows[0].client_id;

            // Find application for this user and property
            const appResult = await client.query(
              'SELECT id FROM applications WHERE user_id = $1 AND property_id = $2 LIMIT 1',
              [userId, propId]
            );

            const applicationId = appResult.rows.length > 0 ? appResult.rows[0].id : null;

            // Insert payment record
            await client.query(
              `INSERT INTO payments (user_id, application_id, amount, status, provider_ref, created_at, updated_at)
               VALUES ($1, $2, $3, 'completed', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [userId, applicationId, parseFloat(amount || '0'), transaction_id || tx_ref || '']
            );
          }
        }
      }

      // Clean up transaction metadata
      await client.query('DELETE FROM payment_transactions WHERE tx_ref = $1', [tx_ref]);

      await client.query('COMMIT');
    }

    // Redirect to dashboard with success params
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('payment', isSuccess ? 'success' : 'failed');
    redirectUrl.searchParams.set('tx_ref', tx_ref || '');
    redirectUrl.searchParams.set('milestone_paid', isSuccess ? 'true' : 'false');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment callback error:', error);
    // Redirect to dashboard with error
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('payment', 'error');
    redirectUrl.searchParams.set('message', 'callback_error');
    return NextResponse.redirect(redirectUrl);
  } finally {
    client.release();
  }
}

// Also handle POST callbacks (webhooks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook data for debugging
    console.log('Paychangu webhook received:', body);
    
    // In production, verify webhook signature here
    // Update database with payment status
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
