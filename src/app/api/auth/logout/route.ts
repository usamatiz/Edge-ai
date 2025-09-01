import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Logout should be idempotent and not require DB or a valid token.
    // Always respond success and let the client clear local auth state.
    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
