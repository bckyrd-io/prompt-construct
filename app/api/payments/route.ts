import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/payments - List all payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.user_id,
        p.application_id,
        p.amount,
        p.status,
        p.provider_ref,
        p.created_at,
        p.updated_at,
        u.name as user_name,
        u.email as user_email
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ payments: result.rows });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
