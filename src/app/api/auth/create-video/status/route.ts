import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { requestId, email } = body;
    
    if (!requestId || !email) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: requestId and email',
        error: 'Request ID and email are required'
      }, { status: 400 });
    }

    // Webhook URL for status check
    const statusWebhookUrl = process.env.CHECK_VIDEO_STATUS_WEBHOOK_URL;
    if (!statusWebhookUrl) {
      throw new Error('CHECK_VIDEO_STATUS_WEBHOOK_URL environment variable is not set');
    }

    // Prepare data for status check
    const statusData = {
      requestId: requestId,
      email: email,
      timestamp: new Date().toISOString()
    };

    console.log('Checking video generation status:', {
      statusWebhookUrl,
      requestId,
      email
    });

    // Send request to status webhook without timeout
    const statusResponse = await fetch(statusWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });

    if (!statusResponse.ok) {
      const errorDetails = await statusResponse.text();
      console.error('Status check error:', {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        details: errorDetails
      });
      
      return NextResponse.json({
        success: false,
        message: 'Failed to check video status',
        error: `Status check error: ${statusResponse.status}`,
        details: errorDetails
      }, { status: statusResponse.status });
    }

    const statusResult = await statusResponse.json();
    console.log('Status check response:', statusResult);

    return NextResponse.json({
      success: true,
      message: 'Status check completed',
      data: statusResult
    });

  } catch (error: any) {
    console.error('Error in video status check API:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error during status check',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
