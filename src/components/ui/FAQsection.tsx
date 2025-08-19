import React, { useState } from 'react';
import { ChevronDown, Info, Heart, Users, MessageCircle, Calendar, Minus, CreditCard, Shield, Settings, HelpCircle, FileText, Zap, Lock, Clock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: LucideIcon;
}

interface FAQData {
  [key: string]: FAQItem[];
}

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState('Series & Videos');
  const [openAccordion, setOpenAccordion] = useState<string | null>('What is Edge Ai Realty?');

  const tabs = [
    'Series & Videos',
    'Billing', 
    'Account',
    'Technical'
  ];

  const faqData: FAQData = {
    'Series & Videos': [
      {
        id: 'What is Edge Ai Realty?',
        question: 'What is Edge Ai Realty?',
        answer: 'Edge Ai Realty is a cutting-edge platform that empowers real estate professionals to create high-quality, customized AI-generated videos for property listings, market updates, and personal branding. Our goal is to streamline your marketing efforts, saving you time and enhancing your online presence.',
        icon: Info
      },
      {
        id: 'subscription-plans',
        question: 'What are the differences between the subscription plans?',
        answer: 'Our subscription plans vary in features and video generation limits. Higher tiers include more advanced AI features, priority processing, and additional customization options.',
        icon: Heart
      },
      {
        id: 'multiple-avatars',
        question: 'Can I use multiple avatars in my videos?',
        answer: 'Yes, depending on your subscription plan, you can create and use multiple AI avatars to diversify your video content and match different marketing needs.',
        icon: Users
      },
      {
        id: 'quarterly-session',
        question: 'What is included in the quarterly strategy session?',
        answer: 'The quarterly strategy session includes personalized consultation on video marketing strategies, content planning, and optimization tips to maximize your ROI.',
        icon: MessageCircle
      },
      {
        id: 'more-videos',
        question: 'What if I need more videos than my plan offers?',
        answer: 'You can either upgrade your plan or purchase additional video credits as add-ons. Contact our support team to discuss the best option for your needs.',
        icon: Calendar
      }
    ],
    'Billing': [
      {
        id: 'payment-methods',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through our payment partners.',
        icon: CreditCard
      },
      {
        id: 'billing-cycle',
        question: 'When will I be charged for my subscription?',
        answer: 'You will be charged immediately upon subscription activation. For monthly plans, you will be charged on the same date each month. For annual plans, you will be charged once per year on your subscription anniversary.',
        icon: Calendar
      },
      {
        id: 'refund-policy',
        question: 'What is your refund policy?',
        answer: 'We offer a 30-day money-back guarantee for new subscribers. If you are not satisfied with our service within the first 30 days, you can request a full refund. Refunds are processed within 5-7 business days.',
        icon: Shield
      },
      {
        id: 'upgrade-downgrade',
        question: 'Can I upgrade or downgrade my plan?',
        answer: 'Yes, you can upgrade your plan at any time and the new features will be available immediately. For downgrades, changes will take effect at the next billing cycle. Prorated credits may apply for upgrades.',
        icon: Settings
      }
    ],
    'Account': [
      {
        id: 'account-setup',
        question: 'How do I set up my account?',
        answer: 'Setting up your account is simple. After registration, you will receive a welcome email with setup instructions. You can then customize your profile, upload your branding materials, and start creating your first AI video.',
        icon: Users
      },
      {
        id: 'password-reset',
        question: 'How do I reset my password?',
        answer: 'Click on the "Forgot Password" link on the login page. Enter your email address and we will send you a secure link to reset your password. The link expires after 24 hours for security.',
        icon: Lock
      },
      {
        id: 'profile-customization',
        question: 'Can I customize my profile and branding?',
        answer: 'Yes, you can fully customize your profile with your company logo, colors, and branding elements. These will be automatically applied to all videos you create, ensuring consistent brand representation.',
        icon: Settings
      },
      {
        id: 'team-members',
        question: 'Can I add team members to my account?',
        answer: 'Yes, depending on your subscription plan, you can add team members with different permission levels. Team members can collaborate on video projects while maintaining your brand consistency.',
        icon: Users
      }
    ],
    'Technical': [
      {
        id: 'video-quality',
        question: 'What video quality and formats are supported?',
        answer: 'We support HD (1080p) and 4K video quality. Videos are exported in MP4 format, which is compatible with all major platforms including social media, websites, and email marketing tools.',
        icon: Zap
      },
      {
        id: 'ai-technology',
        question: 'What AI technology powers your video generation?',
        answer: 'Our platform uses advanced AI models including natural language processing, computer vision, and voice synthesis. We continuously update our technology to ensure the highest quality and most realistic results.',
        icon: HelpCircle
      },
      {
        id: 'processing-time',
        question: 'How long does it take to generate a video?',
        answer: 'Video generation typically takes 2-5 minutes depending on length and complexity. Premium subscribers get priority processing with faster generation times. You will receive an email notification when your video is ready.',
        icon: Clock
      },
      {
        id: 'data-security',
        question: 'How secure is my data and content?',
        answer: 'We take data security seriously. All content is encrypted in transit and at rest. We use industry-standard security protocols and never share your data with third parties. Your videos and account information are protected.',
        icon: Shield
      }
    ]
  };

  const currentFAQs = faqData[activeTab] || [];

  const toggleAccordion = (questionId: string) => {
    setOpenAccordion(openAccordion === questionId ? null : questionId);
  };

  return (
    <section className="max-w-[1260px] mx-auto px-3 py-12 sm:py-16 lg:py-20" aria-labelledby="faq-heading">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <h1 
          id="faq-heading"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold mb-2 sm:mb-4 lg:mb-1" 
          style={{ color: '#171717' }}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg lg:text-[20px] leading-[24px] font-normal px-4 sm:px-0" style={{ color: '#5F5F5F' }}>
          Find answers to common questions about our AI video service.
        </p>
      </div>

      {/* Tabs */}
      <div 
        className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-5 mb-6 sm:mb-8 lg:mb-10 bg-[#ECEFFD] rounded-[30px] sm:rounded-[40px] lg:rounded-[60px] px-2 sm:px-3 lg:px-4 py-4 sm:py-1.5 lg:py-2 w-fit mx-auto"
        role="tablist"
        aria-label="FAQ categories"
      >
        {tabs.map((tabName) => {
          const isActive = activeTab === tabName;

          return (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-[6.4px] rounded-full cursor-pointer text-sm sm:text-base md:text-lg lg:text-[20px] leading-tight sm:leading-normal lg:leading-[32px] font-semibold transition-all duration-300 whitespace-nowrap
                  ${isActive
                  ? `text-white bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] hover:!bg-transparent hover:text-white hover:border-2 hover:border-[#5046E5]`
                  : `text-[#5046E5] border-2 border-[#5046E5] bg-transparent
                      hover:bg-gradient-to-r hover:from-[#5046E5] hover:to-[#3A2DFD] hover:text-white`
                  }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`faq-panel-${tabName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tabName}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordions */}
      <div 
        className="space-y-3 sm:space-y-4 lg:space-y-6 bg-[#FAFAFA] rounded-[12px] sm:rounded-[14px] lg:rounded-[16px] p-3 sm:p-4 lg:p-6"
        role="tabpanel"
        id={`faq-panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
        aria-labelledby={`faq-tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {currentFAQs.map((faq: FAQItem, index: number) => {
          const IconComponent = faq.icon;
          const isOpen = openAccordion === faq.id;
          
          return (
            <div
              key={faq.id}
              className="overflow-hidden transition-all duration-300 rounded-none hover:rounded-[12px] sm:hover:rounded-[14px] lg:hover:rounded-[16px] border-b border-[#F1F2F9] mb-0"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5 lg:py-8 cursor-pointer text-left flex items-center justify-between transition-all duration-200"
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-6 flex-1 min-w-0">
                  <div 
                    className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] lg:w-[40px] lg:h-[40px] rounded-full flex items-center justify-start transition-all duration-300 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <IconComponent 
                      size={18} 
                      className="sm:w-[24px] sm:h-[24px] lg:w-[30px] lg:h-[30px]"
                      color={isOpen ? '#4A3AFF' : '#A0A3BD'}
                    />
                  </div>
                  <h3 
                    className="text-base sm:text-[20px] md:text-[24px] lg:text-[32px] leading-tight sm:leading-normal lg:leading-[32px] font-semibold flex-1 min-w-0"
                    style={{ color: '#101010' }}
                  >
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-2 sm:ml-3 lg:ml-4">
                  {isOpen ? (
                    <Minus
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-[28px] lg:h-[28px] transition-all duration-300"
                      style={{ color: '#4A3AFF' }}
                      aria-hidden="true"
                    />
                                      ) : (
                      <ChevronDown
                        className="w-5 h-5 sm:w-6 sm:h-6 lg:w-[28px] lg:h-[28px] transition-all duration-300"
                        style={{ color: '#A0A3BD' }}
                        aria-hidden="true"
                      />
                    )}
                </div>
              </button>
              
              <div
                id={`faq-content-${faq.id}`}
                className={`transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={!isOpen}
              >
                <div className="px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                  <div className="pl-0 sm:pl-[41px] lg:pl-[28px] ml-0 sm:ml-2 lg:ml-6">
                    <p 
                      className="text-sm sm:text-[18px] lg:text-[20px] leading-relaxed sm:leading-normal lg:leading-[28px] font-normal"
                      style={{ color: '#5F5F5F' }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

export default FAQSection;