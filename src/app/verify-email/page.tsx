'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerifiedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      // Prevent multiple verification attempts for the same token
      if (hasVerifiedRef.current || !token || tokenRef.current === token) {
        return;
      }

      // Store the token to prevent re-verification
      tokenRef.current = token;
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        hasVerifiedRef.current = true;
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          hasVerifiedRef.current = true;
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed');
          hasVerifiedRef.current = true;
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
        hasVerifiedRef.current = true;
      }
    };

    verifyEmail();
  }, [searchParams]); // Include searchParams in dependency array

  // Prevent any state updates if component unmounts or verification is complete
  useEffect(() => {
    return () => {
      hasVerifiedRef.current = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[820px] w-full">
        <div className="bg-white rounded-[12px] md:px-[55px] px-4 pt-10 pb-10 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="md:text-[48px] text-[25px] font-semibold text-[#282828] mb-2">
              Email <span className="text-[#5046E5]">Verification</span>
            </h1>
            <p className="text-[#667085] text-[16px]">
              Verifying your email address to complete your registration
            </p>
          </div>
          
          {/* Content */}
          <div className="text-center">
            {status === 'loading' && (
              <div className="py-12">
                <div className="flex justify-center mb-6">
                  <Loader2 className="w-16 h-16 text-[#5046E5] animate-spin" />
                </div>
                <h3 className="text-2xl font-semibold text-[#282828] mb-2">
                  Verifying Your Email
                </h3>
                <p className="text-[#667085] text-[16px]">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="py-12">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-[#282828] mb-2">
                  Success!
                </h3>
                <p className="text-[#667085] text-[16px] mb-6">
                  {message}
                </p>
                <p className="text-[#5F5F5F] text-[14px] mb-8">
                  What would you like to do next?
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/?verified=true')}
                    className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5] transition-colors duration-300 cursor-pointer"
                  >
                    Go to Home Page
                  </button>
                  {/* <button
                    onClick={() => router.push('/?showLogin=true')}
                    className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 border-[#5046E5] text-[#5046E5] hover:bg-[#5046E5] hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    Sign In Now
                  </button> */}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="py-12">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-[#282828] mb-2">
                  Verification Failed
                </h3>
                <p className="text-[#667085] text-[16px] mb-8">
                  {message}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-[11.4px] px-6 rounded-full font-semibold text-[20px] border-2 bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5] transition-colors duration-300 cursor-pointer"
                >
                  Go to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[820px] w-full">
        <div className="bg-white rounded-[12px] md:px-[55px] px-4 pt-10 pb-10 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="md:text-[48px] text-[25px] font-semibold text-[#282828] mb-2">
              Email <span className="text-[#5046E5]">Verification</span>
            </h1>
            <p className="text-[#667085] text-[16px]">
              Loading verification page...
            </p>
          </div>
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-[#5046E5] animate-spin" />
            </div>
            <p className="text-[#667085] text-[16px]">
              Loading...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}