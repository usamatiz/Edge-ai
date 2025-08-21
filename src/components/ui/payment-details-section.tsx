'use client'

import { useState } from 'react'
import { Eye, AlertCircle } from 'lucide-react'
import CustomDropdown from './custom-dropdown'

interface PaymentFormData {
  cardNumber: string
  expiration: string
  cvc: string
  country: string
}

interface PaymentFormErrors {
  cardNumber: string
  expiration: string
  cvc: string
  country: string
}

interface PaymentDetailsSectionProps {
  data: PaymentFormData
  errors: PaymentFormErrors
  onChange: (field: keyof PaymentFormData, value: string) => void
  openDropdown: string | null
  onDropdownToggle: (field: string) => void
}

// Country options
const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'JP', label: 'Japan' },
  { value: 'IN', label: 'India' }
]

export default function PaymentDetailsSection({ 
  data, 
  errors, 
  onChange, 
  openDropdown, 
  onDropdownToggle 
}: PaymentDetailsSectionProps) {
  const [activePaymentMethod, setActivePaymentMethod] = useState('card')

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let processedValue = value
    
    if (field === 'cardNumber') {
      // Format card number with spaces
      const cleaned = value.replace(/\D/g, '')
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
      processedValue = formatted.substring(0, 19) // Limit to 16 digits + 3 spaces
    } else if (field === 'expiration') {
      // Format as MM / YY
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length >= 2) {
        processedValue = cleaned.substring(0, 2) + (cleaned.length > 2 ? ' / ' + cleaned.substring(2, 4) : '')
      } else {
        processedValue = cleaned
      }
    } else if (field === 'cvc') {
      processedValue = value.replace(/\D/g, '').substring(0, 4)
    } else {
      processedValue = value
    }

    onChange(field, processedValue)
  }

  return (
    <div className='mt-14'>
      <h2 className="text-[32px] font-semibold text-[#282828] text-center mb-5">
        Payment Details
      </h2>
      
      {/* Payment Method Selection */}
      <div className="flex md:flex-row flex-col flex-wrap gap-4 mb-6">
        <button
          type="button"
          onClick={() => setActivePaymentMethod('card')}
          className={`flex-1 flex flex-col text-[14px] md:items-start items-center hover:border-[#0270DE] hover:bg-blue-50 hover:text-[#0270DE] cursor-pointer justify-center gap-1 px-2 py-[8.4px] md:max-w-[140px] max-w-full rounded-[8px] border-2 transition-colors duration-200 font-normal ${
            activePaymentMethod === 'card'
              ? 'border-[#0270DE] bg-blue-50'
              : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
        <div className="w-6 h-4 bg-[#0270DE] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">💳</span>
          </div>
          <span className={`font-medium ${activePaymentMethod === 'card' ? 'text-[#0270DE]' : 'text-gray-700'}`}>Card</span>
        </button>
        
        <button
          type="button"
          onClick={() => setActivePaymentMethod('googlepay')}
          className={`flex-1 flex flex-col text-[14px] md:items-start items-center hover:border-[#0270DE] hover:bg-blue-50 hover:text-[#0270DE] cursor-pointer justify-center gap-1 px-2 py-[9.9px] max-w-full md:max-w-[140px] rounded-[8px] border-2 transition-colors duration-200 font-normal ${
            activePaymentMethod === 'googlepay'
              ? 'border-[#0270DE] bg-blue-50'
              : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          <svg width="30" height="16" viewBox="0 0 30 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.021 0H7.98C3.59 0 0 3.6 0 8C0 12.4 3.59 16 7.979 16H22.02C26.41 16 30 12.4 30 8C30 3.6 26.41 0 22.021 0Z" fill="white"/>
<path d="M22.021 0.648C23.007 0.648 23.964 0.844 24.866 1.228C26.6278 1.97906 28.0294 3.38432 28.776 5.148C29.158 6.052 29.354 7.012 29.354 8C29.354 8.988 29.158 9.948 28.775 10.852C28.0265 12.6144 26.6255 14.019 24.865 14.772C23.965 15.156 23.007 15.352 22.021 15.352H7.98C7.00218 15.3533 6.03428 15.156 5.135 14.772C3.37323 14.0209 1.97155 12.6157 1.225 10.852C0.842201 9.94997 0.645601 8.97989 0.647 8C0.647 7.012 0.843 6.052 1.226 5.148C1.97449 3.38562 3.37554 1.98099 5.136 1.228C6.03497 0.844167 7.00251 0.646849 7.98 0.648H22.02H22.021ZM22.021 0H7.98C3.59 0 0 3.6 0 8C0 12.4 3.59 16 7.979 16H22.02C26.41 16 30 12.4 30 8C30 3.6 26.41 0 22.021 0Z" fill="#3C4043"/>
<path d="M14.306 8.56772V10.9877H13.54V5.01172H15.57C16.085 5.01172 16.524 5.18372 16.883 5.52772C17.25 5.87172 17.433 6.29172 17.433 6.78772C17.433 7.29572 17.25 7.71572 16.883 8.05572C16.528 8.39572 16.089 8.56372 15.57 8.56372H14.306V8.56772ZM14.306 5.74772V7.83172H15.586C15.89 7.83172 16.145 7.72772 16.344 7.52372C16.548 7.31972 16.651 7.07172 16.651 6.79172C16.6516 6.65654 16.6246 6.52266 16.5719 6.39821C16.5191 6.27375 16.4416 6.16131 16.344 6.06772C16.2476 5.96398 16.13 5.8821 15.9993 5.8276C15.8685 5.77309 15.7276 5.74722 15.586 5.75172H14.306V5.74772ZM19.436 6.76372C20.003 6.76372 20.45 6.91572 20.776 7.21972C21.104 7.52372 21.267 7.93972 21.267 8.46772V10.9877H20.537V10.4197H20.505C20.19 10.8877 19.767 11.1197 19.241 11.1197C18.79 11.1197 18.415 10.9877 18.111 10.7197C17.9659 10.5972 17.8498 10.4439 17.7712 10.2709C17.6927 10.098 17.6537 9.90966 17.657 9.71972C17.657 9.29572 17.817 8.95972 18.136 8.71172C18.455 8.45972 18.882 8.33572 19.412 8.33572C19.867 8.33572 20.242 8.41972 20.533 8.58772V8.41172C20.5343 8.2821 20.5067 8.15382 20.4522 8.0362C20.3977 7.91858 20.3177 7.81457 20.218 7.73172C20.0152 7.54766 19.7499 7.44758 19.476 7.45172C19.049 7.45172 18.71 7.63172 18.463 7.99572L17.789 7.57172C18.159 7.03172 18.71 6.76372 19.436 6.76372ZM18.446 9.73172C18.446 9.93172 18.531 10.0997 18.702 10.2317C18.87 10.3637 19.069 10.4317 19.297 10.4317C19.62 10.4317 19.907 10.3117 20.158 10.0717C20.41 9.83172 20.538 9.55172 20.538 9.22772C20.298 9.03972 19.967 8.94372 19.54 8.94372C19.229 8.94372 18.97 9.01972 18.762 9.16772C18.551 9.32372 18.447 9.51172 18.447 9.73172H18.446ZM25.432 6.89572L22.879 12.7837H22.089L23.039 10.7237L21.355 6.89572H22.189L23.4 9.83172H23.416L24.597 6.89572H25.431H25.432Z" fill="#3C4043"/>
<path d="M11.2599 8.08035C11.2599 7.83035 11.2369 7.59035 11.1949 7.36035H7.98486V8.68035H9.83386C9.75886 9.12035 9.51686 9.49435 9.14786 9.74335V10.6004H10.2479C10.8909 10.0034 11.2589 9.12235 11.2589 8.08035H11.2599Z" fill="#4285F4"/>
<path d="M9.14915 9.74323C8.84315 9.95023 8.44815 10.0722 7.98615 10.0722C7.09515 10.0722 6.33815 9.46923 6.06815 8.65723H4.93115V9.54023C5.21489 10.1073 5.65083 10.5842 6.19019 10.9177C6.72955 11.2511 7.35105 11.4279 7.98515 11.4282C8.90915 11.4282 9.68515 11.1232 10.2482 10.5992L9.14815 9.74323H9.14915Z" fill="#34A853"/>
<path d="M5.9599 8.00189C5.9599 7.77389 5.9979 7.55389 6.0669 7.34589V6.46289H4.9299C4.6902 6.94044 4.56587 7.46756 4.5669 8.00189C4.5669 8.55589 4.6979 9.07789 4.9299 9.54089L6.0659 8.65789C5.99515 8.44641 5.95902 8.22489 5.9589 8.00189H5.9599Z" fill="#FABB05"/>
<path d="M7.98613 5.93239C8.49013 5.93239 8.94113 6.10639 9.29813 6.44639L10.2731 5.46939C9.65521 4.88678 8.83534 4.56665 7.98613 4.57639C7.35213 4.57663 6.7307 4.75326 6.19135 5.08651C5.65201 5.41976 5.21601 5.8965 4.93213 6.46339L6.06713 7.34639C6.33813 6.53439 7.09513 5.93239 7.98713 5.93239H7.98613Z" fill="#E94235"/>
</svg>

          <span className={`font-medium ${activePaymentMethod === 'googlepay' ? 'text-[#0270DE]' : 'text-gray-700'}`}>Google Pay</span>
        </button>
        
        <button
          type="button"
          onClick={() => setActivePaymentMethod('bank')}
          className={`flex-1 flex flex-col text-[14px] md:items-start items-center hover:border-[#0270DE] hover:bg-blue-50 hover:text-[#0270DE] cursor-pointer justify-center gap-1 px-2 py-[8.4px] max-w-full md:max-w-[140px] rounded-[8px] border-2 transition-colors duration-200 font-normal${
            activePaymentMethod === 'bank'
              ? 'border-[#0270DE] bg-blue-50'
              : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4.99983 7.5V14H6.49983V7.5H9.49983V14H10.9998V7.5H13.9998V14H14.9998C15.265 14 15.5194 14.1054 15.7069 14.2929C15.8945 14.4804 15.9998 14.7348 15.9998 15V16H-0.000174466V15C-0.000174466 14.7348 0.105182 14.4804 0.292719 14.2929C0.480255 14.1054 0.734609 14 0.999825 14H1.99983V7.5H4.99983ZM7.99983 0C12.6808 2.572 15.1808 3.95 15.4998 4.134C15.692 4.24488 15.8419 4.41655 15.9258 4.62197C16.0098 4.82739 16.023 5.05489 15.9634 5.26865C15.9039 5.48241 15.7749 5.67028 15.5968 5.80269C15.4187 5.93509 15.2017 6.00451 14.9798 6H1.01983C0.797967 6.00451 0.58091 5.93509 0.402836 5.80269C0.224761 5.67028 0.095785 5.48241 0.0362163 5.26865C-0.0233523 5.05489 -0.0101292 4.82739 0.0738035 4.62197C0.157736 4.41655 0.30761 4.24488 0.499826 4.134C0.819826 3.95 3.31983 2.572 7.99983 0Z" fill="#6D6E78"/>
</svg>

          <span className={`font-medium ${activePaymentMethod === 'bank' ? 'text-[#0270DE]' : 'text-gray-700'}`}>US bank account</span>
        </button>
        
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-3 px-2 py-[8.4px] max-w-full md:max-w-[140px] rounded-[8px] border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-[14px]"
        >
          <span className="text-gray-400 text-xl">⋯</span>
        </button>
      </div>

      {/* Card Details Form */}
      {activePaymentMethod === 'card' && (
        <div className="space-y-6">
          {/* Card Number */}
          <div className="w-full">
            <label htmlFor="cardNumber" className="block text-base font-normal text-[#5F5F5F] mb-1">
              Card number
            </label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                value={data.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 1234 1234 1234"
                className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-16 ${
                  errors.cardNumber ? 'ring-2 ring-red-500' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22 0H2C0.89543 0 0 0.89543 0 2V14C0 15.1046 0.89543 16 2 16H22C23.1046 16 24 15.1046 24 14V2C24 0.89543 23.1046 0 22 0Z" fill="#252525"/>
<path d="M9 13C11.7614 13 14 10.7614 14 8C14 5.23858 11.7614 3 9 3C6.23858 3 4 5.23858 4 8C4 10.7614 6.23858 13 9 13Z" fill="#EB001B"/>
<path d="M15 13C17.7614 13 20 10.7614 20 8C20 5.23858 17.7614 3 15 3C12.2386 3 10 5.23858 10 8C10 10.7614 12.2386 13 15 13Z" fill="#F79E1B"/>
<path fillRule="evenodd" clipRule="evenodd" d="M12 4C13.2144 4.91221 14 6.36455 14 8.00037C14 9.63618 13.2144 11.0885 12 12.0007C10.7856 11.0885 10 9.63618 10 8.00037C10 6.36455 10.7856 4.91221 12 4Z" fill="#FF5F00"/>
</svg>

<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_7807_547)">
<path d="M21.75 0.25H2.25C1.14543 0.25 0.25 1.14543 0.25 2.25V13.75C0.25 14.8546 1.14543 15.75 2.25 15.75H21.75C22.8546 15.75 23.75 14.8546 23.75 13.75V2.25C23.75 1.14543 22.8546 0.25 21.75 0.25Z" fill="white" stroke="black" strokeOpacity="0.2" strokeWidth="0.5"/>
<path d="M2.78773 5.91444C2.26459 5.62751 1.66754 5.39674 1 5.23659L1.028 5.11188H3.76498C4.13596 5.12489 4.43699 5.23651 4.53495 5.63071L5.12977 8.46659L5.31198 9.32073L6.97797 5.11188H8.77679L6.10288 11.2775H4.30397L2.78773 5.91444ZM10.1 11.2841H8.39883L9.46285 5.11188H11.1639L10.1 11.2841ZM16.2668 5.26277L16.0354 6.59559L15.8816 6.53004C15.5737 6.40525 15.1674 6.28054 14.6144 6.29371C13.9427 6.29371 13.6415 6.56277 13.6345 6.82546C13.6345 7.11441 13.9989 7.30484 14.5939 7.58725C15.574 8.02719 16.0286 8.56557 16.0218 9.26819C16.0081 10.5486 14.846 11.3761 13.0611 11.3761C12.2979 11.3694 11.5628 11.2181 11.1638 11.0476L11.4019 9.66205L11.6259 9.76066C12.1789 9.99071 12.5428 10.089 13.222 10.089C13.7118 10.089 14.2369 9.89838 14.2436 9.48488C14.2436 9.21565 14.0199 9.01851 13.3617 8.71646C12.7178 8.42087 11.8568 7.92848 11.8708 7.04198C11.8781 5.84042 13.0611 5 14.741 5C15.399 5 15.9312 5.13789 16.2668 5.26277ZM18.5278 9.09749H19.9417C19.8718 8.78889 19.5496 7.31147 19.5496 7.31147L19.4307 6.77964C19.3467 7.00943 19.1999 7.38373 19.2069 7.37056C19.2069 7.37056 18.6678 8.7429 18.5278 9.09749ZM20.6276 5.11188L22 11.284H20.4249C20.4249 11.284 20.2708 10.5748 20.2219 10.3581H18.0378C17.9746 10.5222 17.6808 11.284 17.6808 11.284H15.8958L18.4226 5.62399C18.5977 5.22342 18.906 5.11188 19.3118 5.11188H20.6276Z" fill="#1434CB"/>
</g>
<defs>
<clipPath id="clip0_7807_547">
<rect width="24" height="16" fill="white"/>
</clipPath>
</defs>
</svg>

<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_7807_555)">
<path d="M22 0H2C0.89543 0 0 0.89543 0 2V14C0 15.1046 0.89543 16 2 16H22C23.1046 16 24 15.1046 24 14V2C24 0.89543 23.1046 0 22 0Z" fill="#016FD0"/>
<path fillRule="evenodd" clipRule="evenodd" d="M13.7642 13.3938V7.69238L23.9117 7.70149V9.27638L22.7388 10.5298L23.9117 11.7947V13.403H22.0391L21.0439 12.3048L20.0558 13.4071L13.7642 13.3938Z" fill="#FFFFFE"/>
<path fillRule="evenodd" clipRule="evenodd" d="M14.4419 12.7692V8.32031H18.2142V9.3452H15.6633V10.0409H18.1534V11.0487H15.6633V11.732H18.2142V12.7692H14.4419Z" fill="#016FD0"/>
<path fillRule="evenodd" clipRule="evenodd" d="M18.1954 12.7691L20.2827 10.5421L18.1953 8.32031H19.811L21.0865 9.73035L22.3656 8.32031H23.9117V8.35532L21.8689 10.5421L23.9117 12.706V12.7691H22.35L21.0519 11.3449L19.7671 12.7691H18.1954Z" fill="#016FD0"/>
<path fillRule="evenodd" clipRule="evenodd" d="M14.2374 2.63184H16.6834L17.5426 4.58269V2.63184H20.5624L21.0832 4.09341L21.6057 2.63184H23.9116V8.33323H11.7251L14.2374 2.63184Z" fill="#FFFFFE"/>
<path fillRule="evenodd" clipRule="evenodd" d="M14.7006 3.25195L12.7266 7.69712H14.0805L14.4529 6.80696H16.4708L16.843 7.69712H18.2306L16.2648 3.25195H14.7006ZM14.8702 5.80939L15.4622 4.39432L16.0538 5.80939H14.8702Z" fill="#016FD0"/>
<path fillRule="evenodd" clipRule="evenodd" d="M18.2119 7.69606V3.25098L20.115 3.25752L21.0943 5.99025L22.0799 3.25098H23.9115V7.69606L22.7329 7.70649V4.65314L21.6204 7.69606H20.5446L19.4089 4.64271V7.69606H18.2119Z" fill="#016FD0"/>
</g>
<defs>
<clipPath id="clip0_7807_555">
<rect width="24" height="16" fill="white"/>
</clipPath>
</defs>
</svg>

<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_7807_566)">
<path d="M21.9972 15.7499L21.9994 15.7499C22.9545 15.7581 23.7381 14.9773 23.75 14.0042L23.75 2.0063C23.7462 1.53569 23.5589 1.08617 23.2297 0.756802C22.9014 0.428269 22.4589 0.246149 21.9972 0.250071L2.00064 0.250062C1.54109 0.246149 1.09858 0.428269 0.770279 0.756802C0.441145 1.08617 0.253838 1.53569 0.250008 2.00426L0.25 13.9937C0.253838 14.4643 0.441145 14.9138 0.770279 15.2432C1.09858 15.5717 1.54109 15.7538 2.00277 15.7499H21.9972ZM21.9962 16.2499C21.9958 16.2499 21.9955 16.2499 21.9951 16.2499L21.9972 16.2499H21.9962Z" fill="white" stroke="black" strokeOpacity="0.2" strokeWidth="0.5"/>
<path d="M12.6123 16.0002H21.9971C22.5239 16.0046 23.0309 15.7995 23.4065 15.4301C23.7821 15.0607 23.9955 14.5573 23.9999 14.0305V11.6719C20.4561 13.7062 16.6127 15.167 12.6123 16.0002Z" fill="#F27712"/>
<path d="M23.1725 9.29692H22.32L21.3601 8.03072H21.269V9.29692H20.5738V6.15209H21.6C22.4028 6.15209 22.8663 6.48313 22.8663 7.07899C22.8663 7.56727 22.5766 7.88175 22.0552 7.98106L23.1725 9.29692ZM22.1463 7.10382C22.1463 6.79761 21.9145 6.64037 21.4842 6.64037H21.269V7.59209H21.4676C21.9145 7.59209 22.1463 7.42658 22.1463 7.10382ZM18.1407 6.15209H20.1104V6.68175H18.8359V7.3852H20.0607V7.92313H18.8359V8.77554H20.1104V9.3052H18.1407V6.15209ZM15.9063 9.37968L14.4001 6.14382H15.1614L16.1132 8.26244L17.0732 6.14382H17.818L16.2952 9.37968H15.9228H15.9063ZM9.60833 9.37141C8.54902 9.37141 7.72143 8.6514 7.72143 7.71623C7.72143 6.80589 8.56557 6.06934 9.62488 6.06934C9.92281 6.06934 10.1711 6.12727 10.4773 6.25968V6.98796C10.2454 6.76013 9.9334 6.63236 9.60833 6.63209C8.94626 6.63209 8.44143 7.11209 8.44143 7.71623C8.44143 8.35347 8.93798 8.80865 9.64143 8.80865C9.95591 8.80865 10.1959 8.70934 10.4773 8.46106V9.18934C10.1628 9.32175 9.89798 9.37141 9.60833 9.37141ZM7.50626 8.33692C7.50626 8.94934 7.00143 9.37141 6.27315 9.37141C5.7435 9.37141 5.36281 9.18934 5.04005 8.77554L5.49522 8.38658C5.65246 8.66796 5.91729 8.80865 6.24833 8.80865C6.56281 8.80865 6.78626 8.6183 6.78626 8.37003C6.78626 8.22934 6.72005 8.12175 6.57936 8.03899C6.4251 7.96413 6.26446 7.9032 6.09936 7.85692C5.44557 7.65003 5.22212 7.42658 5.22212 6.98796C5.22212 6.47485 5.70212 6.08589 6.33109 6.08589C6.72833 6.08589 7.08419 6.21003 7.38212 6.44175L7.01798 6.85554C6.87366 6.69732 6.66938 6.6072 6.45522 6.60727C6.15729 6.60727 5.94212 6.75623 5.94212 6.95485C5.94212 7.12037 6.06626 7.21141 6.48005 7.35209C7.27453 7.60037 7.50626 7.83209 7.50626 8.3452V8.33692ZM4.08833 6.15209H4.7835V9.3052H4.08833V6.15209ZM1.85384 9.3052H0.827637V6.15209H1.85384C2.97936 6.15209 3.75729 6.79761 3.75729 7.72451C3.75729 8.19623 3.52557 8.64313 3.12005 8.94106C2.77246 9.18934 2.3835 9.3052 1.84557 9.3052H1.85384ZM2.66488 6.9383C2.43315 6.75623 2.16833 6.69003 1.71315 6.69003H1.52281V8.77554H1.71315C2.16005 8.77554 2.44143 8.69278 2.66488 8.52727C2.90488 8.32865 3.04557 8.03072 3.04557 7.72451C3.04557 7.4183 2.90488 7.12865 2.66488 6.9383Z" fill="black"/>
<path d="M12.414 6.06934C11.5036 6.06934 10.7588 6.79761 10.7588 7.69968C10.7588 8.65968 11.4705 9.37968 12.414 9.37968C13.3409 9.37968 14.0691 8.6514 14.0691 7.72451C14.0691 6.79761 13.3491 6.06934 12.414 6.06934Z" fill="#F27712"/>
</g>
<defs>
<clipPath id="clip0_7807_566">
<rect width="24" height="16" fill="white"/>
</clipPath>
</defs>
</svg>

              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expiration */}
            <div className="w-full">
              <label htmlFor="expiration" className="block text-base font-normal text-[#5F5F5F] mb-1">
                Expiration
              </label>
              <input
                id="expiration"
                type="text"
                value={data.expiration}
                onChange={(e) => handleInputChange('expiration', e.target.value)}
                placeholder="MM / YY"
                className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white ${
                  errors.expiration ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.expiration && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.expiration}
                </p>
              )}
            </div>

            {/* CVC */}
            <div className="w-full">
              <label htmlFor="cvc" className="block text-base font-normal text-[#5F5F5F] mb-1">
                CVC
              </label>
              <div className="relative">
                <input
                  id="cvc"
                  type="text"
                  value={data.cvc}
                  onChange={(e) => handleInputChange('cvc', e.target.value)}
                  placeholder="CVC"
                  className={`w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white pr-12 ${
                    errors.cvc ? 'ring-2 ring-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              {errors.cvc && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.cvc}
                </p>
              )}
            </div>
          </div>

          {/* Country */}
          <CustomDropdown
            options={countryOptions}
            value={data.country}
            onChange={(value) => onChange('country', value)}
            placeholder="Select"
            label="Country"
            error={errors.country}
            id="country"
            isOpen={openDropdown === 'country'}
            onToggle={() => onDropdownToggle('country')}
          />
        </div>
      )}

      {/* Google Pay Content */}
      {activePaymentMethod === 'googlepay' && (
        <div className="space-y-6">
          {/* Google Pay Button */}
          <div className="bg-[#EEEEEE] rounded-[8px] p-6">
            <div className="flex items-center gap-3 mb-4">
            <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M44.042 0H15.96C7.18 0 0 7.2 0 16C0 24.8 7.18 32 15.958 32H44.04C52.82 32 60 24.8 60 16C60 7.2 52.82 0 44.042 0Z" fill="white"/>
<path d="M44.042 1.296C46.014 1.296 47.928 1.688 49.732 2.456C53.2555 3.95811 56.0589 6.76864 57.552 10.296C58.316 12.104 58.708 14.024 58.708 16C58.708 17.976 58.316 19.896 57.55 21.704C56.053 25.2288 53.2509 28.038 49.73 29.544C47.93 30.312 46.014 30.704 44.042 30.704H15.96C14.0044 30.7066 12.0686 30.3119 10.27 29.544C6.74646 28.0419 3.94311 25.2314 2.45 21.704C1.6844 19.8999 1.2912 17.9598 1.294 16C1.294 14.024 1.686 12.104 2.452 10.296C3.94898 6.77125 6.75108 3.96198 10.272 2.456C12.0699 1.68833 14.005 1.2937 15.96 1.296H44.04H44.042ZM44.042 0H15.96C7.18 0 0 7.2 0 16C0 24.8 7.18 32 15.958 32H44.04C52.82 32 60 24.8 60 16C60 7.2 52.82 0 44.042 0Z" fill="#3C4043"/>
<path d="M28.6121 17.1364V21.9764H27.0801V10.0244H31.1401C32.1701 10.0244 33.0481 10.3684 33.7661 11.0564C34.5001 11.7444 34.8661 12.5844 34.8661 13.5764C34.8661 14.5924 34.5001 15.4324 33.7661 16.1124C33.0561 16.7924 32.1781 17.1284 31.1401 17.1284H28.6121V17.1364ZM28.6121 11.4964V15.6644H31.1721C31.7801 15.6644 32.2901 15.4564 32.6881 15.0484C33.0961 14.6404 33.3021 14.1444 33.3021 13.5844C33.3031 13.3141 33.2493 13.0463 33.1437 12.7974C33.0382 12.5485 32.8832 12.3236 32.6881 12.1364C32.4952 11.9289 32.26 11.7652 31.9985 11.6562C31.7371 11.5472 31.4552 11.4954 31.1721 11.5044H28.6121V11.4964ZM38.8721 13.5284C40.0061 13.5284 40.9001 13.8324 41.5521 14.4404C42.2081 15.0484 42.5341 15.8804 42.5341 16.9364V21.9764H41.0741V20.8404H41.0101C40.3801 21.7764 39.5341 22.2404 38.4821 22.2404C37.5801 22.2404 36.8301 21.9764 36.2221 21.4404C35.9317 21.1954 35.6995 20.8888 35.5425 20.5428C35.3854 20.1969 35.3074 19.8203 35.3141 19.4404C35.3141 18.5924 35.6341 17.9204 36.2721 17.4244C36.9101 16.9204 37.7641 16.6724 38.8241 16.6724C39.7341 16.6724 40.4841 16.8404 41.0661 17.1764V16.8244C41.0686 16.5652 41.0134 16.3086 40.9044 16.0734C40.7955 15.8381 40.6355 15.6301 40.4361 15.4644C40.0303 15.0963 39.4999 14.8961 38.9521 14.9044C38.0981 14.9044 37.4201 15.2644 36.9261 15.9924L35.5781 15.1444C36.3181 14.0644 37.4201 13.5284 38.8721 13.5284ZM36.8921 19.4644C36.8921 19.8644 37.0621 20.2004 37.4041 20.4644C37.7401 20.7284 38.1381 20.8644 38.5941 20.8644C39.2401 20.8644 39.8141 20.6244 40.3161 20.1444C40.8201 19.6644 41.0761 19.1044 41.0761 18.4564C40.5961 18.0804 39.9341 17.8884 39.0801 17.8884C38.4581 17.8884 37.9401 18.0404 37.5241 18.3364C37.1021 18.6484 36.8941 19.0244 36.8941 19.4644H36.8921ZM50.8641 13.7924L45.7581 25.5684H44.1781L46.0781 21.4484L42.7101 13.7924H44.3781L46.8001 19.6644H46.8321L49.1941 13.7924H50.8621H50.8641Z" fill="#3C4043"/>
<path d="M22.5197 16.1597C22.5197 15.6597 22.4737 15.1797 22.3897 14.7197H15.9697V17.3597H19.6677C19.5177 18.2397 19.0337 18.9877 18.2957 19.4857V21.1997H20.4957C21.7817 20.0057 22.5177 18.2437 22.5177 16.1597H22.5197Z" fill="#4285F4"/>
<path d="M18.2978 19.4865C17.6858 19.9005 16.8958 20.1445 15.9718 20.1445C14.1898 20.1445 12.6758 18.9385 12.1358 17.3145H9.86182V19.0805C10.4293 20.2146 11.3012 21.1685 12.3799 21.8354C13.4586 22.5022 14.7016 22.8558 15.9698 22.8565C17.8178 22.8565 19.3698 22.2465 20.4958 21.1985L18.2958 19.4865H18.2978Z" fill="#34A853"/>
<path d="M11.9198 16.0038C11.9198 15.5478 11.9958 15.1078 12.1338 14.6918V12.9258H9.8598C9.3804 13.8809 9.13174 14.9351 9.1338 16.0038C9.1338 17.1118 9.3958 18.1558 9.8598 19.0818L12.1318 17.3158C11.9903 16.8928 11.918 16.4498 11.9178 16.0038H11.9198Z" fill="#FABB05"/>
<path d="M15.9723 11.8638C16.9803 11.8638 17.8823 12.2118 18.5963 12.8918L20.5463 10.9378C19.3104 9.77259 17.6707 9.13233 15.9723 9.1518C14.7043 9.15229 13.4614 9.50554 12.3827 10.172C11.304 10.8385 10.432 11.792 9.86426 12.9258L12.1343 14.6918C12.6763 13.0678 14.1903 11.8638 15.9743 11.8638H15.9723Z" fill="#E94235"/>
</svg>
            </div>
            
            <p className="text-[#30313D] text-[14px] font-normal mb-4">Google Pay selected for check out.</p>
            
            <div className="flex items-center border-t border-[#E6E6E6] gap-3 pt-4 rounded-[8px]">
              <div className="w-[48px] h-[40px] flex items-center justify-center">
              <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_7799_3617)">
<path opacity="0.6" fillRule="evenodd" clipRule="evenodd" d="M9 1C7.93913 1 6.92172 1.42143 6.17157 2.17157C5.42143 2.92172 5 3.93913 5 5V35C5 36.0609 5.42143 37.0783 6.17157 37.8284C6.92172 38.5786 7.93913 39 9 39H27C28.0609 39 29.0783 38.5786 29.8284 37.8284C30.5786 37.0783 31 36.0609 31 35V26C31 25.7348 30.8946 25.4804 30.7071 25.2929C30.5196 25.1054 30.2652 25 30 25C29.7348 25 29.4804 25.1054 29.2929 25.2929C29.1054 25.4804 29 25.7348 29 26V35C29 35.5304 28.7893 36.0391 28.4142 36.4142C28.0391 36.7893 27.5304 37 27 37H9C8.46957 37 7.96086 36.7893 7.58579 36.4142C7.21071 36.0391 7 35.5304 7 35V14C7 13.4696 7.21071 12.9609 7.58579 12.5858C7.96086 12.2107 8.46957 12 9 12H27C27.5304 12 28.0391 12.2107 28.4142 12.5858C28.7893 12.9609 29 13.4696 29 14V16C29 16.2652 29.1054 16.5196 29.2929 16.7071C29.4804 16.8946 29.7348 17 30 17C30.2652 17 30.5196 16.8946 30.7071 16.7071C30.8946 16.5196 31 16.2652 31 16V5C31 3.93913 30.5786 2.92172 29.8284 2.17157C29.0783 1.42143 28.0609 1 27 1H9ZM35.992 16.409L39.583 20H24C23.7348 20 23.4804 20.1054 23.2929 20.2929C23.1054 20.4804 23 20.7348 23 21C23 21.2652 23.1054 21.5196 23.2929 21.7071C23.4804 21.8946 23.7348 22 24 22H39.583L35.992 25.591C35.899 25.6839 35.8253 25.7942 35.7749 25.9156C35.7246 26.0371 35.6986 26.1672 35.6986 26.2986C35.6985 26.4301 35.7244 26.5603 35.7746 26.6817C35.8249 26.8032 35.8986 26.9135 35.9915 27.0065C36.0844 27.0995 36.1947 27.1732 36.3161 27.2236C36.4376 27.2739 36.5677 27.2999 36.6991 27.2999C36.8306 27.3 36.9608 27.2741 37.0822 27.2239C37.2037 27.1736 37.314 27.0999 37.407 27.007L42.707 21.707C42.8945 21.5195 42.9998 21.2652 42.9998 21C42.9998 20.7348 42.8945 20.4805 42.707 20.293L37.407 14.993C37.314 14.9001 37.2037 14.8264 37.0822 14.7761C36.9608 14.7259 36.8306 14.7 36.6991 14.7001C36.5677 14.7001 36.4376 14.7261 36.3161 14.7764C36.1947 14.8268 36.0844 14.9005 35.9915 14.9935C35.8986 15.0865 35.8249 15.1968 35.7746 15.3183C35.7244 15.4397 35.6985 15.5699 35.6986 15.7014C35.6986 15.8328 35.7246 15.9629 35.7749 16.0844C35.8253 16.2058 35.899 16.3161 35.992 16.409ZM7 8.5C7 8.10218 7.15804 7.72064 7.43934 7.43934C7.72064 7.15804 8.10218 7 8.5 7H27.5C27.8978 7 28.2794 7.15804 28.5607 7.43934C28.842 7.72064 29 8.10218 29 8.5C29 8.89782 28.842 9.27936 28.5607 9.56066C28.2794 9.84196 27.8978 10 27.5 10H8.5C8.10218 10 7.72064 9.84196 7.43934 9.56066C7.15804 9.27936 7 8.89782 7 8.5ZM23 3C22.7348 3 22.4804 3.10536 22.2929 3.29289C22.1054 3.48043 22 3.73478 22 4C22 4.26522 22.1054 4.51957 22.2929 4.70711C22.4804 4.89464 22.7348 5 23 5C23.2652 5 23.5196 4.89464 23.7071 4.70711C23.8946 4.51957 24 4.26522 24 4C24 3.73478 23.8946 3.48043 23.7071 3.29289C23.5196 3.10536 23.2652 3 23 3ZM15 4C15 3.73478 15.1054 3.48043 15.2929 3.29289C15.4804 3.10536 15.7348 3 16 3H20C20.2652 3 20.5196 3.10536 20.7071 3.29289C20.8946 3.48043 21 3.73478 21 4C21 4.26522 20.8946 4.51957 20.7071 4.70711C20.5196 4.89464 20.2652 5 20 5H16C15.7348 5 15.4804 4.89464 15.2929 4.70711C15.1054 4.51957 15 4.26522 15 4ZM15 34C14.7348 34 14.4804 34.1054 14.2929 34.2929C14.1054 34.4804 14 34.7348 14 35C14 35.2652 14.1054 35.5196 14.2929 35.7071C14.4804 35.8946 14.7348 36 15 36H21C21.2652 36 21.5196 35.8946 21.7071 35.7071C21.8946 35.5196 22 35.2652 22 35C22 34.7348 21.8946 34.4804 21.7071 34.2929C21.5196 34.1054 21.2652 34 21 34H15Z" fill="#6D6E78"/>
</g>
<defs>
<clipPath id="clip0_7799_3617">
<rect width="48" height="40" fill="white"/>
</clipPath>
</defs>
</svg>

              </div>
              <div>
                <p className="text-[#6D6E78] text-sm font-normal">
                  Another step will apper after submitting your order to complete your purchase details.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Account Content */}
      {activePaymentMethod === 'bank' && (
        <div className="space-y-6">
          {/* Email Field */}
          <div className="w-full">
            <label htmlFor="bankEmail" className="block text-base font-normal text-[#5F5F5F] mb-1">
              Email
            </label>
            <input
              id="bankEmail"
              type="email"
              placeholder=""
              className="w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white"
            />
          </div>

          {/* Full Name Field */}
          <div className="w-full">
            <label htmlFor="bankFullName" className="block text-base font-normal text-[#5F5F5F] mb-1">
              Full name
            </label>
            <input
              id="bankFullName"
              type="text"
              placeholder="First and last name"
              className="w-full px-4 py-3 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#77787D] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white"
            />
          </div>

          {/* Bank Account Search */}
          <div className="w-full">
            <label htmlFor="bankSearch" className="block text-base font-normal text-[#5F5F5F] mb-1">
              Bank account
            </label>
            <div className="relative">
              <input
                id="bankSearch"
                type="text"
                placeholder="Search for your bank"
                className="w-full px-4 py-3 pl-12 bg-[#EEEEEE] border-0 rounded-[8px] text-gray-800 placeholder-[#77787D] focus:outline-none focus:ring-2 focus:ring-[#5046E5] focus:bg-white"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0_7807_647)">
<path d="M12.707 11.793C12.6736 11.7595 12.6378 11.7285 12.6 11.7C13.6624 10.2835 14.1485 8.51705 13.9604 6.75645C13.7723 4.99585 12.924 3.37194 11.5864 2.21183C10.2488 1.05172 8.52124 0.44161 6.75174 0.504408C4.98223 0.567206 3.30227 1.29824 2.05026 2.55026C0.798242 3.80227 0.0672061 5.48223 0.004408 7.25174C-0.0583901 9.02124 0.551715 10.7488 1.71183 12.0864C2.87194 13.424 4.49585 14.2723 6.25645 14.4604C8.01705 14.6485 9.78351 14.1624 11.2 13.1C11.228 13.137 11.259 13.173 11.293 13.207L14.293 16.207C14.3858 16.2999 14.4961 16.3736 14.6174 16.4239C14.7387 16.4742 14.8688 16.5002 15.0002 16.5002C15.1315 16.5003 15.2616 16.4744 15.3829 16.4242C15.5043 16.374 15.6146 16.3003 15.7075 16.2075C15.8004 16.1147 15.8741 16.0044 15.9244 15.8831C15.9747 15.7618 16.0007 15.6317 16.0007 15.5004C16.0008 15.369 15.9749 15.2389 15.9247 15.1176C15.8745 14.9962 15.8008 14.8859 15.708 14.793L12.707 11.793ZM12 7.5C12 8.82609 11.4732 10.0979 10.5355 11.0355C9.59786 11.9732 8.32609 12.5 7 12.5C5.67392 12.5 4.40215 11.9732 3.46447 11.0355C2.52679 10.0979 2 8.82609 2 7.5C2 6.17392 2.52679 4.90215 3.46447 3.96447C4.40215 3.02679 5.67392 2.5 7 2.5C8.32609 2.5 9.59786 3.02679 10.5355 3.96447C11.4732 4.90215 12 6.17392 12 7.5Z" fill="#30313D"/>
</g>
<defs>
<clipPath id="clip0_7807_647">
<rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
</clipPath>
</defs>
</svg>

              </div>
            </div>
          </div>

          {/* Bank Institution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              'Test Institution',
              'Test OAuth Institution',
              'Test Institution',
              'Test OAuth Institution',
              'Test Institution',
              'Test OAuth Institution'
            ].map((institution, index) => (
              <button
                key={index}
                type="button"
                className="px-4 py-[18px] bg-[#EEEEEE] rounded-[8px] text-[#30313D] text-center font-normal hover:bg-gray-200 transition-colors duration-200 text-[16px]"
              >
                {institution}
              </button>
            ))}
          </div>

          {/* Manual Entry Link */}
          <div className="text-start">
            <button
              type="button"
              className="text-[#5046E5] text-sm cursor-pointer font-medium hover:underline"
            >
              Enter bank details manually instead{' '}
              <span className="text-[#6D6E78] font-normal">(takes 1-2 business days)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
