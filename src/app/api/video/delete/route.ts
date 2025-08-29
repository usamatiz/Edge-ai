import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import AuthService from '@/server/services/Auth.service';
import VideoService from '@/server/services/Video.service';

const authService = new AuthService();
const videoService = new VideoService();

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { videoId } = body;

    // Validate required fields
    if (!videoId) {
      return NextResponse.json({
        success: false,
        message: 'Video ID is required'
      }, { status: 400 });
    }

    // Get video to verify ownership
    const video = await videoService.getVideo(videoId);
    if (!video) {
      return NextResponse.json({
        success: false,
        message: 'Video not found'
      }, { status: 404 });
    }

    // Verify video belongs to user
    // if (video.userId.toString() !== user._id.toString()) {
    //   return NextResponse.json({
    //     success: false,
    //     message: 'Unauthorized to delete this video'
    //   }, { status: 403 });
    // }

    // Delete video
    const deleted = await videoService.deleteVideo(videoId);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete video'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting video:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
