import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopment: boolean;
  private brandName: string = 'EdgeAi';
  private brandColor: string = '#5046E5';
  private brandSecondaryColor: string = '#282828';
  private brandAccentColor: string = '#667085';

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Get email configuration from environment variables
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (emailUser && emailPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: false, // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        // console.log('✅ Email service configured successfully with SMTP');
      } catch (error) {
        console.error('Email service configuration failed:', error);
        this.transporter = null;
      }
    } else {
      console.log('Email service not configured - running in development mode');
    }
  }

  /**
   * Generate email template wrapper with consistent styling
   */
  private generateEmailTemplate(content: string, showFooter: boolean = true): string {
    const footer = showFooter ? `
      <div style="background-color: #f8fafc; padding: 24px; margin-top: 32px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          This is an automated email from ${this.brandName}. Please do not reply.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          © ${new Date().getFullYear()} ${this.brandName}. All rights reserved.
        </p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.brandName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #1f2937; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              ${this.brandName}
            </h1>
            <p style="color: #d1d5db; margin: 8px 0 0 0; font-size: 14px; font-weight: 400; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              AI-Powered Video Creation Platform
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            ${content}
          </div>
          
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate styled button
   */
  private generateButton(text: string, url: string, variant: 'primary' | 'secondary' = 'primary'): string {
    const backgroundColor = variant === 'primary' ? this.brandColor : '#ffffff';
    const textColor = variant === 'primary' ? '#ffffff' : this.brandColor;
    const borderColor = variant === 'primary' ? this.brandColor : this.brandColor;
    
    return `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" 
           style="background-color: ${backgroundColor}; 
                  color: ${textColor}; 
                  padding: 14px 32px; 
                  text-decoration: none; 
                  border-radius: 50px; 
                  display: inline-block; 
                  font-weight: 600; 
                  font-size: 16px; 
                  border: 2px solid ${borderColor};
                  transition: all 0.3s ease;
                  box-shadow: 0 2px 4px rgba(80, 70, 229, 0.2);">
          ${text}
        </a>
      </div>
    `;
  }

  /**
   * Send email
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // If no transporter is configured, log the email in development
      if (!this.transporter) {
        if (this.isDevelopment) {
          console.log('[DEV MODE] Email would be sent:');
          console.log('To:', options.to);
          console.log('Subject:', options.subject);
          console.log('Content:', options.html);
          return; // Don't throw error in development
        } else {
          throw new Error('Email service not configured');
        }
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER || `noreply@${this.brandName.toLowerCase()}.com`,
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', options.to);
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // In development, don't throw error, just log it
      if (this.isDevelopment) {
        console.log('[DEV MODE] Email failed but continuing...');
        return;
      }
      
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string, firstName?: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const userName = firstName || 'there';
    
    const content = `
      <div style="margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Verify Your Email Address
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Welcome to ${this.brandName}! Let's get you started with AI-powered video creation.
        </p>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Dear ${userName},
        </p>
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Thank you for joining ${this.brandName}! To complete your registration and start creating amazing AI-powered videos, please verify your email address by clicking the button below.
        </p>
        <p style="color: #374151; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          This verification link will expire in <strong>24 hours</strong> for your security.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            What You'll Get After Verification
          </h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px;">
            <li style="margin-bottom: 8px;">Access to our advanced AI video creation tools</li>
            <li style="margin-bottom: 8px;">Professional video templates and customization options</li>
            <li style="margin-bottom: 8px;">High-quality video exports and sharing capabilities</li>
            <li style="margin-bottom: 8px;">24/7 customer support and guidance</li>
          </ul>
        </div>
        
        ${this.generateButton('Verify Email Address', verificationUrl, 'primary')}
        
        <div style="background-color: #fff3cd; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-top: 24px;">
          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all; text-decoration: none;">${verificationUrl}</a>
          </p>
        </div>
      </div>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px;">
        <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <strong>Security Notice:</strong> If you didn't create an account with ${this.brandName}, you can safely ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Verify Your Email - Welcome to ${this.brandName}!`,
      html: this.generateEmailTemplate(content)
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, accessToken: string, firstName?: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${accessToken}`;
    const userName = firstName || 'there';
    
    const content = `
      <div style="margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Reset Your Password
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Secure your ${this.brandName} account with a new password.
        </p>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Dear ${userName},
        </p>
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          We received a request to reset your password for your ${this.brandName} account. Click the button below to create a new secure password.
        </p>
        <p style="color: #374151; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          This reset link will expire in <strong>1 hour</strong> for your security.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            Password Security Tips
          </h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px;">
            <li style="margin-bottom: 8px;">Use a strong, unique password with at least 8 characters</li>
            <li style="margin-bottom: 8px;">Include a mix of uppercase, lowercase, numbers, and symbols</li>
            <li style="margin-bottom: 8px;">Avoid using personal information or common words</li>
            <li style="margin-bottom: 8px;">Consider using a password manager for better security</li>
          </ul>
        </div>
        
        ${this.generateButton('Reset Password', resetUrl, 'primary')}
        
        <div style="background-color: #fff3cd; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-top: 24px;">
          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all; text-decoration: none;">${resetUrl}</a>
          </p>
        </div>
      </div>
      
      <div style="background-color: #dbeafe; border: 1px solid #93c5fd; border-radius: 6px; padding: 16px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and consider changing your password if you're concerned about your account security.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Reset Your Password - ${this.brandName}`,
      html: this.generateEmailTemplate(content)
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account`;
    
    const content = `
      <div style="margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Welcome to ${this.brandName}!
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Your account is now verified and ready to create amazing content.
        </p>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Dear ${firstName},
        </p>
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Congratulations! Your ${this.brandName} account has been successfully verified. You're now ready to unlock the full potential of AI-powered video creation.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            What You Can Do Now
          </h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px;">
            <li style="margin-bottom: 8px;">Create stunning AI-generated videos with our advanced tools</li>
            <li style="margin-bottom: 8px;">Customize your profile and preferences</li>
            <li style="margin-bottom: 8px;">Explore our professional video templates</li>
            <li style="margin-bottom: 8px;">Track your video creation analytics</li>
            <li style="margin-bottom: 8px;">Share your creations with the world</li>
          </ul>
        </div>
        
        ${this.generateButton('Go to Dashboard', dashboardUrl, 'primary')}
        
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; margin-top: 24px;">
          <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <strong>Need Help?</strong> Our support team is here to help you make the most of ${this.brandName}. Don't hesitate to reach out if you have any questions!
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Thank you for choosing ${this.brandName} for your video creation journey!
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Welcome to ${this.brandName} - Let's Create Something Amazing!`,
      html: this.generateEmailTemplate(content)
    });
  }

  /**
   * Send resend verification email
   */
  async sendResendVerificationEmail(email: string, verificationToken: string, firstName?: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const userName = firstName || 'there';
    
    const content = `
      <div style="margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          New Verification Email
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Here's your fresh verification link for ${this.brandName}.
        </p>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Dear ${userName},
        </p>
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          We've sent you a new email verification link. Click the button below to verify your email address and complete your ${this.brandName} account setup.
        </p>
        <p style="color: #374151; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          This new verification link will expire in <strong>24 hours</strong>.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            Why Verify Your Email?
          </h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px;">
            <li style="margin-bottom: 8px;">Secure your account and protect your data</li>
            <li style="margin-bottom: 8px;">Receive important updates and notifications</li>
            <li style="margin-bottom: 8px;">Access all premium features and tools</li>
            <li style="margin-bottom: 8px;">Enable password recovery options</li>
          </ul>
        </div>
        
        ${this.generateButton('Verify Email Now', verificationUrl, 'primary')}
        
        <div style="background-color: #fff3cd; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-top: 24px;">
          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all; text-decoration: none;">${verificationUrl}</a>
          </p>
        </div>
      </div>
      
      <div style="background-color: #dbeafe; border: 1px solid #93c5fd; border-radius: 6px; padding: 16px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <strong>Need Assistance?</strong> If you continue to have issues, please contact our support team for assistance.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `New Verification Email - ${this.brandName}`,
      html: this.generateEmailTemplate(content)
    });
  }

  /**
   * Send contact form email to admin
   */
  async sendContactFormEmail(data: {
    fullName: string;
    position: string;
    email: string;
    phone: string;
    question: string;
  }): Promise<void> {
    const adminEmail = process.env.EMAIL_USER || 'hrehman@techtiz.co';
    const currentDate = new Date().toLocaleString();
    
    const content = `
      <div style="margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          New Contact Form Submission
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          A new inquiry has been submitted through the contact form.
        </p>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 20px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Contact Details
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Full Name:</td>
            <td style="padding: 12px 0; color: #1f2937; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Position:</td>
            <td style="padding: 12px 0; color: #1f2937; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">${data.position}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Email Address:</td>
            <td style="padding: 12px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">
              <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Phone Number:</td>
            <td style="padding: 12px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">
              <a href="tel:${data.phone}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${data.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #374151; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">Submission Date:</td>
            <td style="padding: 12px 0; color: #6b7280; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px;">${currentDate}</td>
          </tr>
        </table>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            Inquiry Details
          </h3>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px;">
            <p style="color: #374151; margin: 0; font-size: 15px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; white-space: pre-wrap;">
              ${data.question}
            </p>
          </div>
        </div>
      </div>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px;">
        <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <strong>Action Required:</strong> Please respond to this inquiry within 24 hours as per our Real Support Guarantee.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission - ${data.fullName}`,
      html: this.generateEmailTemplate(content, false)
    });
  }

  /**
   * Send thank you email to contact form submitter
   */
  async sendContactThankYouEmail(data: {
    fullName: string;
    email: string;
  }): Promise<void> {
    const content = `
      <div style="margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin: 0 0 12px 0; font-size: 28px; font-weight: 700; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Thank You for Contacting Us
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          We've received your inquiry and appreciate you reaching out to us.
        </p>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
        <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Dear ${data.fullName},
        </p>
        <p style="color: #374151; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Thank you for submitting your inquiry through our contact form. We have successfully received your message and our team is reviewing the details you provided.
        </p>
        <p style="color: #374151; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          We are committed to providing you with the best possible support and will respond to your inquiry within 24 hours.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            What to Expect Next
          </h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px;">
            <li style="margin-bottom: 8px;">Our team will review your inquiry within 24 hours</li>
            <li style="margin-bottom: 8px;">You'll receive a personalized response from a real team member</li>
            <li style="margin-bottom: 8px;">We'll provide specific solutions tailored to your needs</li>
            <li style="margin-bottom: 8px;">Get ready to unlock the power of AI-powered video creation</li>
          </ul>
        </div>
        
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px;">
          <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <strong>Our Commitment:</strong> A real team member will respond within 24 hours. No automated responses - just genuine human support.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          Thank you for choosing ${this.brandName} for your video creation needs.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: data.email,
      subject: `Thank You for Contacting ${this.brandName} - We'll Get Back to You Soon!`,
      html: this.generateEmailTemplate(content)
    });
  }
}

export default EmailService;
