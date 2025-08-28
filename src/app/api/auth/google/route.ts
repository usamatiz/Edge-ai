import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '@/app/lib/database';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
    console.log('Google OAuth request body:', body);
    
    const { googleId, email, firstName, lastName } = body;

    // Validate required fields
    if (!googleId || !email || !firstName || !lastName) {
      return NextResponse.json({
        success: false,
        message: 'Google ID, email, first name, and last name are required'
      }, { status: 400 });
    }

    const result = await authService.googleLogin({
      googleId,
      email,
      firstName,
      lastName
    });

    // For existing users (not new Google users), check email verification
    if (!result.isNewUser && !result.user.isEmailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        data: {
          requiresVerification: true,
          email: result.user.email
        }
      }, { status: 403 });
    }

    const responseData = {
      success: true,
      message: result.isNewUser ? 'User registered successfully with Google' : 'Login successful',
      data: {
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone || '', // Handle case where phone might be empty for Google users
          isEmailVerified: result.user.isEmailVerified,
          googleId: result.user.googleId
        },
        accessToken: result.accessToken,
        isNewUser: result.isNewUser
      }
    };

    console.log('Google OAuth response:', responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    
    // Log more detailed error information
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
