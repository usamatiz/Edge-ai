# 💳 Stripe Payment Integration

## Overview

This document outlines the Stripe payment integration for EdgeAI Realty's subscription system. The integration uses Stripe Elements for secure payment processing with a seamless user experience.

## 🏗️ Architecture

### Payment Flow

```
User selects plan → Login check → Payment Intent API → Stripe Elements → Confirm Payment → Backend confirmation → Subscription active
```

### Components

1. **StripeProvider** (`src/components/providers/StripeProvider.tsx`)
   - Wraps components with Stripe context
   - Configures Stripe Elements appearance
   - Loads Stripe with publishable key

2. **PaymentModal** (`src/components/ui/payment-modal.tsx`)
   - Modal wrapper for payment flow
   - Manages payment intent creation
   - Handles success/error states

3. **StripeCheckout** (`src/components/ui/stripe-checkout.tsx`)
   - Stripe Elements payment form
   - Handles payment confirmation
   - Manages loading states and errors

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S0FwKB2p93NE0UDmno6UgFck98LzeVeFkxWZnJiXDMYKnSpy8WMFrS9fcjSC3G1tovRnMAfUCz24C6DMCxCSdZr00T0OcEjk5

# Payment API URL
NEXT_PUBLIC_PAYMENT_API_URL=http://192.168.3.49:4000
```

### Authentication Flow

The integration uses **standardized API service** with full security:

1. **User Login** → JWT token stored in Redux `userSlice` and localStorage
2. **Payment Flow** → Uses `apiService` with CSRF protection
3. **API Calls** → Include both JWT auth and CSRF tokens
4. **Security** → Same pattern as email verification functions (`true, true` options)

### Backend API Endpoints

The integration expects these backend endpoints:

#### 1. Create Payment Intent
```bash
POST http://192.168.3.49:4000/api/subscription/payment-intent
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "planId": "basic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amount": 9900,
    "currency": "usd",
    "paymentIntent": {
      "id": "pi_xxx",
      "client_secret": "pi_xxx_secret_xxx",
      "amount": 9900,
      "currency": "usd",
      "status": "requires_payment_method"
    }
  }
}
```

#### 2. Confirm Payment Intent
```bash
POST http://192.168.3.49:4000/api/subscription/confirm-payment-intent
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_xxx",
    "status": "active",
    "plan": {
      "id": "basic",
      "name": "Basic Plan",
      "price": 2999
    }
  }
}
```

## 💻 Usage

### In Pricing Section

The payment flow is automatically integrated into the pricing section:

1. User clicks "Get Started" on a plan
2. System checks authentication status
3. If authenticated, opens payment modal
4. If not authenticated, opens signin modal first

### Payment Modal Integration

```tsx
import PaymentModal from '@/components/ui/payment-modal';

// In your component
const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

// Handle plan selection
const handlePlanSelection = (plan: PricingPlan) => {
  setSelectedPlan(plan);
  setIsPaymentModalOpen(true);
};

// Render modal
{selectedPlan && (
  <PaymentModal
    isOpen={isPaymentModalOpen}
    onClose={() => {
      setIsPaymentModalOpen(false);
      setSelectedPlan(null);
    }}
    plan={selectedPlan}
    onSuccess={(subscriptionData) => {
      console.log('Payment successful:', subscriptionData);
      // Handle success
    }}
  />
)}
```

## 🛡️ Security Features

### Payment Security
- **PCI Compliance**: Stripe handles all sensitive payment data
- **Tokenization**: No card details stored on your servers
- **3D Secure**: Automatic Strong Customer Authentication (SCA)

### API Security
- **JWT Authentication**: All payment endpoints require valid JWT
- **CORS Protection**: Payment API configured for specific origins
- **SSL/TLS**: All payment communications encrypted

## 🎨 UI/UX Features

### Design
- **Modern Interface**: Clean, branded payment forms
- **Responsive Design**: Works on all device sizes
- **Brand Colors**: Uses EdgeAI purple (#5046E5) theme

### User Experience
- **Real-time Validation**: Instant field validation
- **Loading States**: Clear progress indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Clear confirmation messages

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **High Contrast**: Readable color combinations

## 🔄 Testing

### Test Cards

Use these Stripe test cards:

```bash
# Successful payment
4242424242424242

# Declined payment
4000000000000002

# 3D Secure required
4000000000003220

# Insufficient funds
4000000000009995
```

### Test Flow

1. Select a plan in the pricing section
2. Use test card numbers
3. Fill dummy data (any future date, any CVC)
4. Confirm payment
5. Verify success/error handling

## 📱 Mobile Optimization

- **Touch-friendly**: Large tap targets
- **Responsive Layout**: Adapts to screen size
- **iOS/Android**: Native keyboard support
- **Portrait/Landscape**: Works in both orientations

## 🚀 Deployment

### Environment Setup

1. Add environment variables to your deployment platform
2. Ensure backend API is accessible from frontend
3. Configure CORS for payment API
4. Test with Stripe test keys first

### Production Checklist

- [ ] Replace test Stripe key with live key
- [ ] Update payment API URL to production
- [ ] Configure webhook endpoints
- [ ] Test full payment flow
- [ ] Monitor payment success rates

## 📊 Monitoring

### Key Metrics
- Payment success rate
- Payment abandonment rate
- Error rates by type
- Conversion by plan

### Logging
- All payment attempts logged
- Error details captured
- Success/failure notifications
- User journey tracking

## 🛠️ Troubleshooting

### Common Issues

1. **Payment fails silently**
   - Check network connectivity
   - Verify API endpoints are reachable
   - Check JWT token validity

2. **Stripe Elements not loading**
   - Verify publishable key is correct
   - Check for JavaScript errors
   - Ensure Stripe provider is wrapping components

3. **Payment intent creation fails**
   - Verify backend API is running
   - Check authentication headers
   - Validate plan ID exists

### Debug Mode

Enable debug logging:

```typescript
// In your component
console.log('Payment Intent Response:', response);
console.log('Stripe Elements:', elements);
console.log('Payment Method:', paymentMethod);
```

## 📚 Resources

- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [React Stripe.js](https://github.com/stripe/react-stripe-js)
- [Stripe Testing](https://stripe.com/docs/testing)
