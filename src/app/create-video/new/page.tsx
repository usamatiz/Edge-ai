"use client";

import CreateVideoForm from "@/components/ui/create-video-form";

export default function NewVideoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-[1260px] mx-auto xl:px-0 px-3 lg:py-20 py-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-[37px] md:text-4xl leading-[40px] lg:text-[42px] font-semibold text-[#171717] mb-4">
            Create Videos Effortlessly
          </h1>
          <p className="text-lg md:text-[20px] text-[#5F5F5F] max-w-3xl mx-auto leading-[24px]">
            Custom AI videos for agents & loan officers—just fill one form, <br /> hit submit, and we handle the rest. (Once onboarded)
          </p>
        </div>

        {/* Form Content */}
        <div className="pt-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-[32px] font-semibold text-[#282828] mb-2">
              Fill the details to create video
            </h2>
          </div>
          <CreateVideoForm />
        </div>
      </div>
    </div>
  );
}
