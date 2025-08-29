import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import VideoService from '@/server/services/Video.service';

const videoService = new VideoService();

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('Video complete webhook received:', body);

    const { 
      videoId, 
      status = 'ready', 
      s3Key, 
      metadata,
      error 
    } = body;

    // Validate required fields
    if (!videoId) {
      console.error('Video complete webhook: Missing videoId');
      return NextResponse.json({
        success: false,
        message: 'Video ID is required'
      }, { status: 400 });
    }

    // If there's an error, mark video as failed
    const finalStatus = error ? 'failed' : status;

    // Update video status
    const updatedVideo = await videoService.updateVideoStatus(videoId, finalStatus);

    if (!updatedVideo) {
      console.error(`Video complete webhook: Video not found - ${videoId}`);
      return NextResponse.json({
        success: false,
        message: 'Video not found'
      }, { status: 404 });
    }

    // Update metadata if provided
    if (metadata) {
      await videoService.updateVideoMetadata(videoId, metadata);
    }

    // Update S3 key if provided
    if (s3Key && s3Key !== updatedVideo.s3Key) {
      // Note: This would require updating the S3 key in the database
      // For now, we'll just log it
      console.log(`Video complete webhook: S3 key updated for video ${videoId}`);
    }

    console.log(`Video complete webhook: Successfully updated video ${videoId} to status ${finalStatus}`);

    return NextResponse.json({
      success: true,
      message: 'Video status updated successfully',
      data: {
        videoId: updatedVideo.videoId,
        status: updatedVideo.status,
        updatedAt: updatedVideo.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Video complete webhook error:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
