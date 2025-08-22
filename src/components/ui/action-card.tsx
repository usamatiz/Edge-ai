'use client'

import SigninModal from "./signin-modal";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { smoothScrollTo } from "@/lib/utils";

export default function ActionCard(){
    const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
    const { isLoggedIn } = useAuth();


      const handleGetStartedClick = (e: React.MouseEvent) => {
    if (isLoggedIn) {
      window.location.href = '/create-video';
    } else {
      e.preventDefault();
      smoothScrollTo('how-it-works');
    }
  };

    return(
        <div className="bg-[#060609] pb-20 pt-20" style={{ backgroundImage: 'url(/images/price-bg.png)', backgroundSize: 'cover', backgroundPosition: 'top', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
            <div className="max-w-[1260px] mx-auto xl:px-0 px-3">
                <div className="bg-[#2F2F2F]/30 backdrop-blur-lg border border-[#D8D8D8]/70 rounded-[24px] px-[44px] py-[26px]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left side - Heading */}
                        <div className="flex-1">
                            <h2 className="text-white text-3xl md:text-4xl lg:text-[56px] font-semibold leading-tight">
                                Ready to see<br />Ai in Action?
                            </h2>
                        </div>
                        
                        {/* Right side - Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* <button
                                onClick={() => setIsSigninModalOpen(true)}
                                className="px-[26.5px] py-[13.2px] border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300 cursor-pointer"
                            >
                                Watch Demo
                            </button> */}
                            {isLoggedIn ? (
                                <Link
                                href="/create-video"
                                className="px-[28px] py-[13.2px] bg-[#5046E5] text-white rounded-full font-semibold hover:bg-transparent border-[#5046E5] hover:text-white hover:border-white/30 border transition-all duration-300 cursor-pointer"
                            >
                                Get Started
                            </Link>
                            ) : (
                                <button
                                    onClick={handleGetStartedClick}
                                    className="px-[28px] py-[13.2px] bg-[#5046E5] text-white rounded-full font-semibold hover:bg-transparent border-[#5046E5] hover:text-white hover:border-white/30 border transition-all duration-300 cursor-pointer"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <SigninModal
                isOpen={isSigninModalOpen}
                onClose={() => setIsSigninModalOpen(false)}
            />
        </div>
    )
}