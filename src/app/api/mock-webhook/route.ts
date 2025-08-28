import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Mock webhook received data:', body);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return the expected response format
    return NextResponse.json({
      success: true,
      message: 'Video generated successfully',
      data: {
        videoUrl: 'https://assets.json2video.com/clients/1F75bsfPXR/renders/2025-08-27-97649.mp4',
        status: 'ready',
        timestamp: new Date().toISOString(),
        request_id: `mock_${Date.now()}`,
        metadata: {
          generation_time: '2 seconds',
          duration: '30 seconds',
          resolution: '1920x1080'
        }
      }
    });

  } catch (error) {
    console.error('Error in mock webhook:', error);
    return NextResponse.json({
      success: false,
      message: 'Mock webhook error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
