import { NextRequest, NextResponse } from 'next/server';

// This route handles failed or cancelled payments from Paychangu
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    // Log the failed/cancelled payment attempt
    console.log('Payment failed/cancelled:', { tx_ref, status });

    // Redirect back to payment page with error info
    const redirectUrl = new URL('/payment', request.url);
    redirectUrl.searchParams.set('error', 'payment_failed');
    redirectUrl.searchParams.set('status', status || 'failed');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Payment return error:', error);
    // Redirect to dashboard as fallback
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}
