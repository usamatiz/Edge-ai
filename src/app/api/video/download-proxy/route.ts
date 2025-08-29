import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({
        success: false,
        message: 'Video URL is required'
      }, { status: 400 });
    }

    console.log('Proxying video download from:', videoUrl);

    // Fetch the video from S3 (server-side, no CORS issues)
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.status}`);
    }

    // Get video data
    const videoBuffer = await videoResponse.arrayBuffer();
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';

    // Return the video as a downloadable file
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="video.mp4"',
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
        // Remove all CORS restrictions
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
    });

  } catch (error: any) {
    console.error('Error proxying video download:', error);
    
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
