'use client'

import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { sanitizeInput } from '@/lib/utils'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface ProfileFormErrors {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface ProfileInfoSectionProps {
  data: ProfileFormData
  errors: ProfileFormErrors
  onChange: (field: keyof ProfileFormData, value: string) => void
}

export default function ProfileInfoSection({ data, errors, onChange }: ProfileInfoSectionProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    let processedValue = value
    
    // Apply field-specific processing with enhanced security
    if (field === 'phone') {
      const phoneNumber = value.replace(/\D/g, '')
      const phoneNumberLength = phoneNumber.length
      if (phoneNumberLength < 4) processedValue = phoneNumber
      else if (phoneNumberLength < 7) {
        processedValue = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
      } else {
        processedValue = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
      }
    } else if (field === 'email') {
      processedValue = sanitizeInput(value, 'email')
    } else if (field === 'firstName' || field === 'lastName') {
      processedValue = sanitizeInput(value, 'name')
    } else {
      processedValue = sanitizeInput(value, 'text')
    }

    onChange(field, processedValue)
  }

  return (
    <div className="">
      <h1 className="text-[32px] font-semibold text-[#282828] text-center mb-8">
        Profile Info
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="w-full">
          <label htmlFor="firstName" className="block text-base font-normal text-[#5F5F5F] mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={data.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
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
            value={data.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
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
          <label htmlFor="email" className="block text-base font-normal text-[#5F5F5F] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter Email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
              errors.email ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="w-full">
          <label htmlFor="phone" className="block text-base font-normal text-[#5F5F5F] mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter Phone"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone}
            className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
              errors.phone ? 'ring-2 ring-red-500' : ''
            }`}
          />
          {errors.phone && (
            <p id="phone-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="w-full mt-6">
        <label htmlFor="password" className="block text-base font-normal text-[#5F5F5F] mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="**********"
            aria-describedby={errors.password ? 'password-error' : undefined}
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
        {errors.password && (
          <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.password}
          </p>
        )}
      </div>
    </div>
  )
}
