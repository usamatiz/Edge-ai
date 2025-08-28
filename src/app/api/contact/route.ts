import { NextRequest, NextResponse } from 'next/server';
import EmailService from '@/server/services/Email.service';

const emailService = new EmailService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, position, email, phone, question } = body;

    // Validate required fields
    if (!fullName || !position || !email || !phone || !question) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send email to admin
    await emailService.sendContactFormEmail({
      fullName,
      position,
      email,
      phone,
      question
    });

    // Send thank you email to user
    await emailService.sendContactThankYouEmail({
      fullName,
      email
    });

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
