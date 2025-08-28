import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';

const authService = new AuthService();

export async function PUT(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
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

    const { firstName, lastName, phone } = body;

    const updatedUser = await authService.updateProfile(user._id?.toString() || '', {
      firstName,
      lastName,
      phone
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          isEmailVerified: updatedUser.isEmailVerified
        }
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Update profile API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
