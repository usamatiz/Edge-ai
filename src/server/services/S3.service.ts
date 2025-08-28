import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export interface S3Config {
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
  endpoint?: string;
}

export interface VideoUploadResult {
  s3Key: string;
  secretKey: string;
  uploadUrl: string;
}

export interface VideoDownloadResult {
  downloadUrl: string;
  expiresIn: number;
}

export class S3Service {
  private client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(config: S3Config) {
    const clientConfig: any = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };

    // Add endpoint and forcePathStyle if specified
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
    }
    if (config.forcePathStyle) {
      clientConfig.forcePathStyle = config.forcePathStyle;
    }

    this.client = new S3Client(clientConfig);
    this.bucketName = config.bucketName;
    this.region = config.region;
  }

  /**
   * Generate a unique S3 key for video storage
   */
  public generateS3Key(userId: string, videoId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Include the videos prefix if it was part of the original bucket config
    return `videos/${userId}/${videoId}/${timestamp}_${sanitizedFilename}`;
  }

  /**
   * Generate a secret key for video access control
   */
  private generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Upload video directly to S3
   */
  async uploadVideoDirectly(
    s3Key: string,
    videoBuffer: Buffer,
    contentType: string,
    metadata: Record<string, string>
  ): Promise<boolean> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: videoBuffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Error uploading video to S3:', error);
      throw error;
    }
  }

  /**
   * Create a presigned URL for video upload
   */
  async createUploadUrl(
    userId: string, 
    videoId: string, 
    filename: string,
    contentType: string = 'video/mp4'
  ): Promise<VideoUploadResult> {
    const s3Key = this.generateS3Key(userId, videoId, filename);
    const secretKey = this.generateSecretKey();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: contentType,
      Metadata: {
        userId,
        videoId,
        secretKey,
        uploadedAt: new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 3600, // 1 hour
    });

    return {
      s3Key,
      secretKey,
      uploadUrl,
    };
  }

  /**
   * Create a presigned URL for video download
   */
  async createDownloadUrl(
    s3Key: string,
    secretKey: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<VideoDownloadResult> {
    // Verify the video exists and check metadata
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const headResult = await this.client.send(headCommand);
      
      // Verify secret key matches
      if (headResult.Metadata?.secretKey !== secretKey) {
        throw new Error('Invalid secret key for video access');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const downloadUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      return {
        downloadUrl,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        throw new Error('Video not found');
      }
      throw error;
    }
  }

  /**
   * Delete a video from S3
   */
  async deleteVideo(s3Key: string, secretKey: string): Promise<boolean> {
    try {
      // Verify the video exists and check metadata
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const headResult = await this.client.send(headCommand);
      
      // Verify secret key matches
      if (headResult.Metadata?.secretKey !== secretKey) {
        throw new Error('Invalid secret key for video deletion');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting video from S3:', error);
      return false;
    }
  }

  /**
   * Check if a video exists and get its metadata
   */
  async getVideoMetadata(s3Key: string, secretKey: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const result = await this.client.send(command);
      
      // Verify secret key matches
      if (result.Metadata?.secretKey !== secretKey) {
        throw new Error('Invalid secret key for video access');
      }

      return {
        exists: true,
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        metadata: result.Metadata,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        return { exists: false };
      }
      throw error;
    }
  }

  /**
   * Get the S3 bucket URL for a video (for direct access if needed)
   */
  getVideoUrl(s3Key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
  }
}

// Create and export a singleton instance
let s3Service: S3Service | null = null;

export function getS3Service(): S3Service {
  if (!s3Service) {
    // Parse bucket name and path
    const bucketEnv = process.env.AWS_S3_BUCKET || '';
    const [bucketName, ...pathParts] = bucketEnv.split('/');
    
    // Log configuration for debugging
    console.log('S3 Configuration Debug:', {
      originalBucketEnv: bucketEnv,
      parsedBucketName: bucketName,
      pathParts: pathParts,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    const config: S3Config = {
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: bucketName,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    };

    // Add additional configurations if needed
    if (process.env.AWS_S3_ENDPOINT) {
      config.endpoint = process.env.AWS_S3_ENDPOINT;
    }
    
    if (process.env.AWS_S3_FORCE_PATH_STYLE === 'true') {
      config.forcePathStyle = true;
    }

    if (!config.bucketName || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error('AWS S3 configuration is incomplete. Please check environment variables.');
    }

    s3Service = new S3Service(config);
  }

  return s3Service;
}