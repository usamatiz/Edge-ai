# S3 Bucket Integration Setup Guide

This guide explains how to set up the S3 bucket integration for video storage in your workflow project.

## Overview

The S3 integration allows you to:
- Store videos securely in AWS S3
- Generate secure download URLs for users
- Manage video access with secret keys
- Display videos in a user gallery
- Download videos directly from the frontend

## Prerequisites

1. AWS Account with S3 access
2. AWS IAM user with S3 permissions
3. S3 bucket created for video storage

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-video-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## S3 Bucket Setup

1. **Create S3 Bucket:**
   - Go to AWS S3 Console
   - Create a new bucket with a unique name
   - Choose your preferred region
   - Enable versioning (optional but recommended)

2. **Configure Bucket Permissions:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowVideoUploads",
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
         },
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-bucket-name",
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

3. **CORS Configuration:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

## API Endpoints

### 1. Generate Video
**POST** `/api/auth/create-video/generate-video`

Calls Aftab's webhook and waits for response with video URL.

**Request Body:**
```json
{
  "hook": "Video prompt",
  "body": "Video description", 
  "conclusion": "Video conclusion",
  "company_name": "Company Name",
  "social_handles": "@handle",
  "license": "License Info",
  "avatar": "Avatar Name",
  "email": "user@example.com"
}
```

**Response (Video Ready):**
```json
{
  "success": true,
  "message": "Video generated successfully",
  "data": {
    "videoUrl": "https://external-video-service.com/video.mp4",
    "status": "ready",
    "timestamp": "2025-01-26T10:15:00.000Z"
  }
}
```

**Response (Processing):**
```json
{
  "success": true,
  "message": "Video generation request submitted successfully",
  "data": {
    "status": "processing",
    "estimatedTime": 15,
    "timestamp": "2025-01-26T10:00:00.000Z",
    "message": "Your video is being generated. This process typically takes 15 minutes."
  }
}
```

### 2. Download and Store Video
**POST** `/api/auth/video/download`

Called by the modal to download a video from external URL and store it in S3.

**Request Body:**
```json
{
  "videoUrl": "https://external-video-url.com/video.mp4",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video downloaded and uploaded successfully",
  "data": {
    "videoId": "video_1703123456789_abc123def",
    "title": "video",
    "s3Key": "videos/user_id/video_id/timestamp_filename.mp4",
    "secretKey": "generated_secret_key",
    "status": "ready",
    "size": 10485760,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update Video Status
**PUT** `/api/auth/video/status`

Called to update video status (if needed).

**Request Body:**
```json
{
  "userId": "user_id",
  "videoId": "unique_video_id",
  "status": "ready",
  "metadata": {
    "duration": 120,
    "size": 10485760,
    "format": "mp4"
  }
}
```

### 4. Get User Video Gallery
**GET** `/api/auth/video/gallery?userId=user_id`

Returns all videos for a user with download URLs.

**Response:**
```json
{
  "success": true,
  "message": "Video gallery retrieved successfully",
  "data": {
    "videos": [
      {
        "videoId": "unique_video_id",
        "title": "Video Title",
        "status": "ready",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "metadata": {
          "duration": 120,
          "size": 10485760,
          "format": "mp4"
        },
        "downloadUrl": "https://s3-presigned-download-url.com"
      }
    ],
    "totalCount": 1,
    "readyCount": 1,
    "processingCount": 0,
    "failedCount": 0
  }
}
```

### 5. Delete Video
**DELETE** `/api/auth/video/delete`

Deletes a video from both database and S3.

**Request Body:**
```json
{
  "userId": "user_id",
  "videoId": "unique_video_id"
}
```

## Frontend Integration

### Video Gallery Component

The `VideoGallery` component displays user videos with download functionality:

```tsx
import VideoGallery from '@/components/ui/video-gallery'

<VideoGallery userId="user_id" />
```

### Gallery Page

Access the video gallery at `/gallery` (requires authentication).

## Flow Summary

1. **Video Creation:** User submits form → Webhook processes → Video created
2. **Video Generation:** User clicks "Create Video" in modal → Second webhook called
3. **Video URL Response:** Second webhook returns `videoUrl` in response
4. **Video Processing:** Modal receives `videoUrl` and calls download API with current user's email
5. **Video Storage:** Download API downloads video from URL and uploads to S3
6. **Database Storage:** Video metadata and secret key saved to user's record
7. **Gallery Display:** Frontend calls `/api/auth/video/gallery` → Videos displayed with download links
8. **Video Download:** User clicks download → Presigned download URL used

## Security Features

- **Secret Keys:** Each video has a unique secret key for access control
- **Presigned URLs:** Temporary, secure URLs for download
- **User Isolation:** Videos are organized by user ID
- **Access Validation:** All operations verify user ownership and secret keys

## Error Handling

- Invalid user email returns 404
- Missing required fields returns 400
- Video download failures are logged and handled gracefully
- S3 errors are logged and handled gracefully
- Failed operations provide clear error messages

## Testing

1. Set up environment variables
2. Create a test user
3. Call the download API with test video URL and user email
4. Verify video appears in gallery
5. Test download functionality

## Troubleshooting

- **S3 Access Denied:** Check IAM permissions and bucket policy
- **Invalid Credentials:** Verify AWS access keys
- **CORS Errors:** Check bucket CORS configuration
- **Missing Videos:** Verify user email and video status
- **Download Failures:** Check external video URL accessibility
