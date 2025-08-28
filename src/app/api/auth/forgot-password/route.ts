import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';
import { createRateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit-middleware';

const authService = new AuthService();
const rateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.forgotPassword);

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 });
    }

    const result = await authService.forgotPassword(email);

    return NextResponse.json({
      success: true,
      message: result.message
    }, { status: 200 });
  } catch (error: any) {
    console.error('Forgot password API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
