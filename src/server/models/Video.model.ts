import mongoose, { Document, Schema } from 'mongoose';

// Video interface
export interface IVideo extends Document {
  videoId: string;
  userId?: mongoose.Types.ObjectId;
  email: string;
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
  
  // Methods
  updateStatus(status: 'processing' | 'ready' | 'failed'): Promise<void>;
  updateMetadata(metadata: Partial<IVideo['metadata']>): Promise<void>;
}

const videoSchema = new Schema<IVideo>({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
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
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing',
    index: true
  },
  metadata: {
    duration: Number,
    size: Number,
    format: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Instance method to update video status
videoSchema.methods.updateStatus = async function(status: 'processing' | 'ready' | 'failed'): Promise<void> {
  this.status = status;
  await this.save();
};

// Instance method to update video metadata
videoSchema.methods.updateMetadata = async function(metadata: Partial<IVideo['metadata']>): Promise<void> {
  this.metadata = { ...this.metadata, ...metadata };
  await this.save();
};

// Indexes for better query performance
videoSchema.index({ userId: 1, createdAt: -1 }); // For user's video gallery
videoSchema.index({ email: 1, createdAt: -1 }); // For email-based queries
videoSchema.index({ status: 1, createdAt: -1 }); // For status-based queries
videoSchema.index({ s3Key: 1 }); // For S3 key lookups

// Ensure the model is properly compiled
let Video: mongoose.Model<IVideo>;

try {
  // Check if the model already exists to prevent recompilation
  Video = mongoose.models.Video as mongoose.Model<IVideo>;
  
  if (!Video) {
    Video = mongoose.model<IVideo>('Video', videoSchema);
  }
} catch (error) {
  console.error('Error initializing Video model:', error);
  // Force recompilation if there's an issue
  if (mongoose.models.Video) {
    delete mongoose.models.Video;
  }
  Video = mongoose.model<IVideo>('Video', videoSchema);
}

export default Video;
