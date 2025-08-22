import React, { useState } from 'react';
import { Info, MessageCircle, Minus, Shield, Settings, HelpCircle, Play, Layers, UserCheck, Headphones, DollarSign, RefreshCw, Download, Edit, FileText, Video, Smartphone, Plus } from 'lucide-react';
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
  const [openAccordion, setOpenAccordion] = useState<string | null>('what-is-edge-ai-realty');

  const tabs = [
    'Series & Videos',
    'Billing', 
    'Account',
    'Technical'
  ];

  const faqData: FAQData = {
    'Series & Videos': [
      {
        id: 'what-is-edge-ai-realty',
        question: 'What is Edge Ai Realty?',
        answer: 'Edge Ai Realty is a cutting-edge platform that empowers real estate professionals to create high-quality, customized Ai-generated videos for property listings, market updates, and personal branding. Our goal is to streamline your marketing efforts, saving you time and enhancing your online presence.',
        icon: Info
      },
      {
        id: 'subscription-plan-differences',
        question: 'What are the differences between the subscription plans?',
        answer: 'Starter ($99 one-time): Includes one Ai-generated video and one avatar. Ideal for trying out our service. Growth ($199/month): Offers four Ai-generated videos per month with one avatar. Suitable for regular content creation. Pro ($399/month): Provides 12 Ai-generated videos per month with one avatar and includes a quarterly 30-minute strategy session. Designed for serious marketers. Enterprise ($799+/month): Delivers 25+ Ai-generated videos per month with up to three avatars, advanced customization, and a quarterly strategy session. Tailored for large teams and brokerages.',
        icon: Layers
      },
      {
        id: 'multiple-avatars-availability',
        question: 'Can I use multiple avatars in my videos?',
        answer: 'Multiple avatars are available exclusively in our Enterprise plan, which includes up to three avatars. Our Starter, Growth, and Pro plans include one avatar.',
        icon: UserCheck
      },
      {
        id: 'quarterly-strategy-session',
        question: 'What is included in the quarterly strategy session?',
        answer: 'The quarterly strategy session is a 30-minute call with our team to discuss your marketing goals, review past video performance, and plan future content strategies. This session is included in the Pro and Enterprise plans.',
        icon: MessageCircle
      },
      {
        id: 'how-to-get-started',
        question: 'How do I get started?',
        answer: 'Choose the plan that best fits your needs and complete the sign-up process on our website. You\'ll then go through our onboarding process to set up your avatar and provide information for your first video.',
        icon: Play
      },
      {
        id: 'need-more-videos',
        question: 'What if I need more videos than my plan offers?',
        answer: 'If you require additional videos beyond your plan\'s allocation, please contact our sales team to discuss custom solutions or upgrading to a higher-tier plan.',
        icon: Video
      },
      {
        id: 'contract-cancellation-policy',
        question: 'Is there a contract or can I cancel anytime?',
        answer: 'Our Starter plan is a one-time purchase. The Growth, Pro, and Enterprise plans are monthly subscriptions with no long-term contracts. You can cancel anytime before your next billing cycle.',
        icon: RefreshCw
      },
      {
        id: 'support-options',
        question: 'What kind of support do you offer?',
        answer: 'Starter Plan: Email support with a 24–48 hour response time. Growth Plan: Priority email support with responses within 24 hours. Pro and Enterprise Plans: Priority email support with responses within 12 hours, plus quarterly strategy sessions.',
        icon: Headphones
      },
      {
        id: 'plan-upgrade-downgrade',
        question: 'Can I upgrade or downgrade my plan?',
        answer: 'Yes, you can change your subscription plan at any time through your account settings or by contacting our support team. Changes will take effect in the next billing cycle.',
        icon: Settings
      },
    ],
    'Billing': [
      {
        id: 'manage-subscription',
        question: 'How do I manage my subscription?',
        answer: 'You can update or cancel your plan anytime from your account dashboard or by emailing our support team.',
        icon: Settings
      },
      {
        id: 'when-am-i-billed',
        question: 'When am I billed?',
        answer: 'All subscriptions are billed monthly on the date of your original sign-up.',
        icon: DollarSign
      },
      {
        id: 'cancel-anytime',
        question: 'Can I cancel anytime?',
        answer: 'Yes. You\'ll retain access to your plan until the end of your billing period — no penalties or surprise fees.',
        icon: Shield
      },
    ],
    'Account': [
      {
        id: 'access-my-videos',
        question: 'How do I access my videos?',
        answer: 'Once your videos are ready, you\'ll get an email notification with a download link and social-ready formats.',
        icon: Download
      },
      {
        id: 'update-avatar-branding',
        question: 'Can I update my avatar or branding later?',
        answer: 'Yes — you can request changes anytime. Growth and Pro plans allow moderate edits; Enterprise plans get full brand flexibility.',
        icon: Edit
      },
    ],
    'Technical': [
      {
        id: 'video-file-issues',
        question: 'What if I have issues with my video or files?',
        answer: 'Just email us — we\'ll resolve most issues within 24 hours. Pro and Enterprise users get response priority.',
        icon: HelpCircle
      },
      {
        id: 'special-software-needed',
        question: 'Do I need special software to use the videos?',
        answer: 'Nope. All videos are delivered in standard MP4 formats, ready for upload to Instagram, YouTube, TikTok, and more.',
        icon: Smartphone
      },
      {
        id: 'preview-scripts-changes',
        question: 'Can I preview scripts or request changes?',
        answer: 'Yes. All plans include some level of script customization. Pro and Enterprise plans come with optimization and review built-in.',
        icon: FileText
      },
    ]
  };

  const currentFAQs = faqData[activeTab] || [];

  const toggleAccordion = (questionId: string) => {
    setOpenAccordion(openAccordion === questionId ? null : questionId);
  };

  return (
    <section className="max-w-[1260px] mx-auto px-3 py-4 lg:py-10" aria-labelledby="faq-heading">
      {/* Header */}
        
        <div className="text-center mb-8 sm:mb-12 lg:mb-16" id="faq">
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
                      <Plus
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