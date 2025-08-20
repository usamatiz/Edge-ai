'use client'

import Link from 'next/link';
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1030px] mx-auto xl:px-0 px-3 py-8 md:py-14 lg:py-20">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-[35px] md:text-[42px] font-semibold text-[#171717] leading-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl lg:text-[20px] text-[#5F5F5F] max-w-[700px] font-normal mx-auto leading-[24px]">
            Your data, your control — we collect only what&apos;s needed,<br className="hidden md:block" />
            keep it secure, and never share it without consent.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 lg:space-y-12">
          {/* Privacy Policy Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              Privacy Policy
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              EdgeAi Realty built the EdgeAi Realty app as a Freemium app. This SERVICE is provided by EdgeAi Realty at no cost and is intended for use as is.<br />This page is used to inform visitors regarding my policies with the collection, use, and disclosure of Personal Information if anyone decided to use my Service.
              </p>
              <p className="!font-barlow">
              If you choose to use my Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that I collect is used for providing and improving the Service. I will not use or share your information with anyone except as described in this Privacy Policy.<br />The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible at EdgeAi Realty unless otherwise defined in this Privacy Policy.
              </p>
            </div>
          </section>

          {/* Information Collection and Use Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              Information Collection and Use
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              For a better experience, while using our Service, I may require you to provide us with certain personally identifiable information, including but not limited to Name, Date of birth, Geo location, Email address, Phone number. The information that I request will be retained on your device and is not collected by me in any way.
              </p>
              <p className="!font-barlow">               
                The app does use third-party services that may collect information used to identify you. <br />
                Link to the privacy policy of third-party service providers used by the app
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#0070D8] mt-5 !font-barlow">
                <li><Link href="https://policies.google.com/privacy" target="_blank" className="hover:underline !font-barlow">Google Play Services</Link></li>
                <li><Link href="https://firebase.google.com/policies/analytics" target="_blank" className="hover:underline !font-barlow">Google Analytics for Firebase</Link></li>
                <li><Link href="https://firebase.google.com/policies/crashlytics" target="_blank" className="hover:underline !font-barlow">Firebase Crashlytics</Link></li>
                <li><Link href="https://www.facebook.com/policies/cookies/" target="_blank" className="hover:underline !font-barlow">Facebook</Link></li>
              </ul>
            </div>
          </section>

          {/* Log Data Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              Log Data
            </h2>
            <p className="!font-barlow text-[#2A2A2A] text-base font-medium leading-[24px]">
            I want to inform you that whenever you use my Service, in a case of an error in the app I collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing my Service, the time and date of your use of the Service, and other statistics.
            </p>
          </section>

          {/* Cookies Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              Cookies
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device&apos;s internal memory.
              </p>
              <p className="!font-barlow">
              This Service does not use these “cookies” explicitly. However, the app may use third-party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
              </p>
            </div>
          </section>

          {/* Service Providers Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Service Providers
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              I may employ third-party companies and individuals due to the following reasons:
              </p>
            </div>
            <ul className="list-disc !font-barlow pl-6 space-y-2 mt-5 text-[#2A2A2A] text-base font-medium leading-[24px]">
                <li className="!font-barlow">To facilitate our Service;</li>
                <li className="!font-barlow">To provide the Service on our behalf;</li>
                <li className="!font-barlow">To perform Service-related services; or</li>
                <li className="!font-barlow">To assist us in analyzing how our Service is used.</li>
            </ul>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px] mt-1">
              <p className="!font-barlow">
              I want to inform users of this Service that these third parties have access to their Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
              </p>
            </div>
          </section>

          {/* Security Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Security
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              I value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and I cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          {/* Links to Other Sites Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Links to Other Sites
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by me. Therefore, I strongly advise you to review the Privacy Policy of these websites. I have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </div>
          </section>

          {/* Children’s Privacy Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Children&apos;s Privacy
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              These Services do not address anyone under the age of 13. I do not knowingly collect personally identifiable information from children under 13 years of age. In the case I discover that a child under 13 has provided me with personal information, I immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact me so that I will be able to do the necessary actions.
              </p>
            </div>
          </section>

          {/* Changes to This Privacy Policy Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Changes to This Privacy Policy
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              I may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. I will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
              <p className="!font-barlow">
              This policy is effective as of 2022-05-26
              </p>
            </div>
          </section>

          {/* Contact Us Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Contact Us
            </h2>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
              If you have any questions or suggestions about my Privacy Policy, do not hesitate to contact me at <Link href="mailto:matthew.quatrani@gmail.com" className="text-[#0070D8] hover:underline">matthew.quatrani@gmail.com</Link>.
              </p>
            </div>
          </section>

          {/* Delete Account Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
            Delete Account
            </h2>

            <h4 className="text-[16px] !font-bold text-[#2A2A2A] !font-quicksand mb-[1px] mt-7">Organizer – Account Deletion Policy</h4>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-quicksand">
              Organizers do not have the ability to delete their accounts directly due to their role in managing match-related payments and responsibilities. Since organizers are accountable for handling bookings and issuing refunds in the event of match cancellations, account deletion is restricted to ensure financial integrity and user protection. If an organizer wishes to close their account, they must first settle all pending transactions and contact support for further assistance. This policy ensures accountability and a smooth experience for all participants involved in the platform.
              </p>
            </div>

            <h4 className="text-[16px] !font-bold text-[#2A2A2A] !font-quicksand mb-[1px] mt-7">
                Player – Account Deletion Feature
            </h4>
            <div className="space-y-[1px] text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-quicksand">
              Players have full control over their account and can permanently delete it at any time without restrictions. This option is easily accessible within the Profile section of the app. By navigating to their profile settings, players will find a clearly labeled &quot;Delete Account&quot; button. Upon confirmation, all associated data will be securely removed from the system, and the user will be logged out automatically. This ensures a smooth and transparent account management experience, respecting the user&apos;s control over their personal data.
              </p>
            </div>            
          </section>                                                             
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;


