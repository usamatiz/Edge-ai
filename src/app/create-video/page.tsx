"use client";

import PreviousVideosGallery from "@/components/ui/previous-videos-gallery";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateVideoPage() {
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
        <div className="flex justify-center mb-10">
          {/* Create Video Button */}
          <Link
            href="/create-video/new"
            className="inline-flex items-center md:max-w-[167px] max-w-full w-full justify-center gap-2 px-6 py-[9.4px] bg-[#5046E5] text-white rounded-full md:text-[20px] text-[18px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300 font-semibold whitespace-nowrap"
          >
            Create Video
          </Link>
        </div>

        {/* Gallery Content */}
        <div className="pt-4">
          <PreviousVideosGallery />
        </div>
      </div>
    </div>
  );
}
