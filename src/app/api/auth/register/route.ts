import { NextRequest, NextResponse } from 'next/server';
import AuthService from '../../../../server/services/Auth.service';
import { initializeDatabase } from '../../../lib/database';
// Import User model to ensure it's registered
import '../../../../server/models/User.model';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting registration process...');
    
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connected successfully');
    
    const body = await request.json();
    console.log('📝 Registration data received:', { 
      firstName: body.firstName, 
      lastName: body.lastName, 
      email: body.email, 
      phone: body.phone,
      hasPassword: !!body.password 
    });
    
    const { firstName, lastName, email, phone, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    console.log('✅ Validation passed, calling auth service...');

    const result = await authService.register({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    console.log('✅ Registration successful:', { 
      userId: result.user._id, 
      email: result.user.email,
      isEmailVerified: result.user.isEmailVerified 
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
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
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Register API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}
