"use client";

import { useState } from "react";
import CreateVideoForm from "@/components/ui/create-video-form";
import PreviousVideosGallery from "@/components/ui/previous-videos-gallery";

export default function CreateVideoPage() {
  const [activeTab, setActiveTab] = useState('Create Video');

  const tabs = [
    'Create Video',
    'Previous Video'
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="max-w-[1260px] mx-auto xl:px-0 px-3 lg:py-20 py-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-[37px] md:text-4xl leading-[40px] lg:text-[42px] font-semibold text-[#171717] mb-4">
            Create the video effortlessly
          </h1>
          <p className="text-lg md:text-[20px] text-[#5F5F5F] max-w-3xl mx-auto leading-[24px]">
            Custom AI videos for agents & loan officers—just fill one form, <br /> hit submit, and we handle the rest. (Once onboarded)
          </p>
        </div>

        {/* Tabs */}
        <div 
          className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 lg:mb-10 bg-[#ECEFFD] rounded-[30px] sm:rounded-[40px] lg:rounded-[60px] md:px-3 px-4 lg:px-4 py-4 sm:py-1.5 lg:py-2 w-fit mx-auto"
          role="tablist"
          aria-label="Video creation options"
        >
          {tabs.map((tabName) => {
            const isActive = activeTab === tabName;

            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`px-3 md:px-6 lg:px-7 py-1.5 sm:py-2 md:py-[6.4px] rounded-full cursor-pointer text-sm sm:text-base md:text-lg lg:text-[20px] leading-tight sm:leading-normal lg:leading-[32px] font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2 border-2 border-[#5046E5] justify-center
                    ${isActive
                    ? `text-white bg-[#5046E5] hover:bg-[#3A2DFD] hover:text-white`
                    : `text-[#5046E5] bg-transparent
                        hover:bg-[#5046E5] hover:text-white`
                    }
                    ${tabName === 'Create Video' ? 'md:w-[183px] w-full' : 'md:w-[226px] w-full'}
                    
                    `}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tab-panel-${tabName.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tabName}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div 
          className="pt-4"
          role="tabpanel"
          id={`tab-panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
          aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {activeTab === 'Create Video' ? (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828] mb-2">
                  Fill the details to create video
                </h2>
              </div>
              <CreateVideoForm />
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828] mb-2">
                  Use the previous create your video
                </h2>
            </div>
            <PreviousVideosGallery />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
