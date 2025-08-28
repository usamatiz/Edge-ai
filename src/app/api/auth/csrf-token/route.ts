import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf-middleware';

export async function GET(request: NextRequest) {
  try {
    const { token, expires } = await generateCSRFToken();
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        expires
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
