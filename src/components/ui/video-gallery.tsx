'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Play, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { apiService } from '@/lib/api-service'

interface Video {
  videoId: string
  title: string
  status: 'processing' | 'ready' | 'failed'
  createdAt: string
  updatedAt: string
  metadata?: {
    duration?: number
    size?: number
    format?: string
  }
  downloadUrl?: string | null
  error?: string
}

interface VideoGalleryProps {
  userId: string
  className?: string
}

export default function VideoGallery({ userId, className }: VideoGalleryProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null)

  // Fetch videos from API using new Express backend
  const fetchVideos = async () => {
    try
    {
      setLoading(true)
      setError(null)

      const result = await apiService.getVideoGallery()

      if (!result.success || !result.data)
      {
        throw new Error(result.message || 'Failed to fetch videos')
      }

      setVideos(result.data.videos)
    } catch (err: any)
    {
      setError(err.message || 'Failed to load videos')
    } finally
    {
      setLoading(false)
    }
  }

  // Delete video
  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.'))
    {
      return
    }

    try
    {
      setDeletingVideo(videoId)

      const result = await apiService.deleteVideo(videoId)

      if (!result.success)
      {
        throw new Error(result.message || 'Failed to delete video')
      }

      // Remove video from state
      setVideos(prev => prev.filter(video => video.videoId !== videoId))
    } catch (err: any)
    {
      alert(err.message || 'Failed to delete video')
    } finally
    {
      setDeletingVideo(null)
    }
  }

  // Download video
  const downloadVideo = async (video: Video) => {
    if (!video.downloadUrl)
    {
      alert('Download URL not available for this video')
      return
    }

    try
    {
      const response = await fetch(video.downloadUrl)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${video.title}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err)
    {
      alert('Failed to download video')
    }
  }

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status)
    {
      case 'ready':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' }
      case 'processing':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' }
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  // Load videos on component mount
  useEffect(() => {
    fetchVideos()
  }, [userId])

  if (loading)
  {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading videos...</span>
      </div>
    )
  }

  if (error)
  {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchVideos}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (videos.length === 0)
  {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h3>
        <p className="text-gray-600">Your created videos will appear here once they&apos;re ready.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Videos</h2>
        <button
          onClick={fetchVideos}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const StatusIcon = getStatusInfo(video.status).icon
          const statusColor = getStatusInfo(video.status).color
          const statusBg = getStatusInfo(video.status).bg

          return (
            <div
              key={video.videoId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBg}`}>
                  <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                  <span className={`font-medium ${statusColor}`}>
                    {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span>Created:</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                {video.metadata?.duration && (
                  <div className="flex items-center gap-2">
                    <span>Duration:</span>
                    <span>{formatDuration(video.metadata.duration)}</span>
                  </div>
                )}
                {video.metadata?.size && (
                  <div className="flex items-center gap-2">
                    <span>Size:</span>
                    <span>{formatFileSize(video.metadata.size)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {video.status === 'ready' && video.downloadUrl && (
                  <button
                    onClick={() => downloadVideo(video)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}

                <button
                  onClick={() => deleteVideo(video.videoId)}
                  disabled={deletingVideo === video.videoId}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingVideo === video.videoId ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {video.error && (
                <div className="mt-2 text-xs text-red-600">
                  Error: {video.error}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
