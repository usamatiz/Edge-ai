import { NextRequest, NextResponse } from 'next/server';
import { getS3Service } from '@/server/services/S3.service';
import User from '@/server/models/User.model';
import dbConnect from '@/app/lib/mongodb';
import AuthService from '@/server/services/Auth.service';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get access token from headers
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Access token is required'
      }, { status: 401 });
    }

    // Get current user from access token
    const user = await authService.getCurrentUser(accessToken);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired access token'
      }, { status: 401 });
    }

    // Get S3 service
    const s3Service = getS3Service();

    // Process each video to get download URLs
    const videosWithUrls = await Promise.all(
      user.videos.map(async (video) => {
        try {
          console.log(`Processing video ${video.videoId}:`, {
            status: video.status,
            s3Key: video.s3Key,
            hasSecretKey: !!video.secretKey
          });

          // Get download URL for ready videos
          let downloadUrl = null;
          
          if (video.status === 'ready') {
            try {
              console.log(`Creating download URL for video ${video.videoId} with s3Key: ${video.s3Key}`);
              const downloadResult = await s3Service.createDownloadUrl(
                video.s3Key,
                video.secretKey,
                3600 // 1 hour
              );
              downloadUrl = downloadResult.downloadUrl;
              console.log(`Download URL created for video ${video.videoId}:`, downloadUrl);
            } catch (s3Error) {
              console.error(`S3 error for video ${video.videoId}:`, s3Error);
              // Continue without download URL if S3 fails
            }
          }

          const result = {
            id: video.videoId,
            videoId: video.videoId,
            title: video.title,
            status: video.status,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt,
            metadata: video.metadata,
            downloadUrl
          };

          console.log(`Final result for video ${video.videoId}:`, {
            status: result.status,
            hasDownloadUrl: !!result.downloadUrl,
            downloadUrl: result.downloadUrl
          });

          return result;
        } catch (error) {
          console.error(`Error processing video ${video.videoId}:`, error);
          return {
            id: video.videoId,
            videoId: video.videoId,
            title: video.title,
            status: 'failed',
            createdAt: video.createdAt,
            updatedAt: video.updatedAt,
            metadata: video.metadata,
            downloadUrl: null,
            error: 'Failed to process video'
          };
        }
      })
    );

    // Sort videos by creation date (newest first)
    videosWithUrls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      message: 'Video gallery retrieved successfully',
      data: {
        videos: videosWithUrls,
        totalCount: videosWithUrls.length,
        readyCount: videosWithUrls.filter(v => v.status === 'ready').length,
        processingCount: videosWithUrls.filter(v => v.status === 'processing').length,
        failedCount: videosWithUrls.filter(v => v.status === 'failed').length
      }
    });

  } catch (error: any) {
    console.error('Error fetching video gallery:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
