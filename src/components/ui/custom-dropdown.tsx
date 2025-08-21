'use client'

import { useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { IoMdArrowDropdown } from "react-icons/io"
import { cn } from '@/lib/utils'

interface DropdownOption {
  value: string
  label: string
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
  error?: string
  id?: string
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  id,
  isOpen,
  onToggle,
  className
}: CustomDropdownProps) {
  const selectedOption = options.find(option => option.value === value)
  const hasError = !!error

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-base font-normal text-[#5F5F5F] mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white flex items-center justify-between cursor-pointer ${
            hasError ? 'ring-2 ring-red-500' : ''
          } ${selectedOption ? 'text-gray-800' : 'text-[#11101066]'}`}
          aria-describedby={hasError ? `${id}-error` : undefined}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <IoMdArrowDropdown 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors duration-200 flex items-center justify-between text-[#282828] cursor-pointer"
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-[#5046E5]" />
                )}
              </button>
            ))}
          </div>
        )}
        
        {hasError && (
          <p id={`${id}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
