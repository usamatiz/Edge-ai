import Video, { IVideo } from '../models/Video.model';
import { getS3Service } from './S3.service';
import crypto from 'crypto';

interface CreateVideoData {
  email: string;
  title: string;
  s3Key: string;
  secretKey?: string;
  status?: 'processing' | 'ready' | 'failed';
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
  };
}

interface UpdateVideoData {
  title?: string;
  status?: 'processing' | 'ready' | 'failed';
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
  };
}

class VideoService {
  private s3Service = getS3Service();

  /**
   * Create a new video record
   */
  async createVideo(videoData: CreateVideoData): Promise<IVideo> {
    try {
      const videoId = `video_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      const secretKey = videoData.secretKey || crypto.randomBytes(32).toString('hex');

      const video = new Video({
        videoId,
        email: videoData.email,
        title: videoData.title,
        secretKey,
        s3Key: videoData.s3Key,
        status: videoData.status || 'processing',
        metadata: videoData.metadata
      });

      await video.save();
      return video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  /**
   * Get all videos for a user
   */
  async getUserVideos(email: string): Promise<IVideo[]> {
    try {
      const videos = await Video.find({ email })
        .select('+secretKey') // Include secret key for S3 operations
        .sort({ createdAt: -1 }); // Newest first
      
      return videos;
    } catch (error) {
      console.error('Error getting user videos:', error);
      throw error;
    }
  }

  /**
   * Get a specific video by videoId
   */
  async getVideo(videoId: string): Promise<IVideo | null> {
    try {
      const video = await Video.findOne({ videoId })
        .select('+secretKey'); // Include secret key for S3 operations
      
      return video;
    } catch (error) {
      console.error('Error getting video:', error);
      throw error;
    }
  }

  /**
   * Get a video by S3 key
   */
  async getVideoByS3Key(s3Key: string): Promise<IVideo | null> {
    try {
      const video = await Video.findOne({ s3Key })
        .select('+secretKey'); // Include secret key for S3 operations
      
      return video;
    } catch (error) {
      console.error('Error getting video by S3 key:', error);
      throw error;
    }
  }

  /**
   * Update video status
   */
  async updateVideoStatus(videoId: string, status: 'processing' | 'ready' | 'failed'): Promise<IVideo | null> {
    try {
      const video = await Video.findOneAndUpdate(
        { videoId },
        { status },
        { new: true }
      ).select('+secretKey');
      
      return video;
    } catch (error) {
      console.error('Error updating video status:', error);
      throw error;
    }
  }

  /**
   * Update video metadata
   */
  async updateVideoMetadata(videoId: string, metadata: Partial<IVideo['metadata']>): Promise<IVideo | null> {
    try {
      const video = await Video.findOneAndUpdate(
        { videoId },
        { metadata },
        { new: true }
      ).select('+secretKey');
      
      return video;
    } catch (error) {
      console.error('Error updating video metadata:', error);
      throw error;
    }
  }

  /**
   * Update video title
   */
  async updateVideoTitle(videoId: string, title: string): Promise<IVideo | null> {
    try {
      const video = await Video.findOneAndUpdate(
        { videoId },
        { title },
        { new: true }
      ).select('+secretKey');
      
      return video;
    } catch (error) {
      console.error('Error updating video title:', error);
      throw error;
    }
  }

  /**
   * Delete a video (from database and S3)
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const video = await Video.findOne({ videoId }).select('+secretKey');
      
      if (!video) {
        return false;
      }

      // Delete from S3
      try {
        await this.s3Service.deleteVideo(video.s3Key, video.secretKey);
      } catch (s3Error) {
        console.error('Error deleting video from S3:', s3Error);
        // Continue with database deletion even if S3 fails
      }

      // Delete from database
      await Video.deleteOne({ videoId });
      
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  /**
   * Get video with download URL
   */
  async getVideoWithDownloadUrl(videoId: string): Promise<IVideo | null> {
    try {
      const video = await Video.findOne({ videoId }).select('+secretKey');
      
      if (!video || video.status !== 'ready') {
        return video;
      }

      // Generate download URL for ready videos
      try {
        const downloadResult = await this.s3Service.createDownloadUrl(
          video.s3Key,
          video.secretKey,
          3600 // 1 hour
        );
        
        // Add download URL to video object (not saved to database)
        (video as any).downloadUrl = downloadResult.downloadUrl;
      } catch (s3Error) {
        console.error('Error creating download URL:', s3Error);
        // Continue without download URL
      }

      return video;
    } catch (error) {
      console.error('Error getting video with download URL:', error);
      throw error;
    }
  }

  /**
   * Get user videos with download URLs
   */
  async getUserVideosWithDownloadUrls(userId: string): Promise<IVideo[]> {
    try {
      const videos = await Video.find({ userId })
        .select('+secretKey')
        .sort({ createdAt: -1 });

      // Add download URLs for ready videos
      const videosWithUrls = await Promise.all(
        videos.map(async (video) => {
          if (video.status === 'ready') {
            try {
              const downloadResult = await this.s3Service.createDownloadUrl(
                video.s3Key,
                video.secretKey,
                3600 // 1 hour
              );
              (video as any).downloadUrl = downloadResult.downloadUrl;
            } catch (s3Error) {
              console.error(`Error creating download URL for video ${video.videoId}:`, s3Error);
              // Continue without download URL
            }
          }
          return video;
        })
      );

      return videosWithUrls;
    } catch (error) {
      console.error('Error getting user videos with download URLs:', error);
      throw error;
    }
  }

  /**
   * Get video by title for a specific user
   */
  async getVideoByTitle(email: string, title: string): Promise<IVideo | null> {
    try {
      return await Video.findOne({ email, title });
    } catch (error) {
      console.error('Error getting video by title:', error);
      return null;
    }
  }

  /**
   * Get video statistics for a user
   */
  async getUserVideoStats(email: string): Promise<{
    totalCount: number;
    readyCount: number;
    processingCount: number;
    failedCount: number;
  }> {
    try {
      const stats = await Video.aggregate([
        { $match: { email: new Video.base.Types.ObjectId(email) } },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            readyCount: {
              $sum: { $cond: [{ $eq: ['$status', 'ready'] }, 1, 0] }
            },
            processingCount: {
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalCount: 0,
        readyCount: 0,
        processingCount: 0,
        failedCount: 0
      };
    } catch (error) {
      console.error('Error getting user video stats:', error);
      throw error;
    }
  }
}

export default VideoService;
