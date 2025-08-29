import User, { IUser } from '../models/User.model';
import crypto from 'crypto';
import EmailService from './Email.service';
import JWTService from '../../lib/jwt';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
}

interface GoogleUserData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}

// We'll use the database to track used reset tokens



class AuthService {
  private emailService: EmailService;
  private jwtService: JWTService;

  constructor() {
    this.emailService = new EmailService();
    this.jwtService = new JWTService();
  }

  // ==================== CREATE OPERATIONS ====================

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<{ user: IUser; accessToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });

      // Verify that methods are available
      if (typeof user.generateEmailVerificationToken !== 'function') {
        throw new Error('User model methods not properly initialized');
      }

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();

      // Save user
      await user.save();

      // Generate JWT access token
      const accessToken = this.jwtService.generateToken(user._id?.toString() || '', user.email);

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

      return { user, accessToken };
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  }



  /**
   * Google OAuth login/register
   */
  async googleLogin(googleData: GoogleUserData): Promise<{ user: IUser; accessToken: string; isNewUser: boolean }> {
    try {
      // Check if user exists with this Google ID
      let user = await User.findOne({ googleId: googleData.googleId });

      if (user) {
        // Existing Google user - generate new JWT token
        const accessToken = this.jwtService.generateToken(user._id?.toString() || '', user.email);
        
        return { user, accessToken, isNewUser: false };
      }

      // Check if user exists with this email (but different login method)
      user = await User.findOne({ email: googleData.email });
      
      if (user) {
        // User exists but not with Google - link Google account
        user.googleId = googleData.googleId;
        user.googleEmail = googleData.email;
        user.isEmailVerified = true; // Google emails are pre-verified
        
        const accessToken = this.jwtService.generateToken(user._id?.toString() || '', user.email);
        await user.save();
        
        return { user, accessToken, isNewUser: false };
      }

      // Create new user with Google data
      user = new User({
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        email: googleData.email,
        googleId: googleData.googleId,
        googleEmail: googleData.email,
        isEmailVerified: true, // Google emails are pre-verified
        password: crypto.randomBytes(32).toString('hex') // Random password for Google users
      });

      const accessToken = this.jwtService.generateToken((user._id as any)?.toString() || '', user.email);
      await user.save();

      return { user, accessToken, isNewUser: true };
    } catch (error) {
      throw error;
    }
  }

  // ==================== READ OPERATIONS ====================

  /**
   * Login user
   */
  async login(loginData: LoginData): Promise<{ user: IUser; accessToken: string }> {
    try {
      // Find user by email and include password
      const user = await User.findOne({ email: loginData.email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if password is correct
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate new JWT access token
      const accessToken = this.jwtService.generateToken((user._id as any)?.toString() || '', user.email);

      return { user, accessToken };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user by access token
   */
  async getCurrentUser(accessToken: string): Promise<IUser | null> {
    try {
      // Verify JWT token
      const payload = this.jwtService.verifyToken(accessToken);
      if (!payload) {
        return null;
      }

      // Find user by ID from token payload
      const user = await User.findById(payload.userId);
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by Google ID
   */
  async getUserByGoogleId(googleId: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ googleId });
      return user;
    } catch (error) {
      throw error;
    }
  }



  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phone'>>): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      if (updateData.firstName !== undefined) {
        user.firstName = updateData.firstName;
      }
      if (updateData.lastName !== undefined) {
        user.lastName = updateData.lastName;
      }
      if (updateData.phone !== undefined) {
        user.phone = updateData.phone;
      }

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }




  /**
   * Reset password with JWT reset token
   */
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    try {
      // Verify JWT reset token
      const payload = this.jwtService.verifyToken(resetData.resetToken);
      
      if (!payload) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if it's a reset token
      if (payload.type !== 'reset') {
        throw new Error('Invalid token type');
      }

      // Find user by ID from token
      const user = await User.findById(payload.userId).select('+password +lastUsedResetToken');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if this token has already been used
      if (user.lastUsedResetToken === resetData.resetToken) {
        throw new Error('Reset token has already been used');
      }

      // Update password and mark token as used
      user.password = resetData.newPassword;
      user.lastUsedResetToken = resetData.resetToken;
      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ user: IUser; message: string }> {
    try {
      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with this verification token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.firstName);

      return { 
        user, 
        message: 'Email verified successfully' 
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send resend verification email
      await this.emailService.sendResendVerificationEmail(user.email, verificationToken, user.firstName);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      throw error;
    }
  }



  /**
   * Forgot password - send reset email with JWT reset token
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with that email exists, a password reset link has been sent' };
      }

      // Generate JWT reset token with short expiration (15 minutes)
      const resetToken = this.jwtService.generateResetToken((user._id as any)?.toString() || '', user.email);

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);

      return { 
        message: 'If an account with that email exists, a password reset link has been sent'
      };
    } catch (error) {
      throw error;
    }
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Logout user (JWT is stateless, so we just return success)
   */
  async logout(userId: string): Promise<void> {
    // JWT is stateless, so we don't need to clear anything from database
    // The client should remove the token from localStorage
    return Promise.resolve();
  }



  /**
   * Clear expired tokens (only email verification and password reset tokens)
   */
  async clearExpiredTokens(): Promise<{ message: string }> {
    try {
      const now = new Date();
      
      await User.updateMany(
        {
          $or: [
            { emailVerificationExpires: { $lt: now } },
            { resetPasswordExpires: { $lt: now } }
          ]
        },
        {
          $unset: {
            emailVerificationToken: 1,
            emailVerificationExpires: 1,
            resetPasswordToken: 1,
            resetPasswordExpires: 1
          }
        }
      );

      return { message: 'Expired tokens cleared successfully' };
    } catch (error) {
      throw error;
    }
  }

  // ==================== UTILITY OPERATIONS ====================

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email });
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if Google ID exists
   */
  async googleIdExists(googleId: string): Promise<boolean> {
    try {
      const user = await User.findOne({ googleId });
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verifyToken(accessToken);
      return !!payload;
    } catch {
      return false;
    }
  }

  /**
   * Decode token (for checking token type)
   */
  decodeToken(token: string) {
    return this.jwtService.decodeToken(token);
  }
}

export default AuthService;
