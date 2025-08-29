import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import User from '../../../../server/models/User.model';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate the token
    const isValid = await authService.validateAccessToken(token);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user data from token
    const user = await authService.getCurrentUser(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    // Check if it's a reset token (for password reset pages)
    const payload = authService.decodeToken(token);
    const isResetToken = payload?.type === 'reset';

    // If it's a reset token, check if it has already been used
    if (isResetToken && payload?.userId) {
      const user = await User.findById(payload.userId).select('+lastUsedResetToken');
      if (user && user.lastUsedResetToken === token) {
        return NextResponse.json(
          { success: false, message: 'Reset token has already been used' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified
        },
        tokenType: isResetToken ? 'reset' : 'access'
      }
    });
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
