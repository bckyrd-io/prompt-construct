import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// This route initializes the database tables
// It can be called on app startup

let initialized = false;

export async function GET() {
  try {
    if (initialized) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already initialized' 
      });
    }

    await initDatabase();
    initialized = true;

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
