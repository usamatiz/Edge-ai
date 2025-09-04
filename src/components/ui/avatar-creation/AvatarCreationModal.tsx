'use client'

import { useState } from 'react'
// import { X } from 'lucide-react' // Removed unused import
import Step2ChooseType from './steps/Step2ChooseType'
import Step4WebcamRecord from './steps/Step4WebcamRecord'
import Step5QRCode from './steps/Step5QRCode'
import Step6PhotoInstructions from './steps/Step6PhotoInstructions'
import Step7PhotoUpload from './steps/Step7PhotoUpload'
import Step8Details from './steps/Step8Details'
import Step9AvatarReady from './steps/Step9AvatarReady'
import Step1Intro from './steps/Step1Intro'
import Step3VideoUpload from './steps/Step3VideoUpload'

export type AvatarType = 'digital-twin' | 'photo-avatar'

interface AvatarCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AvatarCreationModal({ isOpen, onClose }: AvatarCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAvatarType, setSelectedAvatarType] = useState<AvatarType | null>(null)
  const [avatarData, setAvatarData] = useState({
    name: '',
    age: '',
    gender: '',
    ethnicity: '',
    videoFile: null as File | null,
    photoFiles: [] as File[],
    avatarType: null as AvatarType | null
  })

  const handleNext = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handleSkipToDetails = () => {
    // For digital-twin: Skip to step 6 (Avatar Details)
    // This skips step 4 (WebcamRecord) and step 5 (QRCode)
    if (selectedAvatarType === 'digital-twin') {
      setCurrentStep(6)
    }
  }

  const handleSkipBackToUpload = () => {
    // Skip back to step 3 (Upload options)
    // This skips step 4 (WebcamRecord) and step 5 (QRCode) when going backward
    setCurrentStep(3)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleAvatarTypeSelect = (type: AvatarType) => {
    setSelectedAvatarType(type)
    setAvatarData(prev => ({ ...prev, avatarType: type }))
    // Don't auto-advance - user needs to click Next
  }

  const handleAvatarTypeNext = () => {
    if (selectedAvatarType) {
      handleNext()
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedAvatarType(null)
    setAvatarData({
      name: '',
      age: '',
      gender: '',
      ethnicity: '',
      videoFile: null,
      photoFiles: [],
      avatarType: null
    })
    onClose()
  }

  // Helper function to check if current step needs narrow width (Step6PhotoInstructions, Step7PhotoUpload, Step8Details, or Step9AvatarReady)
  const isNarrowWidth = () => {
    return (currentStep === 3 && selectedAvatarType === 'photo-avatar') ||   // Step6PhotoInstructions for photo-avatar
           (currentStep === 4 && selectedAvatarType === 'photo-avatar') ||   // Step7PhotoUpload for photo-avatar
           (currentStep === 5 && selectedAvatarType === 'photo-avatar') ||   // Step8Details for photo-avatar
           (currentStep === 6 && selectedAvatarType === 'digital-twin') ||    // Step8Details for digital-twin
           (currentStep === 6 && selectedAvatarType === 'photo-avatar') ||    // Step9AvatarReady for photo-avatar
           (currentStep === 7 && selectedAvatarType === 'digital-twin')       // Step9AvatarReady for digital-twin
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Intro onNext={handleNext} />
      
      case 2:
        return <Step2ChooseType 
          onAvatarTypeSelect={handleAvatarTypeSelect} 
          onAvatarTypeNext={handleAvatarTypeNext}
          selectedType={selectedAvatarType}
        />
      
      case 3:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <Step3VideoUpload 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
              onSkipToDetails={handleSkipToDetails}
            />
          )
        } else {
          return (
            <Step6PhotoInstructions 
              onNext={handleNext}
              onBack={handleBack}
            />
          )
        }
      
      case 4:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <Step4WebcamRecord 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
            />
          )
        } else {
          return (
            <Step7PhotoUpload 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
            />
          )
        }
      
      case 5:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <Step5QRCode 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
            />
          )
        } else {
          return (
            <Step8Details 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
            />
          )
        }
      
      case 6:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <Step8Details 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
              onSkipBackToUpload={handleSkipBackToUpload}
            />
          )
        } else {
          return (
            <Step9AvatarReady 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
            />
          )
        }
      
      case 7:
        if (selectedAvatarType === 'digital-twin') {
          return (
            <Step9AvatarReady 
              onNext={handleNext}
              onBack={handleBack}
              avatarData={avatarData}
              setAvatarData={setAvatarData}
            />
          )
        }
        break
      
      default:
        return <Step1Intro onNext={handleNext} />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3">
      <div className={`bg-white rounded-[12px] md:px-8 px-4 md:pb-8 pb-4 md:pt-6 pt-4 ${isNarrowWidth() ? 'max-w-[760px]' : 'max-w-[1100px]'} w-full max-h-[840px] h-full flex flex-col relative ${selectedAvatarType === 'digital-twin' ? 'avatar-dropdown-shadow' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="md:text-[32px] text-[24px] font-semibold text-[#282828]">Create Avatar</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer"
            aria-label="Close avatar creation modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 1.5L1.5 22.5M1.5 1.5L22.5 22.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
