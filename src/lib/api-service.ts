import { getApiUrl, getAuthHeaders, getAuthenticatedHeaders, API_CONFIG } from './config';
import { toast } from 'sonner';
// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserData {
  id: string;           // Backend sends 'id', not '_id'
  email: string;
  firstName: string;
  lastName: string;
  phone: string;        // Backend sends 'phone' field
  isEmailVerified: boolean;
  googleId?: string;    // Google login includes this field
  // Backend doesn't send createdAt/updatedAt in auth responses
}

export interface UserResponse {
  success: boolean;
  data: {
    user: UserData;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: UserData;
  isNewUser?: boolean;  // Google login includes this field
}

// Video Types
export interface VideoData {
  id: string;
  videoId: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
  };
  downloadUrl?: string;
}

export interface VideoGalleryResponse {
  videos: VideoData[];
  totalCount: number;
  readyCount: number;
  processingCount: number;
  failedCount: number;
}

// CSRF Token Response
export interface CSRFResponse {
  token: string;
  expires: number;
}

// Payment Types
export interface PaymentIntentRequest {
  planId: string;
}

export interface PaymentIntentResponse {
  amount: number;
  currency: string;
  paymentIntent: {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
    [key: string]: any;
  };
}

export interface SubscriptionData {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  videoCount: number;
  videoLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription: SubscriptionData;
  };
}

// Billing History Types
export interface BillingTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  stripeInvoiceId: string;
  stripePaymentIntentId: string;
  subscriptionId: string;
  planId: string;
  createdAt: string;
  updatedAt: string;
  formattedAmount: string;
}

export interface BillingHistoryResponse {
  success: boolean;
  message: string;
  data: {
    transactions: BillingTransaction[];
    total: number;
    hasMore: boolean;
  };
}

// Payment Methods Types
export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  isExpired: boolean;
}

export interface PaymentMethodsResponse {
  success: boolean;
  message: string;
  data: {
    paymentMethods: PaymentMethod[];
  };
}

export interface SetupIntentResponse {
  success: boolean;
  message: string;
  data: {
    setupIntent: {
      id: string;
      client_secret: string;
    };
  };
}

export interface UpdatePaymentMethodRequest {
  setupIntentId: string;
  setAsDefault: boolean;
}

export interface UpdatePaymentMethodResponse {
  success: boolean;
  message: string;
  data: {
    paymentMethod: PaymentMethod;
  };
}


// API Service Class
class ApiService {
  // Global loading state management
  private globalLoadingCallback: ((loading: boolean, message?: string) => void) | null = null;

  setGlobalLoadingCallback(callback: (loading: boolean, message?: string) => void) {
    this.globalLoadingCallback = callback;
  }

