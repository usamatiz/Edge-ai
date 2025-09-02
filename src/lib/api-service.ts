import { getApiUrl, getAuthHeaders, getAuthenticatedHeaders } from './config';

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

// API Service Class
class ApiService {
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // CSRF Token Management
  async getCSRFToken(): Promise<string> {
    const response = await this.request<CSRFResponse>('/api/auth/csrf-token');
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
    
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false, true);
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    }, false, true);
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    }, true, true);
  }

  async getCurrentUser(): Promise<ApiResponse<UserData>> {
    return this.request<UserData>('/api/auth/me', {
      method: 'GET',
    }, true);
  }

  async updateProfile(profileData: Partial<UserData>): Promise<ApiResponse<UserData>> {
    return this.request<UserData>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, true, true);
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false, true);
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken: token, newPassword: password }),
    }, false, true);
  }

  async validateResetToken(token: string): Promise<ApiResponse<{ isValid: boolean }>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<{ isValid: boolean }>('/api/auth/validate-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, false, true);
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/api/auth/verify-email?token=${token}`, {

        
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
    
    return this.request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    }, false, true);
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false, true);
  }

  async getVideoGallery(): Promise<ApiResponse<{ videos: any[] }>> {
    return this.request<{ videos: any[] }>('/api/video/gallery', {
      method: 'GET',
    }, true, false);
  }

  async deleteVideo(videoId: string): Promise<ApiResponse> {
    return this.request(`/api/video/${videoId}`, {
      method: 'DELETE',
    }, true, false);
  }

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.request<{ exists: boolean }>(`/api/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    }, false, false);
  }

  async checkEmailVerification(email: string): Promise<ApiResponse<{ isVerified: boolean }>> {
    // Get CSRF token first
    await this.getCSRFToken();
    
    return this.request<{ isVerified: boolean }>('/api/auth/check-email-verification', {
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
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health', {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
