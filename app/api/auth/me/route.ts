import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// This route is for verifying a user session
// In a production app, you'd use JWT tokens or sessions
// For simplicity, this accepts a user ID and returns user info

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params (simple approach)
    // In production, this would come from a secure session/JWT
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
