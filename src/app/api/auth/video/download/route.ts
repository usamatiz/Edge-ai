import { NextRequest, NextResponse } from 'next/server';
import { getS3Service } from '@/server/services/S3.service';
import User from '@/server/models/User.model';
import dbConnect from '@/app/lib/mongodb';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate required fields - only videoUrl
    const requiredFields = ['videoUrl'];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json({
          success: false,
          message: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    const { videoUrl, userEmail, metadata } = body;

    // Find the user by email (from request body or get from session)
    let user;
    if (userEmail) {
      user = await User.findOne({ email: userEmail });
    } else {
      // TODO: Get user from session/token if userEmail not provided
      // For now, require userEmail
      return NextResponse.json({
        success: false,
        message: 'User email is required'
      }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found with this email'
      }, { status: 404 });
    }

    console.log('User found:', {
      userId: user._id,
      email: user.email,
      hasVideos: !!user.videos,
      videosLength: user.videos?.length || 0
    });

    // Ensure videos array exists
    if (!user.videos) {
      user.videos = [];
      console.log('Initialized empty videos array for user');
    }

    // Generate unique video ID
    const videoId = `video_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Generate title from URL or use default
    const urlParts = videoUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || `${videoId}.mp4`;
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'My Video';

    // Check if video already exists for this user
    // Use direct array find instead of getVideo method to avoid method attachment issues
    const existingVideo = user.videos.find((video: any) => video.videoId === videoId);
    if (existingVideo) {
      return NextResponse.json({
        success: false,
        message: 'Video already exists for this user'
      }, { status: 409 });
    }

    // Get S3 service
    const s3Service = getS3Service();

    // Download video from external URL
    console.log('Downloading video from:', videoUrl);
    const videoResponse = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
    }

    // Get video content and content type
    const videoBuffer = await videoResponse.arrayBuffer();
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';

    console.log('Video downloaded successfully, size:', videoBuffer.byteLength, 'bytes');

    // Create S3 key and secret key
    const s3Key = s3Service.generateS3Key((user._id as any).toString(), videoId, filename);
    const secretKey = crypto.randomBytes(32).toString('hex');

    // Upload video to S3
    console.log('Uploading video to S3...');
    await s3Service.uploadVideoDirectly(
      s3Key,
      Buffer.from(videoBuffer),
      contentType,
      {
        userId: (user._id as any).toString(),
        videoId,
        secretKey,
        uploadedAt: new Date().toISOString(),
      }
    );

    console.log('Video uploaded to S3 successfully');

    // Add video to user's collection
    user.addVideo({
      videoId,
      title,
      secretKey,
      s3Key,
      status: 'ready',
      metadata: {
        ...metadata,
        size: videoBuffer.byteLength,
        format: contentType.split('/')[1] || 'mp4',
        originalUrl: videoUrl
      }
    });

    // Save user
    await user.save();

    console.log('Video saved to database successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Video downloaded and uploaded successfully',
      data: {
        videoId,
        title,
        s3Key,
        secretKey,
        status: 'ready',
        size: videoBuffer.byteLength,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error processing video download:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
