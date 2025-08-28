import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Access token is required'
      }, { status: 400 });
    }

    const isValid = await authService.validateAccessToken(accessToken);

    return NextResponse.json({
      success: isValid,
      message: isValid ? 'Token is valid' : 'Token is invalid or expired'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Validate token API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
