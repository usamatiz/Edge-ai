import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'prompt', 'avatar', 'name', 'position', 'companyName', 
      'license', 'tailoredFit', 'socialHandles', 'videoTopic', 
      'topicKeyPoints', 'city', 'preferredTone', 'callToAction', 'email'
    ];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json({
          success: false,
          message: `${field} is required`
        }, { status: 400 });
      }
    }

    // Webhook URL from environment variables
    const webhookUrl = process.env.VIDEO_CREATION_WEBHOOK_URL;    
    
    if (!webhookUrl) {
      console.error('VIDEO_CREATION_WEBHOOK_URL environment variable is not set');
      return NextResponse.json({
        success: false,
        message: 'Video creation service is not configured'
      }, { status: 500 });
    }

    // Prepare data for webhook
    const webhookData = {
      prompt: body.prompt,
      avatar: body.avatar,
      name: body.name,
      position: body.position,
      companyName: body.companyName,
      license: body.license,
      tailoredFit: body.tailoredFit,
      socialHandles: body.socialHandles,
      videoTopic: body.videoTopic,
      topicKeyPoints: body.topicKeyPoints,
      city: body.city,
      preferredTone: body.preferredTone,
      zipCode: 90014,
      zipKeyPoints: 'new bars and restaurants',
      callToAction: body.callToAction,
      email: body.email,
      timestamp: new Date().toISOString(),
      requestId: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('Sending video creation request to webhook:', {
      webhookUrl,
      requestId: webhookData.requestId,
      email: webhookData.email
    });

    // Send request to webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook request failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json({
        success: false,
        message: 'Failed to create video. Please try again later.',
        error: `Webhook error: ${webhookResponse.status} ${webhookResponse.statusText}`
      }, { status: 502 });
    }

    const webhookResult = await webhookResponse.json();
    
    console.log('Video creation webhook successful:', {
      requestId: webhookData.requestId,
      webhookResponse: webhookResult
    });

    // Return success response with webhook data
    return NextResponse.json({
      success: true,
      message: 'Video creation request submitted successfully',
      data: {
        requestId: webhookData.requestId,
        webhookResponse: webhookResult,
        timestamp: webhookData.timestamp,
        status: 'pending' // You might want to get actual status from webhook response
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Create video API Error:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        message: 'Video creation request timed out. Please try again.'
      }, { status: 408 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message
    }, { status: 500 });
  }
}
