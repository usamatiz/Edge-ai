import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== VIDEO GENERATION API CALLED ===');
  try {
    const body = await request.json();
    console.log('Request body received:', body);
    
    // Validate required fields
    const requiredFields = [
      'hook', 'body', 'conclusion', 'company_name', 
      'social_handles', 'license', 'avatar', 'email', 
      'title'
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
    console.log('Webhook URL:', webhookUrl);
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
      title: body.title,
      timestamp: new Date().toISOString()
    };

    console.log('Sending video generation request to webhook:', {
      webhookUrl,
      email: webhookData.email
    });

    // Send request to second webhook
    console.log('Sending request to video generation webhook:', webhookUrl);
    console.log('Webhook data:', webhookData);

    
    // Fire and forget approach - send request to n8n and return immediately
    // This prevents platform timeout issues when n8n takes 10-15 minutes
    console.log('Sending request to n8n webhook (fire and forget)...');
    
    // Send the request without waiting for response
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...webhookData,
      })
    }).then(response => {
      console.log('Response web hook n8n', response);
      console.log('N8n webhook request sent successfully, status:', response.status);
    }).catch(error => {
      console.error('N8n webhook request failed:', error);
    });



    // Return immediately with request ID
    console.log('Video generation request sent');
    
    const response = {
      success: true,
      message: 'Video generation started successfully',
      data: { 
        status: 'processing',
        timestamp: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes estimate
        note: 'Video generation is running in the background. The video will be available when ready.'
      }
    };
    
    console.log('Returning response:', response);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in video generation API:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
