import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = 'client' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'client'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or client' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Store plaintext password (system requirement)
    const status = role === 'client' ? 'Active' : 'Active';

    // Insert new user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, status, created_at`,
      [name, email, password, role, status]
    );

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      user
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
