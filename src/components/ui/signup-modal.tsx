'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { sanitizeInput, RateLimiter, CSRFProtection } from '@/lib/utils'
import { useAuth, type UserData } from '@/contexts/AuthContext'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignin?: () => void
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  general?: string
}

interface PasswordStrength {
  score: number
  feedback: string[]
}



export default function SignupModal({ isOpen, onClose, onOpenSignin }: SignupModalProps) {
  // Use shared auth context
  const { addUserAndLogin, isUserRegistered } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] })
  const [rememberForm, setRememberForm] = useState(false)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const errorAnnouncementRef = useRef<HTMLDivElement>(null)

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include lowercase letter')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include uppercase letter')
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include number')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('Include special character')
    }

    return { score, feedback }
  }

  // Phone number formatter
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '')
    const phoneNumberLength = phoneNumber.length

    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // Enhanced input sanitization with security utilities
  const enhancedSanitizeInput = (value: string, type: 'text' | 'email' | 'phone' | 'name' = 'text'): string => {
    return sanitizeInput(value, type)
  }

  // Initialize rate limiter for form submissions
  const rateLimiter = useRef(new RateLimiter(5, 60000)) // 5 attempts per minute

  // CSRF token management
  const [csrfToken, setCsrfToken] = useState<string>('')
  
  useEffect(() => {
    if (isOpen) {
      // Generate CSRF token when modal opens
      const token = CSRFProtection.generateToken()
      setCsrfToken(token)
    }
  }, [isOpen])

  // Legacy rate limiting check (now using RateLimiter class)
  // const checkRateLimit = (): boolean => {
  //   const now = Date.now()
  //   const timeSinceLastSubmission = now - lastSubmissionTime
    
  //   if (timeSinceLastSubmission < 2000) { // 2 seconds cooldown
  //     return false
  //   }
    
  //   if (submissionCount >= 5 && timeSinceLastSubmission < 60000) { // 5 attempts per minute
  //     return false
  //   }
    
  //   return true
  // }

  // Show toast function
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    
    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value

    // Apply field-specific processing with enhanced security
    if (field === 'phone') {
      processedValue = formatPhoneNumber(enhancedSanitizeInput(value, 'phone'))
    } else if (field === 'email') {
      processedValue = enhancedSanitizeInput(value, 'email')
    } else if (field === 'firstName' || field === 'lastName') {
      processedValue = enhancedSanitizeInput(value, 'name')
    } else {
      processedValue = enhancedSanitizeInput(value, 'text')
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
    
    // Real-time password strength check (keep this for better UX)
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(processedValue))
    }
    
    // Clear error when user starts typing (keep this for better UX)
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Remove blur validation - validation only happens on submit
  const handleInputBlur = () => {
    // No validation on blur - only on submit
  }

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }

    // Validate each field and collect errors
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof FormData
      switch (field) {
        case 'firstName':
          if (!value.trim()) {
            newErrors.firstName = 'First Name is required'
          } else if (value.length < 2) {
            newErrors.firstName = 'First Name must be at least 2 characters'
          } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            newErrors.firstName = 'First Name can only contain letters and spaces'
          }
          break
        case 'lastName':
          if (!value.trim()) {
            newErrors.lastName = 'Last Name is required'
          } else if (value.length < 2) {
            newErrors.lastName = 'Last Name must be at least 2 characters'
          } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            newErrors.lastName = 'Last Name can only contain letters and spaces'
          }
          break
        case 'email':
          if (!value.trim()) {
            newErrors.email = 'Email is required'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = 'Please enter a valid email address'
          }
          break
        case 'phone':
          if (!value.trim()) {
            newErrors.phone = 'Phone is required'
          } else if (value.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Please enter a valid phone number'
          }
          break
        case 'password':
          if (!value.trim()) {
            newErrors.password = 'Password is required'
          } else if (value.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
          } else if (passwordStrength.score < 3) {
            newErrors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and special characters'
          }
          break
        case 'confirmPassword':
          if (!value.trim()) {
            newErrors.confirmPassword = 'Confirm Password is required'
          } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match'
          }
          break
      }
    })

    // Set the errors
    setErrors(newErrors)
    
    // Return true if no errors, false if there are errors
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSignup = async () => {
    // Enhanced rate limiting check using RateLimiter class
    const clientId = `signup_${formData.email || 'anonymous'}`
    if (rateLimiter.current.isRateLimited(clientId)) {
      const remaining = rateLimiter.current.getRemainingAttempts(clientId)
      const errorMessage = remaining === 0 
        ? 'Too many signup attempts. Please wait 1 minute before trying again.'
        : `Please wait before trying again. ${remaining} attempts remaining.`
      
      showToastMessage(errorMessage, 'error')
      return
    }

    // CSRF token validation
    if (!CSRFProtection.validateToken(csrfToken)) {
      showToastMessage('Security token invalid. Please refresh and try again.', 'error')
      return
    }

    if (!validateForm()) {
      // Announce errors to screen readers
      if (errorAnnouncementRef.current) {
        errorAnnouncementRef.current.textContent = 'Form has validation errors. Please check all fields.'
      }
      showToastMessage('Please fix the validation errors before submitting.', 'error')
      return
    }

    setIsSubmitting(true)
    // Legacy submission tracking removed - now using RateLimiter class

    try {
      // Check if email already exists using shared context
      if (isUserRegistered(formData.email)) {
        showToastMessage('An account with this email already exists.', 'error')
        return
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create new user data
      const newUser: UserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''), // Store clean phone number
        createdAt: new Date().toISOString()
      }

      // Save to shared context and log the user in atomically
      addUserAndLogin(newUser)
      
      // Show success toast and close modal
      showToastMessage('Account created successfully! Welcome to EdgeAi.', 'success')
      
      // Close modal immediately after successful signup
      setTimeout(() => {
        onClose()
      }, 100)
      
      // Save form data if "remember form" is checked
      if (rememberForm) {
        localStorage.setItem('signupFormData', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        }))
      }

      // Auto-close after success message
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch {
      showToastMessage('Something went wrong. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = () => {
    // Handle Google signup logic here
    console.log('Google signup clicked')
    showToastMessage('Google signup feature coming soon!', 'error')
  }

  const handleClose = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })
    setShowSuccess(false)
    setIsSubmitting(false)
    setPasswordStrength({ score: 0, feedback: [] })
    setRememberForm(false)
    onClose()
  }, [onClose])

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose()
        }
        
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('signupFormData')
    if (savedData && !isOpen) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsedData }))
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right-2">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            toastType === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {toastType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div 
          ref={modalRef}
          className="bg-white rounded-[12px] md:px-[55px] px-4 pt-10 pb-10 max-w-[820px] w-full max-h-[726px] flex flex-col relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
          aria-describedby="signup-modal-description"
        >
          {/* Screen reader announcements */}
          <div 
            ref={errorAnnouncementRef}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          />
          <button
              onClick={handleClose}
              className="cursor-pointer md:ml-4 md:absolute md:top-[30px] md:right-[30px] absolute top-[20px] right-[20px]"
              aria-label="Close signup modal"
            >
              <svg width="24" height="24" className="md:w-6 md:h-6 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          </button>
          
          {/* Success Message */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white rounded-[12px] flex items-center justify-center z-10">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Account Created Successfully!</h3>
                <p className="text-gray-600">Welcome to EdgeAi. You can now start creating amazing videos.</p>
              </div>
            </div>
          )}

          {/* Modal Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex-1">
              <h3 id="signup-modal-title" className="md:text-[48px] text-[25px] font-semibold text-[#282828] text-center">
                Welcome to <span className="text-[#5046E5]">EdgeAi</span>
              </h3>
              <p id="signup-modal-description" className="text-[#667085] text-[16px] text-center mt-2">
                Please enter your details to create your <br className="hidden md:block" /> account and make videos seamlessly.
              </p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="pt-7 overflow-y-auto flex-1 px-2">
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
              {/* CSRF Token (hidden) */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
              {/* Form Fields - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                {/* First Name */}
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    First Name
                  </label>
                  <input
                    ref={firstInputRef}
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter First Name"
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    aria-invalid={!!errors.firstName}
                    className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                      errors.firstName ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="w-full">
                  <label htmlFor="lastName" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter Last Name"
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    aria-invalid={!!errors.lastName}
                    className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                      errors.lastName ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="w-full">
                  <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter Email"
                    className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                      errors.email ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="w-full">
                  <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter Phone"
                    className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                      errors.phone ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="w-full relative">
                  <label htmlFor="password" className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={handleInputBlur}
                      placeholder="**********"
                      aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                      aria-invalid={!!errors.password}
                      className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${
                        errors.password ? 'ring-2 ring-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-[#98A2B3]" /> : <Eye className="w-5 h-5 text-[#98A2B3]" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div id="password-strength" className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">Password strength:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full ${
                                level <= passwordStrength.score
                                  ? passwordStrength.score >= 4
                                    ? 'bg-green-500'
                                    : passwordStrength.score >= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="text-xs text-gray-600 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="w-full relative">
                  <label className="block text-base font-normal text-[#5F5F5F] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={handleInputBlur}
                      placeholder="**********"
                      className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${
                        errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-[#98A2B3]" /> : <Eye className="w-5 h-5 text-[#98A2B3]" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 transition-colors duration-300 cursor-pointer mb-6 flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                    : 'bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5]'
                }`}
                aria-describedby={isSubmitting ? 'submitting-status' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
              
              {isSubmitting && (
                <div id="submitting-status" className="sr-only" aria-live="polite">
                  Creating your account, please wait...
                </div>
              )}

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-[220px] mx-auto bg-white text-[#344054] py-[9.2px] px-2 rounded-full font-normal text-[16px] border border-[#D0D5DD] hover:bg-[#D0D5DD] transition-colors duration-300 cursor-pointer flex items-center justify-center gap-x-3"
              >
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_7697_226)">
                  <path d="M24.2663 12.2764C24.2663 11.4607 24.2001 10.6406 24.059 9.83807H12.7402V14.4591H19.222C18.953 15.9494 18.0888 17.2678 16.8233 18.1056V21.1039H20.6903C22.9611 19.0139 24.2663 15.9274 24.2663 12.2764Z" fill="#4285F4"/>
                  <path d="M12.7401 24.0008C15.9766 24.0008 18.7059 22.9382 20.6945 21.1039L16.8276 18.1055C15.7517 18.8375 14.3627 19.252 12.7445 19.252C9.61388 19.252 6.95946 17.1399 6.00705 14.3003H2.0166V17.3912C4.05371 21.4434 8.2029 24.0008 12.7401 24.0008Z" fill="#34A853"/>
                  <path d="M6.00277 14.3003C5.50011 12.8099 5.50011 11.1961 6.00277 9.70575V6.61481H2.01674C0.314734 10.0056 0.314734 14.0004 2.01674 17.3912L6.00277 14.3003Z" fill="#FBBC04"/>
                  <path d="M12.7401 4.74966C14.4509 4.7232 16.1044 5.36697 17.3434 6.54867L20.7695 3.12262C18.6001 1.0855 15.7208 -0.034466 12.7401 0.000808666C8.2029 0.000808666 4.05371 2.55822 2.0166 6.61481L6.00264 9.70575C6.95064 6.86173 9.60947 4.74966 12.7401 4.74966Z" fill="#EA4335"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_7697_226">
                  <rect width="24" height="24" fill="white" transform="translate(0.5)"/>
                  </clipPath>
                  </defs>
                </svg>

                Sign up with Google
              </button>

              {/* Footer Link */}
              <div className="text-center mt-6">
                <p className="text-[#101828] text-base font-normal">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-[#5046E5] text-[14px] font-semibold hover:underline cursor-pointer"
                    onClick={() => {
                      // Close signup modal and open signin modal
                      onClose()
                      onOpenSignin?.()
                    }}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
