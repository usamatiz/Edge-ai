'use client'

import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Check, AlertCircle } from 'lucide-react'
import CreateVideoModal from './create-video-modal'
import { sanitizeInput, RateLimiter, CSRFProtection } from '@/lib/utils'

// Zod validation schema
const createVideoSchema = z.object({
  prompt: z.string().min(1, 'Please select a prompt option'),
  avatar: z.string().min(1, 'Please select an avatar'),
  name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  position: z.string().min(1, 'Please select a position'),
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  license: z.string()
    .min(2, 'License must be at least 2 characters')
    .max(50, 'License must be less than 50 characters'),
  tailoredFit: z.string()
    .min(2, 'Tailored fit must be at least 2 characters')
    .max(200, 'Tailored fit must be less than 200 characters'),
  socialHandles: z.string()
    .min(2, 'Social handles must be at least 2 characters')
    .max(200, 'Social handles must be less than 200 characters'),
  videoTopic: z.string()
    .min(2, 'Video topic must be at least 2 characters')
    .max(200, 'Video topic must be less than 200 characters'),
  topicKeyPoints: z.string()
    .min(2, 'Topic key points must be at least 2 characters')
    .max(500, 'Topic key points must be less than 500 characters'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  preferredTone: z.string()
    .min(2, 'Preferred tone must be at least 2 characters')
    .max(100, 'Preferred tone must be less than 100 characters'),
  callToAction: z.string()
    .min(2, 'Call to action must be at least 2 characters')
    .max(200, 'Call to action must be less than 200 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
})

type CreateVideoFormData = z.infer<typeof createVideoSchema>

// Dropdown options
const promptOptions = [
  { value: 'property-listing', label: 'Property Listing Video' },
  { value: 'market-update', label: 'Market Update Video' },
  { value: 'neighborhood-tour', label: 'Neighborhood Tour Video' },
  { value: 'buyer-guide', label: 'Buyer Guide Video' },
  { value: 'seller-guide', label: 'Seller Guide Video' }
]

const avatarOptions = [
  { value: 'professional-male', label: 'Professional Male' },
  { value: 'professional-female', label: 'Professional Female' },
  { value: 'casual-male', label: 'Casual Male' },
  { value: 'casual-female', label: 'Casual Female' }
]

const positionOptions = [
  { value: 'real-estate-agent', label: 'Real Estate Agent' },
  { value: 'loan-officer', label: 'Loan Officer' },
  { value: 'broker', label: 'Broker' },
  { value: 'property-manager', label: 'Property Manager' }
]

interface CreateVideoFormProps {
  className?: string
}

export default function CreateVideoForm({ className }: CreateVideoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formDataForModal, setFormDataForModal] = useState<CreateVideoFormData | null>(null)

  // Security features
  const rateLimiter = useRef(new RateLimiter(3, 60000)) // 3 video requests per minute
  const [csrfToken, setCsrfToken] = useState<string>('')
  
  useEffect(() => {
    // Generate CSRF token when component mounts
    const token = CSRFProtection.generateToken()
    setCsrfToken(token)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<CreateVideoFormData>({
    resolver: zodResolver(createVideoSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: CreateVideoFormData) => {
    // Rate limiting check
    const clientId = `video_${data.email || 'anonymous'}`
    if (rateLimiter.current.isRateLimited(clientId)) {
      const remaining = rateLimiter.current.getRemainingAttempts(clientId)
      alert(`Rate limit exceeded. Please wait before creating another video. ${remaining} attempts remaining.`)
      return
    }

    // CSRF token validation
    if (!CSRFProtection.validateToken(csrfToken)) {
      alert('Security token invalid. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    try {
      // Sanitize all input data before processing
      const sanitizedData: CreateVideoFormData = {
        ...data,
        name: sanitizeInput(data.name, 'name'),
        companyName: sanitizeInput(data.companyName, 'text'),
        license: sanitizeInput(data.license, 'text'),
        tailoredFit: sanitizeInput(data.tailoredFit, 'text'),
        socialHandles: sanitizeInput(data.socialHandles, 'text'),
        videoTopic: sanitizeInput(data.videoTopic, 'text'),
        topicKeyPoints: sanitizeInput(data.topicKeyPoints, 'text'),
        city: sanitizeInput(data.city, 'name'),
        preferredTone: sanitizeInput(data.preferredTone, 'text'),
        callToAction: sanitizeInput(data.callToAction, 'text'),
        email: sanitizeInput(data.email, 'email'),
        prompt: data.prompt,
        avatar: data.avatar,
        position: data.position
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Sanitized form data:', sanitizedData)
      
      // Store form data and open modal
      setFormDataForModal(data)
      setIsModalOpen(true)
      
      // Reset form
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDropdownSelect = (field: keyof CreateVideoFormData, value: string) => {
    setValue(field, value)
    trigger(field) // Trigger validation for this specific field
    setOpenDropdown(null)
  }

  const handleDropdownToggle = (field: keyof CreateVideoFormData) => {
    const isOpen = openDropdown === field
    if (isOpen) {
      // If closing dropdown without selection, trigger validation
      const currentValue = watch(field)
      if (!currentValue || currentValue.trim() === '') {
        // Trigger validation for this field only if no value is selected
        setValue(field, '', { shouldValidate: true })
      }
    }
    setOpenDropdown(isOpen ? null : field)
  }

  const renderDropdown = (
    field: keyof CreateVideoFormData,
    options: { value: string; label: string }[],
    placeholder: string
  ) => {
    const currentValue = watch(field)
    const selectedOption = options.find(option => option.value === currentValue)
    const isOpen = openDropdown === field
    const hasError = errors[field]

    return (
      <div className="relative">
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <button
          type="button"
          onClick={() => handleDropdownToggle(field)}
                     onBlur={() => {
             // Small delay to allow dropdown selection to complete
             setTimeout(() => {
               const currentValue = watch(field)
               if ((!currentValue || currentValue.trim() === '') && openDropdown === field) {
                 setValue(field, '', { shouldValidate: true })
               }
             }, 100)
           }}
          className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer ${
            hasError ? 'ring-2 ring-red-500' : ''
          } ${selectedOption ? 'text-gray-800 bg-[#F5F5F5]' : 'text-[#11101066]'}`}
          aria-describedby={hasError ? `${field}-error` : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDropdownSelect(field, option.value)}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-center justify-between text-[#282828] cursor-pointer"
              >
                <span>{option.label}</span>
                {currentValue === option.value && (
                  <Check className="w-4 h-4 text-[#5046E5]" />
                )}
              </button>
            ))}
          </div>
        )}
        
        {hasError && (
          <p id={`${field}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {hasError.message}
          </p>
        )}
      </div>
    )
  }

  const renderInput = (
    field: keyof CreateVideoFormData,
    placeholder: string,
    type: string = 'text',
    autoComplete?: string
  ) => {
    const hasError = errors[field]
    
    return (
      <div className="relative">
        <input
          {...register(field)}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={hasError ? `${field}-error` : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
          className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${
            hasError ? 'ring-2 ring-red-500' : ''
          }`}
        />
        {hasError && (
          <p id={`${field}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {hasError.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`w-full max-w-[1260px] mx-auto ${className}`}>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-green-800 font-semibold">Success!</h3>
              <p className="text-green-700 text-sm">Your video request has been submitted successfully.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* CSRF Token (hidden) */}
        <input type="hidden" name="csrf_token" value={csrfToken} />
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Prompt <span className="text-red-500">*</span>
            </label>
            {renderDropdown('prompt', promptOptions, 'Select Option')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Avatar <span className="text-red-500">*</span>
            </label>
            {renderDropdown('avatar', avatarOptions, 'Select Option')}
          </div>
          
          <div>
              <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            {renderInput('name', 'Preferred name for the video', 'text', 'name')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            {renderDropdown('position', positionOptions, 'Select Option')}
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            {renderInput('companyName', 'Your brokerage or company name', 'text', 'organization')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              License <span className="text-red-500">*</span>
            </label>
            {renderInput('license', 'Your real estate license number', 'text')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Tailored Fit <span className="text-red-500">*</span>
            </label>
            {renderInput('tailoredFit', 'Your unique selling proposition or specialty', 'text')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Social Handles <span className="text-red-500">*</span>
            </label>
            {renderInput('socialHandles', '@username, @facebook, @instagram', 'text')}
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Video Topic <span className="text-red-500">*</span>
            </label>
            {renderInput('videoTopic', 'Market update, new listing, buyer tips, etc.', 'text')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Topic Key Points <span className="text-red-500">*</span>
            </label>
            {renderInput('topicKeyPoints', 'Main points you want to highlight in the video', 'text')}
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              City <span className="text-red-500">*</span>
            </label>
            {renderInput('city', 'Your primary market area or city', 'text', 'address-level2')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Preferred Tone <span className="text-red-500">*</span>
            </label>
            {renderInput('preferredTone', 'Professional, conversational, energetic', 'text')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Call to Action <span className="text-red-500">*</span>
            </label>
            {renderInput('callToAction', 'Call me, visit my website, schedule consultation', 'text')}
          </div>
          
          <div>
            <label className="block text-[16px] font-normal text-[#5F5F5F] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            {renderInput('email', 'your.email@example.com', 'email', 'email')}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full max-w-full px-8 py-[12.4px] bg-[#5046E5] text-white rounded-full font-semibold text-lg hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#5046E5]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Video...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
                     onClick={() => {
             // If closing dropdown without selection, trigger validation
             const currentValue = watch(openDropdown as keyof CreateVideoFormData)
             if (!currentValue || currentValue.trim() === '') {
               // Trigger validation for this field only if no value is selected
               setValue(openDropdown as keyof CreateVideoFormData, '', { shouldValidate: true })
             }
             setOpenDropdown(null)
           }}
        />
      )}

      {/* Create Video Modal */}
      <CreateVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoTitle={formDataForModal?.prompt || 'Custom Video'}
      />
    </div>
  )
}
