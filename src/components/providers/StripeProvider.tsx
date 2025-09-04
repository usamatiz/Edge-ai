"use client";

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { API_CONFIG } from '@/lib/config';

// Initialize Stripe outside of component to avoid recreating the Stripe object on every render
const stripePromise = loadStripe('pk_test_51S0FwKB2p93NE0UDmno6UgFck98LzeVeFkxWZnJiXDMYKnSpy8WMFrS9fcjSC3G1tovRnMAfUCz24C6DMCxCSdZr00T0OcEjk5');

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#5046E5',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      rules: {
        '.Tab': {
          border: '1px solid #E3E8EE',
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
        },
        '.Tab:hover': {
          color: '#5046E5',
        },
        '.Tab--selected': {
          borderColor: '#5046E5',
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px #5046E5',
        },
        '.Input': {
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
        },
        '.Input:focus': {
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02), 0 0 0 2px #5046E5',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
}
