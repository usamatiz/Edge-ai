import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Access token is required'
      }, { status: 401 });
    }

    const user = await authService.getCurrentUser(accessToken);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired access token'
      }, { status: 401 });
    }

    await authService.logout(user._id?.toString() || '');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
