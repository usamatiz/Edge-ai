'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react'
import { PhotoAvatarUpdate } from '@/hooks/usePhotoAvatarNotifications'

interface PhotoAvatarNotificationProps {
  notifications: PhotoAvatarUpdate[]
  isConnected: boolean
  onClose?: () => void
  className?: string
}

export default function PhotoAvatarNotification({ 
  notifications, 
  isConnected, 
  onClose,
  className = '' 
}: PhotoAvatarNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [progress, setProgress] = useState(0)

  // Show notification when we have updates
  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true)
      const latest = notifications[notifications.length - 1]
      setCurrentStep(latest.step)
      
      // Calculate progress based on step
      const stepProgress = getStepProgress(latest.step)
      setProgress(stepProgress)
    }
  }, [notifications])

  const getStepProgress = (step: string): number => {
    const stepMap: Record<string, number> = {
      'upload': 20,
      'group-creation': 40,
      'training': 60,
      'saving': 80,
      'complete': 100
    }
    return stepMap[step] || 0
  }

  const getStepIcon = (step: string, status: string) => {
    if (status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
    if (status === 'success' || step === 'complete') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <Clock className="w-5 h-5 text-blue-500" />
  }

  const getStepMessage = (step: string): string => {
    const messages: Record<string, string> = {
      'upload': 'Uploading your photo...',
      'group-creation': 'Creating avatar group...',
      'training': 'Training your avatar...',
      'saving': 'Saving your avatar...',
      'complete': 'Avatar ready!'
    }
    return messages[step] || 'Processing...'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const latestNotification = notifications[notifications.length - 1]

  if (!isVisible || !latestNotification) return null

  return (
    <div className={`fixed top-4 right-4 z-[60] max-w-sm w-full ${className}`}>
      <div className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStatusColor(latestNotification.status)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStepIcon(latestNotification.step, latestNotification.status)}
            <h4 className="font-semibold text-gray-800">
              {latestNotification.status === 'error' ? 'Avatar Creation Failed' : 'Creating Avatar'}
            </h4>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Progress Bar */}
        {latestNotification.status === 'progress' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{getStepMessage(latestNotification.step)}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex justify-between mb-3">
          {['upload', 'group-creation', 'training', 'saving', 'complete'].map((step, index) => {
            const isActive = step === currentStep
            const isCompleted = getStepProgress(step) <= progress
            const isError = latestNotification.status === 'error' && step === currentStep
            
            return (
              <div
                key={step}
                className={`flex flex-col items-center ${index < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isError
                      ? 'bg-red-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isError ? (
                    <X className="w-3 h-3" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center capitalize">
                  {step.replace('-', ' ')}
                </span>
                {index < 4 && (
                  <div
                    className={`absolute top-3 left-1/2 w-full h-0.5 -z-10 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ transform: 'translateX(50%)' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Message */}
        <div className="text-sm text-gray-700">
          {latestNotification.data?.message || getStepMessage(latestNotification.step)}
        </div>

        {/* Error Details */}
        {latestNotification.status === 'error' && latestNotification.data?.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            {latestNotification.data.error}
          </div>
        )}

        {/* Success Message */}
        {latestNotification.status === 'success' && (
          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
            🎉 Your avatar is ready to use!
          </div>
        )}
      </div>
    </div>
  )
}
