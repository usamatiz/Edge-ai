import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 });
    }

    const exists = await authService.emailExists(email);

    return NextResponse.json({
      success: true,
      data: {
        exists
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Check email API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
