import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Video interface for user's video collection
export interface IVideo {
  videoId: string;
  title: string;
  secretKey: string;
  s3Key: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
  };
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  googleEmail?: string;
  accessToken?: string;
  accessTokenExpires?: Date;
  videos: IVideo[]; // Array of user's videos
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  generateAccessToken(): string;
  addVideo(videoData: Omit<IVideo, 'createdAt' | 'updatedAt'>): void;
  getVideo(videoId: string): IVideo | undefined;
  removeVideo(videoId: string): boolean;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: false, // Make phone optional for all users
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },
  googleEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  // Access token management
  accessToken: {
    type: String,
    select: false
  },
  accessTokenExpires: {
    type: Date,
    select: false
  },
  // Video collection
  videos: {
    type: [{
      videoId: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      secretKey: {
        type: String,
        required: true,
        select: false // Don't include secret keys in queries by default
      },
      s3Key: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        default: 'processing'
      },
      metadata: {
        duration: Number,
        size: Number,
        format: String
      }
    }],
    default: [], // Initialize as empty array
    timestamps: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function(): string {
  const accessToken = crypto.randomBytes(64).toString('hex');
  
  this.accessToken = crypto
    .createHash('sha256')
    .update(accessToken)
    .digest('hex');
  
  this.accessTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return accessToken;
};

// Instance method to add a video to user's collection
userSchema.methods.addVideo = function(videoData: Omit<IVideo, 'createdAt' | 'updatedAt'>): void {
  this.videos.push(videoData);
};

// Instance method to get a specific video
userSchema.methods.getVideo = function(videoId: string): IVideo | undefined {
  return this.videos.find((video: IVideo) => video.videoId === videoId);
};

// Instance method to remove a video
userSchema.methods.removeVideo = function(videoId: string): boolean {
  const initialLength = this.videos.length;
  this.videos = this.videos.filter((video: IVideo) => video.videoId !== videoId);
  return this.videos.length < initialLength;
};

// Index for better query performance
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ accessToken: 1 });

// Drop problematic index if it exists (run once)
const dropProblematicIndex = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.log('Database not connected, skipping index cleanup');
      return;
    }
    
    const collections = await db.listCollections().toArray();
    const usersCollection = collections.find(col => col.name === 'users');
    
    if (usersCollection && db) {
      const indexes = await db.collection('users').indexes();
      const problematicIndex = indexes.find(index => 
        index.name === 'videos.videoId_1' || 
        (index.key && index.key['videos.videoId'])
      );
      
      if (problematicIndex && db) {
        console.log('Dropping problematic index: videos.videoId_1');
        await db.collection('users').dropIndex('videos.videoId_1');
        console.log('Problematic index dropped successfully');
      }
    }
  } catch (error) {
    console.log('Index management:', (error as Error).message);
  }
};

// Run index cleanup when database is connected
mongoose.connection.once('connected', () => {
  console.log('Database connected, running index cleanup...');
  dropProblematicIndex();
});

// Ensure the model is properly compiled and methods are attached
let User: mongoose.Model<IUser>;

try {
  // Check if the model already exists to prevent recompilation
  User = mongoose.models.User as mongoose.Model<IUser>;
  
  if (!User) {
    User = mongoose.model<IUser>('User', userSchema);
  }
  
  // Verify that methods are attached
  const testUser = new User();
  if (typeof testUser.generateEmailVerificationToken !== 'function') {
    throw new Error('User model methods not properly attached');
  }
  
} catch (error) {
  console.error('Error initializing User model:', error);
  // Force recompilation if there's an issue
  if (mongoose.models.User) {
    delete mongoose.models.User;
  }
  User = mongoose.model<IUser>('User', userSchema);
}

export default User;
