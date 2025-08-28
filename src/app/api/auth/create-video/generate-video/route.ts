import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'hook', 'body', 'conclusion', 'company_name', 
      'social_handles', 'license', 'avatar', 'email'
    ];
    
    for (const field of requiredFields) {
      console.log(`Checking field ${field}:`, body[field]);
      if (!body[field] || body[field].trim() === '') {
        console.log(`Field ${field} is missing or empty`);
        return NextResponse.json({
          success: false,
          message: `Missing or empty required field: ${field}`,
          error: `Field ${field} is required and cannot be empty`,
          receivedData: body
        }, { status: 400 });
      }
    }

    // Webhook URL for video generation
    const webhookUrl = process.env.GENERATE_VIDEO_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('GENERATE_VIDEO_WEBHOOK_URL environment variable is not set');
    }

    // Prepare data for second webhook
    const webhookData = {
      hook: body.hook,
      body: body.body,
      conclusion: body.conclusion,
      company_name: body.company_name,
      social_handles: body.social_handles,
      license: body.license,
      avatar: body.avatar,
      email: body.email,
      timestamp: new Date().toISOString()
    };

    console.log('Sending video generation request to webhook:', {
      webhookUrl,
      email: webhookData.email
    });

    // Send request to second webhook
    console.log('Sending request to video generation webhook:', webhookUrl);
    console.log('Webhook data:', webhookData);

    // Send request to webhook with long timeout for video generation
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData),
      signal: AbortSignal.timeout(900000) // 15 minutes timeout for video generation
    });

    if (!webhookResponse.ok) {
      const errorDetails = await webhookResponse.text();
      console.error('Webhook error:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        details: errorDetails
      });
      
      // Handle specific error codes
      let errorMessage = `Failed to generate video. Webhook returned ${webhookResponse.status}`;
      let statusCode = 502;
      
      if (webhookResponse.status === 524) {
        errorMessage = 'Video generation service is currently experiencing high load. Please try again in a few minutes.';
        statusCode = 503; // Service Unavailable
      } else if (webhookResponse.status >= 500) {
        errorMessage = 'Video generation service is temporarily unavailable. Please try again later.';
        statusCode = 503;
      } else if (webhookResponse.status === 429) {
        errorMessage = 'Too many video generation requests. Please wait a moment before trying again.';
        statusCode = 429;
      }
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: `Webhook error: ${webhookResponse.status}`,
        details: errorDetails
      }, { status: statusCode });
    }

    const webhookResult = await webhookResponse.json();
    console.log('Webhook response received:', webhookResult);

    // Check if the response contains videoUrl
    if (webhookResult.videoUrl || webhookResult.data?.videoUrl || webhookResult.url) {
      const videoUrl = webhookResult.videoUrl || webhookResult.data?.videoUrl || webhookResult.url;
      
      console.log('Video URL found in response:', videoUrl);

      return NextResponse.json({
        success: true,
        message: 'Video generated successfully',
        data: {
          videoUrl: videoUrl,
          status: 'ready',
          timestamp: new Date().toISOString(),
          webhookResponse: webhookResult
        }
      });
    } else {
      // If no video URL, return processing status
      console.log('No video URL in response, video is still processing');
      
      return NextResponse.json({
        success: true,
        message: 'Video generation started, waiting for completion',
        data: {
          status: 'processing',
          timestamp: new Date().toISOString(),
          webhookResponse: webhookResult
        }
      });
    }

  } catch (error: any) {
    console.error('Error in video generation API:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
