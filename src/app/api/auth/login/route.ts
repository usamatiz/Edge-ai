import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    const result = await authService.login({ email, password });

    // Check if email is verified
    if (!result.user.isEmailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        data: {
          requiresVerification: true,
          email: result.user.email
        }
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone,
          isEmailVerified: result.user.isEmailVerified
        },
        accessToken: result.accessToken
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 401 }
    );
  }
}
