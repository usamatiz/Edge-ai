import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
    const { resetToken, newPassword } = body;

    if (!resetToken || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Reset token and new password are required'
      }, { status: 400 });
    }

    const result = await authService.resetPassword({
      resetToken,
      newPassword
    });

    return NextResponse.json({
      success: true,
      message: result.message
    }, { status: 200 });
  } catch (error: any) {
    console.error('Reset password API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
