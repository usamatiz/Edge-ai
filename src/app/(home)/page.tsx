"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SLIDER_ITEMS, REVIEW_SLIDER_ITEMS } from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import VideoCard from "@/components/ui/video-card";
import Image from "next/image";
import Partners from "@/components/ui/partners";
import ActionCard from "@/components/ui/action-card";
import { ContactForm, FeaturesSection } from "@/components/ui";
import FAQSection from "@/components/ui/FAQsection";
import { ReviewSlider } from "@/components/ui/review-slider";
import { ProcessSteps } from "@/components/ui/process-steps";
import PricingSection from "@/components/ui/pricing-section";
import { smoothScrollTo } from "@/lib/utils";
import SigninModal from "@/components/ui/signin-modal";
import { useState } from "react";

// Home Page
export default function HomePage() {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);

  // Handle hash navigation when the page loads
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure the page has fully loaded and all sections are rendered
      setTimeout(() => {
        const elementId = hash.substring(1);
        smoothScrollTo(elementId);
      }, 300);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="getting-started" data-aos="fade-up" className="relative pt-14 lg:pt-20 px-3">
        <div className="max-w-[1440px] mx-auto pb-12 relative z-10">
          <div className="text-center">
            <h1 className="text-[36px] md:text-6xl lg:text-[72px] font-semibold text-gray-900 mb-5 lg:leading-[84px] md:leading-[72px] leading-[47px]">
            Real Estate Marketing?<br className="hidden md:block"/> <span className="text-[#5046E5]">Automated. Effortless.</span> <br className="hidden md:block"/>One Click Away
            </h1>
            <p className="text-xl lg:text-[20px] text-[#5F5F5F] mb-10 max-w-[590px] mx-auto leading-[24px]">
            Custom AI videos for agents & loan officers—just fill one form, 
            hit submit, and we handle the rest. (Once onboarded)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create-video"
                className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-[#5046E5] text-white rounded-full transition-all !duration-300 hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5]"
              >
                Get Started
              </Link>
              <button
                onClick={() => setIsSigninModalOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center px-[26.5px] py-[13.2px] text-base font-semibold bg-transparent border-2 border-[#5046E5] text-[#5046E5] rounded-full hover:bg-[#5046E5] hover:text-white transition-all duration-300 gap-2"
              >
                <svg width="13" height="18" viewBox="0 0 13 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 18L12.5 9L0.499999 0L0.5 18Z" fill="currentColor"/>
                </svg>

                Watch Demo
              </button>
            </div>
          </div>
        </div>
        <Image src="/images/Background.png" alt="Background" className="w-full h-full absolute lg:-bottom-24 bottom-0 left-0 z-0 object-contain" width={1440} height={1000} />
        <VideoCard />
      </section>

      <Partners/>

      {/* Slider Section */}
      <section className="mb-16" data-aos="fade-up">
        <Slider 
          items={SLIDER_ITEMS}
          autoPlay={true}
          autoPlayInterval={5000}
          showArrows={true}
          showDots={true}
          className="mb-16"
        />
      </section>
      <ActionCard/>

      <section id="how-it-works" data-aos="fade-up">
        <ProcessSteps/>
      </section>
      

      <section id="benefits" data-aos="fade-up">
        <FeaturesSection/>
      </section>

      <section id="pricing" data-aos="fade-up">
        <PricingSection/>
      </section>

      
      <ReviewSlider
        items={REVIEW_SLIDER_ITEMS}
        autoPlay={true}
        autoPlayInterval={5000}
        showArrows={true}
        showDots={true}
        className="mb-0"
      />
      <section id="faq" data-aos="fade-up">
        <FAQSection/>
      </section>

      <section id="contact" className="!block" data-aos="fade-up">
        <ContactForm/>
      </section>

      <SigninModal
        isOpen={isSigninModalOpen}
        onClose={() => setIsSigninModalOpen(false)}
      />
    </div>
  );
}
