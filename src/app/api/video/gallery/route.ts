import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import AuthService from '@/server/services/Auth.service';
import VideoService from '@/server/services/Video.service';
import { IUser } from '@/server/models/User.model';

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
    const user = await authService.getCurrentUser(accessToken) as IUser;
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired access token'
      }, { status: 401 });
    }

    // Get video service
    const videoService = new VideoService();

    // Get user's videos with download URLs
    const videosWithUrls = await videoService.getUserVideosWithDownloadUrls(user.email);

    // Get video statistics
    const stats = await videoService.getUserVideoStats(user.email);

    return NextResponse.json({
      success: true,
      message: 'Video gallery retrieved successfully',
      data: {
        videos: videosWithUrls.map(video => ({
          id: (video._id as any).toString(),
          videoId: video.videoId,
          title: video.title,
          status: video.status,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          metadata: video.metadata,
          downloadUrl: (video as any).downloadUrl || null
        })),
        totalCount: stats.totalCount,
        readyCount: stats.readyCount,
        processingCount: stats.processingCount,
        failedCount: stats.failedCount
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
