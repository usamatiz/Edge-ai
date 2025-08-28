'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateUser } from '@/store/slices/userSlice'
import { ProfileInfoSection, PaymentDetailsSection } from '@/components/ui'
import ProtectedRoute from '@/components/features/auth/ProtectedRoute'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface PaymentFormData {
  cardNumber: string
  expiration: string
  cvc: string
  country: string
}

interface FormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  cardNumber: string
  expiration: string
  cvc: string
  country: string
}

export default function AccountPage() {
  const { user: currentUser } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: ''
  })
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiration: '',
    cvc: '',
    country: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    cardNumber: '',
    expiration: '',
    cvc: '',
    country: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // Phone number formatter - same as signup modal and profile info section
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '')
    const phoneNumberLength = phoneNumber.length

    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // Synchronize profile data with Redux store
  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: formatPhoneNumber(currentUser.phone || '')
      }))
    }
  }, [currentUser])

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    
    // Auto hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }

  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {
    // Only allow changes to firstName, lastName, and phone
    if (field === 'email' || field === 'password') {
      return
    }
    
    let processedValue = value
    
    // Apply phone number formatting if it's the phone field
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value)
    }
    
    setProfileData(prev => ({
      ...prev,
      [field]: processedValue
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handlePaymentInputChange = (field: keyof PaymentFormData, value: string) => {
    setPaymentData(prev => ({
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

  const handleDropdownToggle = (field: string) => {
    const isOpen = openDropdown === field
    setOpenDropdown(isOpen ? null : field)
  }

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      cardNumber: '',
      expiration: '',
      cvc: '',
      country: ''
    }

    // Validate firstName
    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    // Validate lastName
    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Validate phone (optional but if provided, should be valid)
    // Use the same format as signup modal: (XXX) XXX-XXXX
    if (profileData.phone.trim() && !/^\(\d{3}\) \d{3}-\d{4}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number in format (XXX) XXX-XXXX'
    }

    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Call the update profile API
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone.replace(/\D/g, '') // Store clean phone number
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update Redux store with new user data
        dispatch(updateUser(data.data.user))
        
        // Show success toast
        showToastMessage('Profile updated successfully!', 'success')
        
        // Update local state to reflect changes
        setProfileData(prev => ({
          ...prev,
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          phone: formatPhoneNumber(data.data.user.phone)
        }))
      } else {
        // Handle errors
        showToastMessage(data.message || 'Failed to update profile. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToastMessage('Something went wrong. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-8 xl:px-0 px-3">
        <div className="max-w-[870px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Info Section */}
            <ProfileInfoSection
              data={profileData}
              errors={{
                firstName: errors.firstName,
                lastName: errors.lastName,
                email: errors.email,
                phone: errors.phone,
                password: errors.password
              }}
              onChange={handleProfileInputChange}
              isEmailVerified={currentUser?.isEmailVerified || false}
            />

            {/* Payment Details Section */}
            {/* <PaymentDetailsSection
              data={paymentData}
              errors={{
                cardNumber: errors.cardNumber,
                expiration: errors.expiration,
                cvc: errors.cvc,
                country: errors.country
              }}
              onChange={handlePaymentInputChange}
              openDropdown={openDropdown}
              onDropdownToggle={handleDropdownToggle}
            /> */}

            {/* Update Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-[11.4px] px-16 rounded-full font-semibold text-[20px] border-2 transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                    : 'bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Detail'
                )}
              </button>
            </div>
          </form>

          {/* Click outside to close dropdowns */}
          {openDropdown && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setOpenDropdown(null)}
            />
          )}

          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2">
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
        </div>
      </div>
    </ProtectedRoute>
  )
}