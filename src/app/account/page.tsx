'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileInfoSection, PaymentDetailsSection } from '@/components/ui'

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
  const { currentUser } = useAuth()
  
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

  const handleProfileInputChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    // Handle form submission here
  }

  return (
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
          />

          {/* Payment Details Section */}
          <PaymentDetailsSection
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
          />

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
      </div>
    </div>
  )
}