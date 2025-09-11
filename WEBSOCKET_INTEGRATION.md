# WebSocket Integration for Photo Avatar Creation

## Overview

This implementation provides real-time notifications for photo avatar creation using WebSocket connections. Users will receive live updates about their avatar creation progress instead of waiting without feedback.

## Architecture

### Components Created

1. **`usePhotoAvatarNotifications` Hook** (`src/hooks/usePhotoAvatarNotifications.ts`)
   - Manages WebSocket connection
   - Handles user-specific room joining
   - Provides notification state management

2. **`PhotoAvatarNotification` Component** (`src/components/ui/photo-avatar-notification.tsx`)
   - Displays real-time progress notifications
   - Shows connection status
   - Provides step-by-step progress visualization

3. **`PhotoAvatarNotificationProvider`** (`src/components/providers/PhotoAvatarNotificationProvider.tsx`)
   - Global provider for WebSocket notifications
   - Integrates with Redux user state
   - Provides context for components

4. **Updated `Step8Details`** (`src/components/ui/avatar-creation/steps/Step8Details.tsx`)
   - Integrated with WebSocket notifications
   - Prevents multiple simultaneous avatar creations
   - Shows processing state

## WebSocket Events

### Client → Server Events

- **`join-room`**: Join user-specific room for notifications
  ```typescript
  socket.emit('join-room', userId)
  ```

### Server → Client Events

- **`photo-avatar-update`**: Progress updates during avatar creation
  ```typescript
  {
    step: 'upload' | 'group-creation' | 'training' | 'saving' | 'complete',
    status: 'progress' | 'success' | 'error',
    data: {
      message: string,
      error?: string,
      avatarId?: string,
      previewImageUrl?: string
    },
    timestamp: string
  }
  ```

- **`avatar-ready`**: Final completion notification
  ```typescript
  {
    avatarId: string,
    previewImageUrl?: string
  }
  ```

## Integration Points

### 1. Provider Setup

The `PhotoAvatarNotificationProvider` is added to the main `ClientProviders` component:

```typescript
<Provider store={store}>
  <ApiServiceProvider>
    <PhotoAvatarNotificationProvider>
      <ClientProvidersContent>
        {children}
      </ClientProvidersContent>
    </PhotoAvatarNotificationProvider>
  </ApiServiceProvider>
</Provider>
```

### 2. Avatar Creation Flow

1. User fills out avatar creation form
2. Form submission calls `apiService.createPhotoAvatar()`
3. Modal closes immediately
4. WebSocket receives progress updates
5. Global notification component displays progress
6. User receives completion notification

### 3. State Management

- **Connection Status**: Tracks WebSocket connection state
- **Processing State**: Prevents multiple simultaneous avatar creations
- **Notifications**: Stores all progress updates
- **Latest Notification**: Provides current status

## Usage Examples

### Using the Hook in Components

```typescript
import { usePhotoAvatarNotificationContext } from '@/components/providers/PhotoAvatarNotificationProvider'

function MyComponent() {
  const { 
    isConnected, 
    isProcessing, 
    notifications, 
    latestNotification 
  } = usePhotoAvatarNotificationContext()

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
      <p>Latest: {latestNotification?.data?.message}</p>
    </div>
  )
}
```

### Manual WebSocket Connection

```typescript
import { usePhotoAvatarNotifications } from '@/hooks/usePhotoAvatarNotifications'

function MyComponent() {
  const { socket, notifications, isConnected } = usePhotoAvatarNotifications(userId)
  
  // Use socket for custom events
  const sendCustomEvent = () => {
    if (socket) {
      socket.emit('custom-event', data)
    }
  }
}
```

## Backend Requirements

### Socket.IO Server Setup

The backend should implement:

1. **Room Management**: Create user-specific rooms
2. **Event Handling**: Listen for `join-room` events
3. **Progress Broadcasting**: Send updates to user rooms
4. **Error Handling**: Handle connection errors gracefully

### Example Backend Implementation

```javascript
// Backend Socket.IO setup
io.on('connection', (socket) => {
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })
  
  // Send progress updates
  const sendProgressUpdate = (userId, update) => {
    io.to(`user-${userId}`).emit('photo-avatar-update', update)
  }
  
  // Send completion notification
  const sendAvatarReady = (userId, avatarData) => {
    io.to(`user-${userId}`).emit('avatar-ready', avatarData)
  }
})
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### WebSocket Connection Settings

```typescript
const socket = io(backendUrl, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})
```

## Error Handling

### Connection Errors

- Automatic reconnection with exponential backoff
- Visual connection status indicator
- Graceful degradation when disconnected

### Processing Errors

- Error notifications with detailed messages
- Retry mechanisms for failed operations
- User-friendly error messages

## Testing

### Development Testing

1. **WebSocket Test Component**: Use `WebSocketTest` component for debugging
2. **Console Logging**: Comprehensive logging for development
3. **Connection Status**: Visual indicators for connection state

### Production Considerations

- Remove debug logging
- Implement proper error boundaries
- Add monitoring and analytics
- Consider rate limiting for WebSocket connections

## Benefits

1. **Real-time Feedback**: Users see immediate progress updates
2. **Better UX**: No more waiting without feedback
3. **Error Handling**: Immediate error notifications
4. **Scalable**: Works with multiple concurrent users
5. **Efficient**: No polling required

## Future Enhancements

1. **Multiple Avatar Types**: Extend to digital twin avatars
2. **Batch Operations**: Support multiple avatar creation
3. **Progress Persistence**: Save progress across sessions
4. **Analytics**: Track avatar creation metrics
5. **Push Notifications**: Browser notifications for completion
