import { NextRequest, NextResponse } from 'next/server';

// This route handles successful payment callbacks from Paychangu
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tx_ref = searchParams.get('tx_ref');
    const transaction_id = searchParams.get('transaction_id');
    const status = searchParams.get('status');

    // In a real implementation, you would:
    // 1. Verify the transaction status with Paychangu API
    // 2. Update the milestone payment status in your database
    // 3. Send confirmation emails
    
    // For now, we redirect to dashboard with success params
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('payment', 'success');
    redirectUrl.searchParams.set('tx_ref', tx_ref || '');
    redirectUrl.searchParams.set('milestone_paid', 'true');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Payment callback error:', error);
    // Redirect to dashboard with error
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('payment', 'error');
    return NextResponse.redirect(redirectUrl);
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
