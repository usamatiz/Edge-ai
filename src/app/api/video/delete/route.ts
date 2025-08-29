import { NextRequest, NextResponse } from 'next/server';
import { getS3Service } from '@/server/services/S3.service';
import User from '@/server/models/User.model';
import dbConnect from '@/app/lib/mongodb';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['userId', 'videoId'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          message: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    const { userId, videoId } = body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Find the video
    const video = user.getVideo(videoId);
    if (!video) {
      return NextResponse.json({
        success: false,
        message: 'Video not found'
      }, { status: 404 });
    }

    // Get S3 service
    const s3Service = getS3Service();

    // Delete from S3
    let s3Deleted = false;
    try {
      s3Deleted = await s3Service.deleteVideo(video.s3Key, video.secretKey);
    } catch (error) {
      console.error('Error deleting video from S3:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Remove from user's collection
    const removed = user.removeVideo(videoId);
    if (!removed) {
      return NextResponse.json({
        success: false,
        message: 'Failed to remove video from database'
      }, { status: 500 });
    }

    // Save user
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
      data: {
        videoId,
        s3Deleted,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error deleting video:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
