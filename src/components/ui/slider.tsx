"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard } from "swiper/modules";
import { cn } from "@/lib/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SliderItem {
  id: string;
  statistic: string;
  content: string;
  attribution?: string;
}

interface SliderProps {
  items: SliderItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export function Slider({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  className,
}: SliderProps) {
  if (!items.length) return null;

  return (
    <div className={cn("relative w-full max-w-[1260px] mx-auto px-3 py-14", className)}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, Keyboard]}
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        loop={true}
        speed={600}
        autoplay={
          autoPlay
            ? {
                delay: autoPlayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : true
        }
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        navigation={
          showArrows
            ? {
                nextEl: ".main-swiper-button-next",
                prevEl: ".main-swiper-button-prev",
              }
            : false
        }
        pagination={
          showDots
            ? {
                el: ".main-swiper-pagination",
                clickable: true,
                dynamicBullets: false,
                renderBullet: function (index, className) {
                  return `<span class="${className}"></span>`;
                },
              }
            : false
        }
        className="main-swiper-container"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="swiper-slide px-3">
            <div className="bg-[#FAFAFA] rounded-[24px] p-8 h-full min-h-[300px] flex flex-col justify-between">
              {/* Statistic */}
              <h3 className="text-[44px] md:text-[54px] font-semibold mb-4 slider-title">
                {item.statistic}
              </h3>
              
              {/* Content */}
              <p className="text-[#5F6980] text-[18px] leading-relaxed mb-4 flex-grow">
                {item.content}
              </p>
              
              {/* Attribution */}
              {item.attribution && (
                <p className="text-[12px] text-[#5F6980] mt-auto">
                  {item.attribution}
                </p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      {showArrows && (
        <>
          <div className="main-swiper-button-prev !transition-all !duration-300 !text-[#757575] xl:!-left-2 left-0 !top-[42%]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="main-swiper-button-next !text-[#757575] xl:!-right-2 right-0 !top-[42%]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}

      {/* Custom Pagination Dots - Outside Swiper */}
      {showDots && (
        <div className="main-swiper-pagination flex justify-center space-x-2 mt-0" />
      )}

      {/* Custom CSS for Swiper */}
      <style jsx global>{`
        .main-swiper-container {
          width: 100%;
          padding: 20px 0 60px 0;
        }

        .main-swiper-container .swiper-slide {
          text-align: left;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: stretch;
        }

        /* Navigation Arrows */
        .main-swiper-button-prev,
        .main-swiper-button-next {
          position: absolute;
          top: 42%;
          background: transparent;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #757575;
          z-index: 10;
          cursor: pointer;
        }

        .main-swiper-button-prev:hover,
        .main-swiper-button-next:hover {
          background: transparent;
        }

        .main-swiper-button-prev {
          left: 16px;
        }

        .main-swiper-button-next {
          right: 16px;
        }

        .main-swiper-button-prev::after,
        .main-swiper-button-next::after {
          display: none;
        }

        /* Pagination Dots */
        .main-swiper-pagination {
          position: relative;
          display: flex;
          gap: 1px;
          z-index: 10;
        }

        .main-swiper-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #D9D9D9;
          border-radius: 50%;
          opacity: 1;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .main-swiper-pagination .swiper-pagination-bullet:hover {
          background: #454850;
          transform: scale(1.2);
        }

        .main-swiper-pagination .swiper-pagination-bullet-active {
          background: #454850;
          transform: scale(1.2);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .main-swiper-container {
            padding: 10px 0 50px 0;
          }
          
          .main-swiper-button-prev,
          .main-swiper-button-next {
            width: 36px;
            height: 36px;
          }
          
          .main-swiper-button-prev {
            left: 8px;
          }
          
          .main-swiper-button-next {
            right: 8px;
          }
          
          .main-swiper-pagination {
            margin-top: 6px;
          }
          
          .main-swiper-pagination .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
          }
        }

        /* Focus states for accessibility */
        .main-swiper-button-prev:focus,
        .main-swiper-button-next:focus,
        .main-swiper-pagination .swiper-pagination-bullet:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Disabled states */
        .main-swiper-button-prev.swiper-button-disabled,
        .main-swiper-button-next.swiper-button-disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .main-swiper-button-prev.swiper-button-disabled:hover,
        .main-swiper-button-next.swiper-button-disabled:hover {
          transform: translateY(-50%) scale(1);
          background: #374151;
        }
      `}</style>
    </div>
  );
}
