'use client'

import Image from 'next/image'

interface Step1IntroProps {
  onNext: () => void
}

export default function Step1Intro({ onNext }: Step1IntroProps) {
  const instructions = [
    {
      icon: <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 6H10C9.72375 6 9.5 6.22375 9.5 6.5V8C9.5 10.3375 7.48469 12.2131 5.10031 11.9806C3.02219 11.7778 1.5 9.90969 1.5 7.82188V6.5C1.5 6.22375 1.27625 6 1 6H0.5C0.22375 6 0 6.22375 0 6.5V7.755C0 10.5562 1.99906 13.0534 4.75 13.4328V14.5H3C2.72375 14.5 2.5 14.7238 2.5 15V15.5C2.5 15.7762 2.72375 16 3 16H8C8.27625 16 8.5 15.7762 8.5 15.5V15C8.5 14.7238 8.27625 14.5 8 14.5H6.25V13.4447C8.92844 13.0772 11 10.7781 11 8V6.5C11 6.22375 10.7762 6 10.5 6ZM5.5 11C7.15688 11 8.5 9.65687 8.5 8H5.83344C5.64937 8 5.5 7.88812 5.5 7.75V7.25C5.5 7.11188 5.64937 7 5.83344 7H8.5V6H5.83344C5.64937 6 5.5 5.88812 5.5 5.75V5.25C5.5 5.11188 5.64937 5 5.83344 5H8.5V4H5.83344C5.64937 4 5.5 3.88812 5.5 3.75V3.25C5.5 3.11188 5.64937 3 5.83344 3H8.5C8.5 1.34312 7.15688 0 5.5 0C3.84312 0 2.5 1.34312 2.5 3V8C2.5 9.65687 3.84312 11 5.5 11Z" fill="#2A2F3A"/>
      </svg>,
      title: "Use the right equipment",
      description: "Submit 2-5 min (at least 30 sec) of unedited footage with a professional camera or smartphone."
    },
    {
      icon: <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 12H1.5C0.671562 12 0 11.3284 0 10.5V1.5C0 0.671562 0.671562 0 1.5 0H14.5C15.3284 0 16 0.671562 16 1.5V10.5C16 11.3284 15.3284 12 14.5 12ZM3.5 1.75C2.5335 1.75 1.75 2.5335 1.75 3.5C1.75 4.4665 2.5335 5.25 3.5 5.25C4.4665 5.25 5.25 4.4665 5.25 3.5C5.25 2.5335 4.4665 1.75 3.5 1.75ZM2 10H14V6.5L11.2652 3.76516C11.1187 3.61872 10.8813 3.61872 10.7348 3.76516L6.5 8L4.76516 6.26516C4.61872 6.11872 4.38128 6.11872 4.23481 6.26516L2 8.5V10Z" fill="#2A2F3A"/>
      </svg>,
      title: "Set the right environment",
      description: "Look straight ahead and keep your head level"
    },
    {
      icon: <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.5 6H10C9.72375 6 9.5 6.22375 9.5 6.5V8C9.5 10.3375 7.48469 12.2131 5.10031 11.9806C3.02219 11.7778 1.5 9.90969 1.5 7.82188V6.5C1.5 6.22375 1.27625 6 1 6H0.5C0.22375 6 0 6.22375 0 6.5V7.755C0 10.5562 1.99906 13.0534 4.75 13.4328V14.5H3C2.72375 14.5 2.5 14.7238 2.5 15V15.5C2.5 15.7762 2.72375 16 3 16H8C8.27625 16 8.5 15.7762 8.5 15.5V15C8.5 14.7238 8.27625 14.5 8 14.5H6.25V13.4447C8.92844 13.0772 11 10.7781 11 8V6.5C11 6.22375 10.7762 6 10.5 6ZM5.5 11C7.15688 11 8.5 9.65687 8.5 8H5.83344C5.64937 8 5.5 7.88812 5.5 7.75V7.25C5.5 7.11188 5.64937 7 5.83344 7H8.5V6H5.83344C5.64937 6 5.5 5.88812 5.5 5.75V5.25C5.5 5.11188 5.64937 5 5.83344 5H8.5V4H5.83344C5.64937 4 5.5 3.88812 5.5 3.75V3.25C5.5 3.11188 5.64937 3 5.83344 3H8.5C8.5 1.34312 7.15688 0 5.5 0C3.84312 0 2.5 1.34312 2.5 3V8C2.5 9.65687 3.84312 11 5.5 11Z" fill="#2A2F3A"/>
      </svg>,
      title: "Speak naturally and clearly",
      description: "Maintain a steady pace, pausing 1-2 seconds between sentences with lips closed."
    },
    {
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6H6V0H0V6ZM2 2H4V4H2V2ZM8 0V6H14V0H8ZM12 4H10V2H12V4ZM0 14H6V8H0V14ZM2 10H4V12H2V10ZM13 8H14V12H11V11H10V14H8V8H11V9H13V8ZM13 13H14V14H13V13ZM11 13H12V14H11V13Z" fill="#2A2F3A"/>
      </svg>,
      title: "Subtle movement, clear expression",
      description: "Sit, stand, or walk with subtle hand movements kept below the chest. Vary facial expressions and look into the camera."
    },
    {
      icon: "👋",
      title: "Want large or distinct gesture?",
      description: "You can include these after 30 seconds, spaced at least 2 seconds apart. They'll be excluded from your avatar's default behavior and only used when trigged."
    }
  ]

  return (
    <div className="space-y-3 flex flex-col h-full justify-between">
      {/* Two Column Layout */}
      <div className="flex gap-0 flex-wrap gap-y-10 w-full items-start">
        {/* Left Section - Instructions */}
        <div className="space-y-9 md:w-[56%] w-full pr-7">
          {/* First 4 Instructions */}
          <div className="space-y-9">
            {instructions.slice(0, 4).map((instruction, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-[9px]">
                  {instruction.icon}
                </div>
                <div>
                  <h4 className="md:text-[24px] text-[18px] font-semibold text-[#101010]">
                    {instruction.title}
                  </h4>
                  <p className="md:text-[18px] max-w-[520px] text-[14px] text-[#5F5F5F] font-normal leading-[24px]">
                    {instruction.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Separator Line */}
          <div className="bg-[#101010] h-[1px]"></div>

          {/* Final Instruction */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-[9px">
              <p className="text-[24px]">{instructions[4].icon}</p>
            </div>
            <div>
              <h4 className="md:text-[24px] text-[18px] font-semibold text-[#101010]">
                {instructions[4].title}
              </h4>
              <p className="md:text-[18px] max-w-[520px] leading-[24px] text-[14px] text-[#5F5F5F] font-normal">
                {instructions[4].description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Visual Examples */}
        <div className="space-y-8 md:w-[44%] w-full flex flex-col justify-end md:items-end items-center pr-1">
          {/* Top Image - Good Example */}
          <Image src="/images/avatars/right.png" alt="Good Example" width={400} height={296} />

          {/* Bottom Image - Bad Example */}
          <Image src="/images/avatars/wrong.png" alt="Bad Example" width={400} height={296} />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-0 pb-2">
        <button
          onClick={onNext}
          className="px-8 py-[11.3px] bg-[#5046E5] text-white font-semibold text-[20px]
           hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] rounded-full transition-colors duration-300 cursor-pointer w-full"
        >
          Next
        </button>
      </div>
    </div>
  )
}
