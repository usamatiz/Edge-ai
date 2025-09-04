import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  tokenExpiry: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent flickering
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state: UserState, action: PayloadAction<{ user: User; accessToken: string; tokenExpiry?: number }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.tokenExpiry = action.payload.tokenExpiry || (Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
      state.isAuthenticated = true;
      state.error = null;
      
      // Save access token and expiry to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('tokenExpiry', state.tokenExpiry.toString());
        // console.log('🔐 Redux: Saved token to localStorage')
      }
    },
    
    updateUser: (state: UserState, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    clearUser: (state: UserState) => {
      // console.log('🔐 Redux: clearUser action called')
      state.user = null;
      state.accessToken = null;
      state.tokenExpiry = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Remove access token and expiry from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenExpiry');
        // console.log('🔐 Redux: Removed token from localStorage')
      }
    },
    
    setLoading: (state: UserState, action: PayloadAction<boolean>) => {
      // console.log('🔐 Redux: setLoading action called with:', action.payload)
      state.isLoading = action.payload;
    },
    
    setError: (state: UserState, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state: UserState) => {
      state.error = null;
    },
    
    checkTokenExpiry: (state: UserState) => {
      // console.log('🔐 Redux: checkTokenExpiry action called')
      // Check localStorage first (for page refresh scenarios)
      if (typeof window !== 'undefined') {
        const storedTokenExpiry = localStorage.getItem('tokenExpiry')
        if (storedTokenExpiry) {
          const expiryTime = parseInt(storedTokenExpiry)
          if (Date.now() > expiryTime) {
            // console.log('🔐 Redux: Token expired in localStorage, clearing...')
            // Token has expired, clear localStorage
            localStorage.removeItem('accessToken')
            localStorage.removeItem('tokenExpiry')
            // Also clear Redux state
            state.user = null
            state.accessToken = null
            state.tokenExpiry = null
            state.isAuthenticated = false
            state.error = null
            return
          }
        }
      }
      
      // Check Redux state (for normal operation)
      if (state.tokenExpiry && Date.now() > state.tokenExpiry) {
        //  console.log('🔐 Redux: Token expired in Redux state, clearing...')
        // Token has expired, clear user data
        state.user = null;
        state.accessToken = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
        state.error = null;
        
        // Remove from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
        }
      }
    },
  },
});

export const { 
  setUser, 
  updateUser, 
  clearUser, 
  setLoading, 
  setError, 
  clearError,
  checkTokenExpiry
} = userSlice.actions;

export default userSlice.reducer;
