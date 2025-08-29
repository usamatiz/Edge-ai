import { NextRequest, NextResponse } from 'next/server';
import { getS3Service } from '@/server/services/S3.service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields - videoUrl and email
    const requiredFields = ['videoUrl', 'email'];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json({
          success: false,
          message: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    const { videoUrl, email } = body;

    // Generate unique video ID
    const videoId = `video_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Generate title from URL or use default
    const urlParts = videoUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || `${videoId}.mp4`;
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'My Video';

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
    const s3Key = s3Service.generateS3Key('public', videoId, filename);
    const secretKey = crypto.randomBytes(32).toString('hex');

    // Upload video to S3
    console.log('Uploading video to S3...');
    await s3Service.uploadVideoDirectly(
      s3Key,
      Buffer.from(videoBuffer),
      contentType,
      {
        videoId,
        secretKey,
        uploadedAt: new Date().toISOString(),
      }
    );

    console.log('Video uploaded to S3 successfully');

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
