import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

// Initialize payment with Paychangu API (server-side)
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body = await request.json();
    const {
      amount,
      currency = 'MWK',
      tx_ref,
      callback_url,
      return_url,
      customer,
      customization,
      meta,
    } = body;

    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    const publicKey = process.env.NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Store transaction metadata in database for later retrieval
    await client.query('BEGIN');
    try {
      // Check if transaction metadata table exists, if not create it
      await client.query(`
        CREATE TABLE IF NOT EXISTS payment_transactions (
          tx_ref VARCHAR(255) PRIMARY KEY,
          milestone_id VARCHAR(50),
          property_id INTEGER,
          amount DECIMAL(15, 2),
          milestone_name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour'
        )
      `);

      // Insert transaction metadata
      await client.query(
        `INSERT INTO payment_transactions (tx_ref, milestone_id, property_id, amount, milestone_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          tx_ref,
          meta?.milestoneId || null,
          meta?.propertyId ? parseInt(meta.propertyId) : null,
          amount || 0,
          meta?.milestoneName || ''
        ]
      );

      await client.query('COMMIT');
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Failed to store transaction metadata:', dbError);
      // Continue with payment initialization even if metadata storage fails
    }

    // Build the payload for Paychangu
    const paychanguRequest = {
      amount,
      currency,
      tx_ref,
      callback_url,
      return_url,
      customer: {
        email: customer?.email || 'client@example.com',
        first_name: customer?.first_name || 'Client',
        last_name: customer?.last_name || 'User',
      },
      customization: {
        title: customization?.title || 'Construction Payment',
        description: customization?.description || 'Payment for construction project',
        ...(customization?.logo && { logo: customization.logo }),
      },
      meta: {
        ...(meta?.milestoneId && { milestone_id: meta.milestoneId }),
        ...(meta?.milestoneName && { milestone_name: meta.milestoneName }),
        ...(meta?.propertyId && { property_id: meta.propertyId }),
      },
    };

    // Call Paychangu API to initialize payment
    const response = await fetch('https://api.paychangu.com/payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paychanguRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Paychangu API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initialize payment', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Return the checkout URL to the client
    return NextResponse.json({
      success: true,
      checkout_url: data.data?.checkout_url || data.checkout_url,
      tx_ref,
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
