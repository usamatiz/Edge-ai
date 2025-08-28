import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 /api/auth/me: Starting request...')
    
    // Initialize database connection
    await initializeDatabase();
    console.log('🔐 /api/auth/me: Database initialized')
    
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔐 /api/auth/me: Access token present:', !!accessToken)

    if (!accessToken) {
      console.log('🔐 /api/auth/me: No access token provided')
      return NextResponse.json({
        success: false,
        message: 'Access token is required'
      }, { status: 401 });
    }
    
    console.log('🔐 /api/auth/me: Getting current user...')
    const user = await authService.getCurrentUser(accessToken);
    console.log('🔐 /api/auth/me: User found:', !!user)

    if (!user) {
      console.log('🔐 /api/auth/me: Invalid or expired access token')
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired access token'
      }, { status: 401 });
    }

    console.log('🔐 /api/auth/me: Returning user data successfully')
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          googleId: user.googleId
        }
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('🔐 /api/auth/me: Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
