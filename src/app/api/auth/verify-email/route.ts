import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Verification token is required'
      }, { status: 400 });
    }

    const result = await authService.verifyEmail(token);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone,
          isEmailVerified: result.user.isEmailVerified
        }
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Verify email API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
