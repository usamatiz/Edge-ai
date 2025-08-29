import { NextRequest, NextResponse } from 'next/server';
import User from '@/server/models/User.model';
import dbConnect from '@/app/lib/mongodb';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['userId', 'videoId', 'status'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          message: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    const { userId, videoId, status, metadata } = body;

    // Validate status
    const validStatuses = ['processing', 'ready', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status. Must be one of: processing, ready, failed'
      }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Find and update the video
    const videoIndex = user.videos.findIndex(video => video.videoId === videoId);
    if (videoIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Video not found'
      }, { status: 404 });
    }

    // Update video status and metadata
    user.videos[videoIndex].status = status;
    if (metadata) {
      user.videos[videoIndex].metadata = {
        ...user.videos[videoIndex].metadata,
        ...metadata
      };
    }
    user.videos[videoIndex].updatedAt = new Date();

    // Save user
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Video status updated successfully',
      data: {
        videoId,
        status,
        updatedAt: user.videos[videoIndex].updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error updating video status:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
