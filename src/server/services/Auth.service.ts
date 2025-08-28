import User, { IUser } from '../models/User.model';
import crypto from 'crypto';
import EmailService from './Email.service';

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
  accessToken: string;
  newPassword: string;
}

interface GoogleUserData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}



class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
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

      // Generate access token
      const accessToken = user.generateAccessToken();
      await user.save();

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
        // Existing Google user - generate new token
        const accessToken = user.generateAccessToken();
        await user.save();
        
        return { user, accessToken, isNewUser: false };
      }

      // Check if user exists with this email (but different login method)
      user = await User.findOne({ email: googleData.email });
      
      if (user) {
        // User exists but not with Google - link Google account
        user.googleId = googleData.googleId;
        user.googleEmail = googleData.email;
        user.isEmailVerified = true; // Google emails are pre-verified
        
        const accessToken = user.generateAccessToken();
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

      const accessToken = user.generateAccessToken();
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

      // Generate new access token
      const accessToken = user.generateAccessToken();
      await user.save();

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
      // console.log('🔐 AuthService.getCurrentUser: Starting token validation...')
      
      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(accessToken)
        .digest('hex');

      // console.log('🔐 AuthService.getCurrentUser: Token hashed, searching for user...')

      // Find user with this access token and check if it's not expired
      const user = await User.findOne({
        accessToken: hashedToken,
        accessTokenExpires: { $gt: Date.now() }
      });

      // console.log('🔐 AuthService.getCurrentUser: User found:', !!user)
      
      if (user) {
        // console.log('🔐 AuthService.getCurrentUser: User ID:', user._id)
        // console.log('🔐 AuthService.getCurrentUser: Token expires at:', user.accessTokenExpires)
        // console.log('🔐 AuthService.getCurrentUser: Current time:', new Date())
      }

      return user;
    } catch (error) {
      // console.error('🔐 AuthService.getCurrentUser: Error:', error)
      throw error;
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
   * Reset password with access token
   */
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    try {
      // Hash the access token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetData.accessToken)
        .digest('hex');

      // Find user with this access token and check if it's not expired
      const user = await User.findOne({
        accessToken: hashedToken,
        accessTokenExpires: { $gt: Date.now() }
      }).select('+password');

      if (!user) {
        throw new Error('Invalid or expired access token');
      }

      // Update password
      user.password = resetData.newPassword;

      // Generate new access token after password change
      user.generateAccessToken();
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
   * Forgot password - send reset email with access token
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with that email exists, a password reset link has been sent' };
      }

      // Generate access token for password reset
      const accessToken = user.generateAccessToken();
      await user.save();

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user.email, accessToken, user.firstName);

      return { 
        message: 'If an account with that email exists, a password reset link has been sent'
      };
    } catch (error) {
      throw error;
    }
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Clear access token
      user.accessToken = undefined;
      user.accessTokenExpires = undefined;
      await user.save();
    } catch (error) {
      throw error;
    }
  }



  /**
   * Clear expired tokens
   */
  async clearExpiredTokens(): Promise<{ message: string }> {
    try {
      const now = new Date();
      
      await User.updateMany(
        {
          $or: [
            { emailVerificationExpires: { $lt: now } },
            { resetPasswordExpires: { $lt: now } },
            { accessTokenExpires: { $lt: now } }
          ]
        },
        {
          $unset: {
            emailVerificationToken: 1,
            emailVerificationExpires: 1,
            resetPasswordToken: 1,
            resetPasswordExpires: 1,
            accessToken: 1,
            accessTokenExpires: 1
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
      const hashedToken = crypto
        .createHash('sha256')
        .update(accessToken)
        .digest('hex');

      const user = await User.findOne({
        accessToken: hashedToken,
        accessTokenExpires: { $gt: Date.now() }
      });

      return !!user;
    } catch {
      return false;
    }
  }
}

export default AuthService;
