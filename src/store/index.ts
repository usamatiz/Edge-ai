import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import videoReducer from './slices/videoSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    video: videoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/setUser', 'user/clearUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: ['user.user.createdAt', 'user.user.updatedAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
