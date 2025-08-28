'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface CreateVideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
  startAtComplete?: boolean
  videoData?: { title: string; youtubeUrl: string; thumbnail: string } | null
  webhookResponse?: {
    prompt?: string
    description?: string
    conclusion?: string
    company_name?: string
    social_handles?: string
    license?: string
    avatar?: string
    email?: string
  } | null
}

type ModalStep = 'form' | 'loading' | 'complete'

export default function CreateVideoModal({ isOpen, onClose, startAtComplete = false, videoData, webhookResponse }: CreateVideoModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(startAtComplete ? 'complete' : 'form')
  const [formData, setFormData] = useState({
    prompt: webhookResponse?.prompt || '',
    description: webhookResponse?.description || '',
    conclusion: webhookResponse?.conclusion || ''
  })
  const [errors, setErrors] = useState({
    prompt: '',
    description: '',
    conclusion: ''
  })
  const [touched, setTouched] = useState({
    prompt: false,
    description: false,
    conclusion: false
  })
  const [isDownloading, setIsDownloading] = useState(false)

  // Update form data when webhookResponse changes
  useEffect(() => {
    // console.log('Modal received webhookResponse:', webhookResponse);
    if (webhookResponse) {
      const newFormData = {
        prompt: webhookResponse.prompt || '',
        description: webhookResponse.description || '',
        conclusion: webhookResponse.conclusion || ''
      }
      // console.log('Setting modal form data:', newFormData);
      setFormData(newFormData)
    }
  }, [webhookResponse])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleInputBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const validateForm = () => {
    const newErrors = {
      prompt: '',
      description: '',
      conclusion: ''
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.conclusion.trim()) {
      newErrors.conclusion = 'Conclusion is required'
    }

    setErrors(newErrors)
    return !newErrors.prompt && !newErrors.description && !newErrors.conclusion
  }

  const handleVideoDownload = async (videoUrl: string) => {
    try {
      console.log('Video URL received:', videoUrl);
      
      // Call the download API to process the video
      const downloadResponse = await fetch('/api/auth/video/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: videoUrl,
          userEmail: webhookResponse?.email || ''
        }),
      });

      if (!downloadResponse.ok) {
        const downloadError = await downloadResponse.json().catch(() => ({}));
        console.error('Video download API error:', downloadError);
        throw new Error(downloadError.message || 'Failed to download and store video');
      }

      const downloadResult = await downloadResponse.json();
      console.log('Video download and storage result:', downloadResult);
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  }

  const handleCreateVideo = async () => {
    if (!validateForm()) {
      return
    }
    
    setCurrentStep('loading')
    
    try {
      // Prepare data for video generation API
      const videoGenerationData = {
        hook: formData.prompt,
        body: formData.description,
        conclusion: formData.conclusion,
        company_name: webhookResponse?.company_name || '',
        social_handles: webhookResponse?.social_handles || '',
        license: webhookResponse?.license || '',
        avatar: webhookResponse?.avatar || '',
        email: webhookResponse?.email || ''
      }

      console.log('Sending video generation request:', videoGenerationData);

      // Call the video generation API (second webhook)
      const response = await fetch('/api/auth/create-video/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoGenerationData),
      });

      const result = await response.json();
      console.log('Video generation result:', result);

      if (!response.ok) {
        console.error('Video generation API error:', result);
        
        // Handle different types of errors
        let errorMessage = 'Failed to generate video';
        if (result.error) {
          if (typeof result.error === 'object' && result.error.message) {
            errorMessage = result.error.message;
          } else if (typeof result.error === 'string') {
            errorMessage = result.error;
          }
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        throw new Error(errorMessage);
      }

      // Check if the response contains videoUrl
      if (result.data && result.data.videoUrl) {
        console.log('Video URL received:', result.data.videoUrl);
        await handleVideoDownload(result.data.videoUrl);
        setCurrentStep('complete');
      } else if (result.data && result.data.status === 'processing') {
        // Video is still processing
        console.log('Video generation started, processing in progress...');
        console.log('Request ID:', result.data.request_id);
        console.log('Estimated completion:', result.data.estimated_completion);
        
        // Keep in loading state - the API will wait for the response
        setCurrentStep('loading');
      } else {
        // Unexpected response format
        console.log('Unexpected response format:', result);
        throw new Error('Unexpected response from video generation service');
      }

    } catch (error: any) {
      console.error('Error generating video:', error);
      console.log(`Error generating video: ${error.message}`);
      setCurrentStep('form') // Go back to form on error
    }
  }

  const handleClose = () => {
    setCurrentStep(startAtComplete ? 'complete' : 'form')
    setFormData({ 
      prompt: webhookResponse?.prompt || '', 
      description: webhookResponse?.description || '', 
      conclusion: webhookResponse?.conclusion || '' 
    })
    setErrors({ prompt: '', description: '', conclusion: '' })
    setTouched({ prompt: false, description: false, conclusion: false })
    onClose()
  }

  const handleDownload = async () => {
    if (!videoData?.youtubeUrl) {
      console.error('No video URL available for download')
      return
    }

    console.log('Downloading video from:', videoData.youtubeUrl)
    
    try {
      // Set loading state
      setIsDownloading(true)
      console.log('Starting download...')
      
      // Use our proxy to avoid CORS issues
      const proxyUrl = `/api/auth/video/download-proxy?url=${encodeURIComponent(videoData.youtubeUrl)}`
      
      // Fetch the video through our proxy
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
      }
      
      // Convert response to blob
      const blob = await response.blob()
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${videoData.title || 'video'}.mp4`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl)
      
      console.log('Download completed for:', videoData.title)
      
    } catch (error) {
      console.error('Download failed:', error)
      // You could show a user-friendly error message here
      alert('Download failed. Please try again.')
    } finally {
      // Reset loading state
      setIsDownloading(false)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-[1260px] w-full max-h-[90vh] flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4 flex-shrink-0">
          <h3 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">
            {currentStep === 'form' && 'Create new video'}
            {currentStep === 'loading' && 'Creating a new video'}
            {currentStep === 'complete' && `${videoData ? `${videoData.title}` : 'Your video is Rendered'}`}
          </h3>

          <button
            onClick={handleClose}
            className="cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {currentStep === 'complete' && !videoData && (
            <p className='md:text-[20px] text-[16px] font-normal text-[#5F5F5F] pl-6'>
            It has also been sent to your email.
            </p>
          )}

        {/* Modal Content */}
        <div className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
          {/* Step 1: Form */}
          {currentStep === 'form' && (
            <>              
                             <div className="flex gap-2 mb-8 md:flex-row flex-col">
                 <div className='w-full'>
                   <label className="block text-base font-normal text-[#5F5F5F] mb-2">
                     Prompt <span className="text-red-500">*</span>
                   </label>
                   <textarea
                     value={formData.prompt}
                     onChange={(e) => handleInputChange('prompt', e.target.value)}
                     onBlur={() => handleInputBlur('prompt')}
                     placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
                     className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                       errors.prompt ? 'ring-2 ring-red-500' : ''
                     }`}
                   />
                   {errors.prompt && (
                     <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                       <AlertCircle className="w-4 h-4" />
                       {errors.prompt}
                     </p>
                   )}
                 </div>

                 <div className='w-full'>
                   <label className="block text-base font-normal text-[#5F5F5F] mb-2">
                     Description <span className="text-red-500">*</span>
                   </label>
                   <textarea
                     value={formData.description}
                     onChange={(e) => handleInputChange('description', e.target.value)}
                     onBlur={() => handleInputBlur('description')}
                     placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
                     className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                       errors.description ? 'ring-2 ring-red-500' : ''
                     }`}
                   />
                   {errors.description && (
                     <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                       <AlertCircle className="w-4 h-4" />
                       {errors.description}
                     </p>
                   )}
                 </div>

                 <div className='w-full'>
                   <label className="block text-base font-normal text-[#5F5F5F] mb-2">
                     Conclusion <span className="text-red-500">*</span>
                   </label>
                   <textarea
                     value={formData.conclusion}
                     onChange={(e) => handleInputChange('conclusion', e.target.value)}
                     onBlur={() => handleInputBlur('conclusion')}
                     placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to"
                     className={`w-full md:h-[371px] h-[200px] px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] resize-none focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                       errors.conclusion ? 'ring-2 ring-red-500' : ''
                     }`}
                   />
                   {errors.conclusion && (
                     <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                       <AlertCircle className="w-4 h-4" />
                       {errors.conclusion}
                     </p>
                   )}
                 </div>
               </div>

              <button
                onClick={handleCreateVideo}
                className="w-full bg-[#5046E5] text-white py-[11.4px] px-6 rounded-full font-semibold text-[20px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-colors duration-300 cursor-pointer"
              >
                Create Video
              </button>
            </>
          )}

          {/* Step 2: Loading */}
          {currentStep === 'loading' && (
            <div className="text-center py-12">
              <div className="mb-6">
                <h4 className="md:text-[32px] text-[24px] font-semibold text-[#282828] mb-4">
                  Your Video is in Process
                </h4>
                <p className="text-[#5F5F5F] text-lg mb-6">
                  This process typically takes 15 minutes. Please don&apos;t close this window.
                </p>
              </div>

              <div className="flex justify-center mb-6 relative">
                <div className="loader text-[#5046E5] text-[18px] font-normal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Processing...</div>
                <div className="flex justify-center">
                  <div className="spinner"></div>
                </div>
              </div>
              
              <div className="text-[#5F5F5F] text-sm">
                <p>• Generating video content</p>
                <p>• Applying company branding</p>
                <p>• Finalizing video quality</p>
              </div>
            </div>
          )}

                     {/* Step 3: Complete */}
              {currentStep === 'complete' && (
                <div className="space-y-6">        
                    {videoData ? (
                     <>
                       {/* Video Preview */}
                       <div className="relative mt-7 h-[420px] w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden">
                       <video
                          src={videoData.youtubeUrl} 
                          title={videoData.title}
                          className="w-full h-full rounded-[8px] object-contain cursor-pointer"
                          controls
                          preload="metadata"
                          poster={videoData.thumbnail}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      </>
                    ) : (
                     <>
                      
                      {/* Video Preview */}
                      <div className="relative mt-7 h-[420px] w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Image src="/images/modal-image.png" alt="Video Preview" width={1000} height={1000} className='w-full h-full object-cover' />
                      </div>
                      </div>
                      </>
                    )}
                 
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`w-full bg-[#5046E5] text-white py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] transition-colors duration-300 flex items-center justify-center gap-2 ${
                    isDownloading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-transparent hover:text-[#5046E5] cursor-pointer'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Downloading...
                    </>
                  ) : (
                    'Download'
                  )}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
