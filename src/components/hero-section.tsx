"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";
import Image from "next/image";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const { trackButtonClick } = useAnalytics();

  return (
    <section className={cn(
      "relative flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-10",
      className
    )}>      
      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full mb-[14px]" style={{backgroundColor: "rgb(244, 243, 254)"}}>
          <div className="flex items-center justify-center w-5 h-5">
            <Image src="/images/stars.png" alt="EdgeAi" width={20} height={20} className="w-5 h-5" />
          </div>
          <span className="text-sm font-normal" style={{color: "rgb(80, 70, 229)"}}>
            AI-Powered Real Estate Videos
          </span>   
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-[47px] sm:text-6xl lg:text-7xl xl:text-[90px] font-semibold
           text-gray-900 md:leading-[1] leading-[1.3]">
            <span className="block">Real Estate Marketing?</span>
            <span className="block">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Automated.
              </span>{" "}
              <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                Effortless.
              </span>
            </span>
            <span className="block">One Click Away.</span>
          </h1>
        </div>

        {/* Descriptive Subtitle */}
        <div className="max-w-3xl mx-auto">
          <p className="text-xl sm:text-2xl lg:text-2xl text-gray-600 leading-relaxed font-normal">
            Custom AI videos for agents & loan officers—just fill one form, hit submit, and we handle the rest.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Primary CTA */}
          <Link
            href="/get-started"
            onClick={() => trackButtonClick("get_started", "hero", "primary_cta")}
            className={cn(
              "group inline-flex items-center justify-center gap-3 px-8 py-4 lg:px-10 lg:py-5",
              "bg-purple-600 hover:bg-purple-700",
              "text-white font-semibold text-lg lg:text-xl rounded-full",
              "transition-all duration-300 transform hover:scale-105 hover:shadow-xl",
              "focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2"
            )}
          >
            <span>Get Started</span>
            <svg 
              className="w-5 h-5 lg:w-6 lg:h-6 transition-transform text-white duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/demo"
            onClick={() => trackButtonClick("watch_demo", "hero", "secondary_cta")}
            className={cn(
              "group inline-flex items-center justify-center gap-3 px-8 py-4 lg:px-10 lg:py-5",
              "bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
              "text-gray-900 font-semibold text-lg lg:text-xl rounded-full",
              "transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
              "focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:ring-offset-2"
            )}
          >
            <svg 
              className="w-5 h-5 lg:w-6 lg:h-6" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Watch Demo</span>
          </Link>
        </div>

        {/* Video Player Section */}
        <div className="mt-16 space-y-8">
          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white shadow-lg rounded-full">
            {/* Avatar Group */}
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((letter, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700 border-2 border-white"
                >
                  {letter}
                </div>
              ))}
            </div>

            <div className="flex items-start flex-col">

                {/* Stars */}
                <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                    <svg
                    key={index}
                    className="w-7 h-7 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                ))}
                </div>

                {/* Trust Text */}
                <span className="text-gray-700 font-bold text-base">
                Trusted by 500+ agents across the U.S.
                </span>
            </div>
          </div>

          {/* Main Video Player */}
          <div className="relative max-w-7xl mx-auto mt-14">
            <div className="relative bg-white border-2 border-red-800 rounded-lg overflow-hidden shadow-xl">
              {/* YouTube Video Player */}
              <div className="relative aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&showinfo=0"
                  title="Real Estate Marketing Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Bottom Satisfaction Rating */}
          <div className="flex items-center justify-center gap-4 -mt-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className="w-8 h-8 md:w-12 md:h-12 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <div className="text-left">
              <span className="text-gray-700 font-semibold text-lg">4.9/5.0</span>
              <div className="text-gray-600 text-sm">Agent Satisfaction</div>
            </div>
          </div>

          {/* Scroll Call to Action */}
          <div className="flex flex-col items-center gap-2 pt-8">
            <span className="text-gray-700 font-medium">Scroll to learn more</span>
            <svg className="w-6 h-6 text-gray-700 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-40 blur-xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-xl" />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-30 blur-lg" />
    </section>
  );
}