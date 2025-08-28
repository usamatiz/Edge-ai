"use client";

import React, { useState } from 'react';
import { Check, Zap, Users, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import SigninModal from './signin-modal';
import ForgotPasswordModal from './forgot-password-modal';
import { useAppSelector } from '@/store/hooks';
import { smoothScrollTo } from '@/lib/utils';
import Link from 'next/link';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface EnterprisePlan {
  name: string;
  subtitle: string;
  features: string[];
  buttonText: string;
}

const PricingSection = () => {
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const handleGetStartedClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      window.location.href = '/create-video';
    } else {
      e.preventDefault();
      smoothScrollTo('how-it-works');
    }
  };  

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$99',
      period: '/one-time',
      description: 'Ideal for new users who want to manage basic finances at no cost.',
      features: [
        '1 AI video', 
        '1 Avatar',
        'Basic Customization',
        '24-48 hr email support'
      ],
      buttonText: 'Get Started',
      icon: Zap
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: '$199',
      period: '/month',
      description: 'Ideal for users who want more control over personal finance management.',
      features: [
        '4 AI videos per month',
        '1 Avatar',
        'Priority 36-hour email support',
        'Advanced Customization',
        'Social Media Optimization'
      ],
      buttonText: 'Try Premium',
      popular: true,
      icon: Users
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: '$399',
      period: '/month',
      description: 'Ideal for professionals that require comprehensive financial management.',
      features: [
        '12 AI videos per month',
        '1 Avatar',
        'Full Customization suite',
        'Advanced Analytics Dashboard',
        'Quarterly AI Strategy Session (15 min)'
      ],
      buttonText: 'Get Professional',
      icon: BarChart3
    }
  ];

  const enterprisePlan: EnterprisePlan = {
    name: 'Enterprise',
    subtitle: 'Contact Sales',
    features: [
      'All basic features',
      'Customizable budgeting categories',
      'Investment tracking tools',
      'Priority customer support',
      'Weekly financial reports',
      'Custom integrations'
    ],
    buttonText: 'Get Started'
  };

  return (
    <section className="w-full py-20 bg-black relative overflow-hidden" style={{backgroundImage: `url('/images/price-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed'}}>
      <div className="max-w-[1260px] mx-auto xl:px-0 px-3 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-[32px] md:text-[42px] font-semibold text-white mb-2 leading-tight">
            Flexible Pricing for Every Budget
          </h1>
          <p className="text-[18px] text-white max-w-3xl mx-auto leading-relaxed">
            See examples of our AI-generated real estate marketing videos in action.
          </p>
        </div>

        {/* Top Row - Three Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-7 pt-5">
          {pricingPlans.map((plan, index) => {
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-[2px] transition-all duration-300`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  background: 'radial-gradient(194.57% 261.75% at 22.9% 2.98%, rgba(216, 216, 216, 0) 0%, #D8D8D8 100%)',
                }}
              >
                    {/* Plan Name Tab */}
                    <div className="absolute z-10 border border-[#D8D8D8] flex items-center justify-center -top-[27px] left-1/2 px-[31px] w-fit min-h-[52px] rounded-full transform backdrop-blur-2xl -translate-x-1/2 bg-gradient-to-r from-white/40 to-white/0" style={{ minWidth: 'max-content'}}>
                    <span className="text-white text-[24px] font-semibold text-center leading-[20px]">
                      {plan.name}
                    </span>
                  </div>
                    {/* Popular Badge */}
                    {plan.popular && (
                    <div className='absolute top-[-67px] right-16 !z-20'>
                      <Image src="/images/crown.png" className='relative z-20' alt="crown" width={67} height={67} />
                    </div>
                  )}
                <div className='bg-black w-full h-full rounded-[14px]'>
                {/* Inner card content */}
                <div 
                  className="relative rounded-[14px] p-6 h-full"
                  style={{
                    background: '#141416',
                  }}
                >
                    <div className='flex flex-col justify-between h-full gap-8'>
                  <div className='flex flex-col'>

                  
                  {/* Plan Header */}
                  <div className="pt-3">
                    <div className="mb-0">
                      <span className="text-[30px] md:text-[42px] font-semibold text-white">{plan.price} </span>
                      <span className="text-white text-[18px] md:text-[24px]">{plan.period}</span>
                    </div>
                    <p className="text-white text-[18px] font-medium leading-[150%]">{plan.description}</p>
                  </div>

                  <div className='h-[2px] w-full bg-[#D5DBFA1A] my-6'></div>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-[20px] h-[20px] bg-[#EDEDED] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="text-[#171717]" size={14} />
                        </div>
                        <span className="text-white text-[18px] font-medium leading-[20px]">{feature}</span>
                      </div>
                    ))}
                  </div>
                  </div>

                  {/* CTA Button */}
                  {isAuthenticated ? (
                    <Link href="/create-video" className="w-fit py-[11.6px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer">
                      {plan.buttonText}
                    </Link>
                  ) : (
                    <button
                      onClick={handleGetStartedClick}
                    className={`w-fit py-[11.6px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer`}
                    >
                      {plan.buttonText}
                    </button>
                  )}
                  </div>
                </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section - Enterprise */}
        <div 
          className="relative rounded-2xl p-[2px]"
          style={{
            background: 'radial-gradient(194.57% 261.75% at 22.9% 2.98%, rgba(216, 216, 216, 0) 0%, #D8D8D8 100%)',
          }}
        >
            <div className='bg-black w-full h-full rounded-[14px]'>
            <div 
            className="rounded-[14px] p-8 sm:p-12 border-0"
            style={{
              background: '#141416',
            }}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              {/* Enterprise Content */}
              <div>
                <h3 className="text-[42px] font-semibold text-white">{enterprisePlan.name}</h3>
                <p className="text-white text-[18px] font-medium leading-[150%] mb-8">{enterprisePlan.subtitle}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {enterprisePlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-[20px] h-[20px] bg-[#EDEDED] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="text-[#171717]" size={14} />
                      </div>
                      <span className="text-white text-[18px] font-medium leading-[20px]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enterprise Button */}
              <div className="lg:flex-shrink-0">
                {isAuthenticated ? (
                  <Link href="/create-video" className="w-fit py-[11.6px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer">
                    {enterprisePlan.buttonText}
                  </Link>
                ) : (
                  <button
                    onClick={handleGetStartedClick}
                  className={`w-fit py-[11.6px] px-[28.3px] rounded-[39px] transition-all duration-300 bg-[#5046E5] text-white hover:bg-transparent border border-[#5046E5] hover:text-white text-[18px] leading-[20px] font-medium cursor-pointer`}
                >
                  {enterprisePlan.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
            </div>

        </div>
      </div>

      <SigninModal
        isOpen={isSigninModalOpen}
        onClose={() => setIsSigninModalOpen(false)}
        onOpenForgotPassword={() => setIsForgotPasswordModalOpen(true)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onOpenSignin={() => setIsSigninModalOpen(true)}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default PricingSection;