  private setGlobalLoading(loading: boolean, message?: string) {
    if (this.globalLoadingCallback) {
      this.globalLoadingCallback(loading, message);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false,
    requireCSRF: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    const headers = requireAuth 
      ? getAuthenticatedHeaders(requireCSRF)
      : getAuthHeaders(requireCSRF);

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`API request failed: ${errorMessage}`);
      throw error;
    }
  }

  // CSRF Token Management
  async getCSRFToken(): Promise<string> {
    const response = await this.request<CSRFResponse>(API_CONFIG.ENDPOINTS.AUTH.CSRF_TOKEN);
    if (response.success && response.data?.token) {
      localStorage.setItem('csrfToken', response.data.token);
      return response.data.token;
    }
    throw new Error('Failed to get CSRF token');
  }

  // Authentication Methods
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false, true);
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(loginData),
    }, false, true);
  }

  async logout(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    }, true, true);
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: UserData }>> {
    return this.request<{ user: UserData }>(API_CONFIG.ENDPOINTS.AUTH.ME, {
      method: 'GET',
    }, true, false);
  }

  async updateProfile(profileData: Partial<UserData>): Promise<ApiResponse<{ user: UserData }>> {
    return this.request<{ user: UserData }>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, true, true);
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false, true);
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ resetToken: token, newPassword: password }),
    }, false, true);
  }

  async validateResetToken(token: string): Promise<ApiResponse<{ isValid: boolean }>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<{ isValid: boolean }>(API_CONFIG.ENDPOINTS.AUTH.VALIDATE_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, false, true);
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async googleLogin(googleData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, {
      method: 'POST',
      body: JSON.stringify(googleData),
    }, false, true);
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false, true);
  }

  async getVideoGallery(): Promise<ApiResponse<{
    videos: any[];
    totalCount: number;
    readyCount: number;
    processingCount: number;
    failedCount: number;
  }>> {
    return this.request<{
      videos: any[];
      totalCount: number;
      readyCount: number;
      processingCount: number;
      failedCount: number;
    }>(API_CONFIG.ENDPOINTS.VIDEO.GALLERY, {
      method: 'GET',
    }, true, false);
  }

  async createVideo(videoData: any): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.VIDEO.CREATE, {
      method: 'POST',
      body: JSON.stringify(videoData),
    }, true, true);
  }

  async deleteVideo(videoId: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VIDEO.DELETE}/${videoId}`, {
      method: 'DELETE',
    }, true, false);
  }

  async getVideoStatus(videoId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO.STATUS}/${videoId}`, {
      method: 'GET',
    }, true, false);
  }

  async downloadVideo(videoId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.VIDEO.DOWNLOAD}/${videoId}`, {
      method: 'GET',
    }, true, false);
  }

  async downloadVideoFromUrl(videoUrl: string, userId: string, title: string): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.VIDEO.DOWNLOAD, {
      method: 'POST',
      body: JSON.stringify({
        videoUrl,
        userId,
        title
      }),
    }, true, true);
  }

  async generateVideo(videoData: any): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.VIDEO.GENERATE, {
      method: 'POST',
      body: JSON.stringify(videoData),
    }, true, true);
  }

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.request<{ exists: boolean }>(`${API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    }, false, false);
  }

  async checkEmailVerification(email: string): Promise<ApiResponse<{ isVerified: boolean }>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<{ isVerified: boolean }>(API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false, true);
  }

  // Contact Form
  async sendContactMessage(messageData: {
    name: string;
    email: string;
    message: string;
  }): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.CONTACT, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.HEALTH, {
      method: 'GET',
    });
  }

  // Payment Methods - Using JWT auth with CSRF protection like email functions
  async createPaymentIntent(planId: string): Promise<ApiResponse<PaymentIntentResponse>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<PaymentIntentResponse>(API_CONFIG.ENDPOINTS.PAYMENT.PAYMENT_INTENT, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }, true, true);
  }

  // Subscription Methods
  async getPricingPlans(): Promise<ApiResponse<{ plans: any[] }>> {
    return this.request<{ plans: any[] }>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS, {
      method: 'GET',
    }, false, false);
  }

  async getCurrentSubscription(): Promise<ApiResponse<{ subscription: SubscriptionData }>> {
    return this.request<{ subscription: SubscriptionData }>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CURRENT, {
      method: 'GET',
    }, true, false);
  }

  async getBillingHistory(): Promise<ApiResponse<{ transactions: BillingTransaction[]; total: number; hasMore: boolean }>> {
    return this.request<{ transactions: BillingTransaction[]; total: number; hasMore: boolean }>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.BILLING_HISTORY, {
      method: 'GET',
    }, true, false);
  }

  async changeSubscriptionPlan(newPlanId: string): Promise<ApiResponse<any>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<any>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CHANGE_PLAN, {
      method: 'POST',
      body: JSON.stringify({ newPlanId }),
    }, true, true);
  }

  async cancelSubscription(): Promise<ApiResponse<any>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<any>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL, {
      method: 'POST',
    }, true, true);
  }

  // Payment Methods API
  async getPaymentMethods(): Promise<ApiResponse<{ paymentMethods: PaymentMethod[] }>> {
    return this.request<{ paymentMethods: PaymentMethod[] }>(API_CONFIG.ENDPOINTS.PAYMENT.METHODS, {
      method: 'GET',
    }, true, false);
  }

  async createSetupIntent(): Promise<ApiResponse<{ setupIntent: { id: string; client_secret: string } }>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<{ setupIntent: { id: string; client_secret: string } }>(API_CONFIG.ENDPOINTS.PAYMENT.SETUP_INTENT, {
      method: 'POST',
    }, true, true);
  }

  async updatePaymentMethod(data: UpdatePaymentMethodRequest): Promise<ApiResponse<{ paymentMethod: PaymentMethod }>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<{ paymentMethod: PaymentMethod }>(API_CONFIG.ENDPOINTS.PAYMENT.UPDATE, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true, true);
  }

  async setDefaultPaymentMethod(cardId: string): Promise<ApiResponse<any>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    console.log('Setting default payment method:', cardId);
    console.log('Endpoint:', `${API_CONFIG.ENDPOINTS.PAYMENT.SET_DEFAULT}/${cardId}/set-default`);
    
    return this.request<any>(`${API_CONFIG.ENDPOINTS.PAYMENT.SET_DEFAULT}/${cardId}/set-default`, {
      method: 'POST',
    }, true, true);
  }

  async deletePaymentMethod(cardId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`${API_CONFIG.ENDPOINTS.PAYMENT.DELETE}/${cardId}`, {
      method: 'DELETE',
    }, true, true);
  }

  // Critical operations that should use global loading
  async registerWithGlobalLoading(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    this.setGlobalLoading(true, 'Creating your account...');
    try {
      const result = await this.register(userData);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async loginWithGlobalLoading(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    this.setGlobalLoading(true, 'Signing you in...');
    try {
      const result = await this.login(loginData);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async resetPasswordWithGlobalLoading(token: string, password: string): Promise<ApiResponse> {
    this.setGlobalLoading(true, 'Resetting your password...');
    try {
      const result = await this.resetPassword(token, password);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async createPaymentIntentWithGlobalLoading(planId: string): Promise<ApiResponse<PaymentIntentResponse>> {
    this.setGlobalLoading(true, 'Preparing payment...');
    try {
      const result = await this.createPaymentIntent(planId);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async changeSubscriptionPlanWithGlobalLoading(newPlanId: string): Promise<ApiResponse<any>> {
    this.setGlobalLoading(true, 'Updating your subscription...');
    try {
      const result = await this.changeSubscriptionPlan(newPlanId);
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }

  async cancelSubscriptionWithGlobalLoading(): Promise<ApiResponse<any>> {
    this.setGlobalLoading(true, 'Cancelling your subscription...');
    try {
      const result = await this.cancelSubscription();
      return result;
    } finally {
      this.setGlobalLoading(false);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
