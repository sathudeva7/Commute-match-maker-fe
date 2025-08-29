# Chat Integration Documentation

This document describes the chat functionality that has been integrated into the Commute Match Maker frontend application.

## Overview

The chat system provides real-time messaging capabilities between users, supporting both private and group conversations. It integrates seamlessly with the existing matching system, allowing users to start conversations with their matches.

## Features

### 1. Chat Types
- **Private Chats**: One-on-one conversations between two users
- **Group Chats**: Multi-user conversations with custom names and descriptions

### 2. Core Functionality
- Create new chats (private or group)
- Send and receive text messages
- View chat history with pagination
- Mark messages as read
- Search and filter users for new chats
- Real-time chat updates

### 3. Integration Points
- **Matches Screen**: Chat button on each match card
- **Chat List**: Toggle between matches and conversations
- **Navigation**: Seamless routing between screens

## API Endpoints

The following chat API endpoints have been integrated:

### Chat Management
- `POST /api/chat` - Create a new chat
- `GET /api/chat` - Get user's chats with pagination
- `GET /api/chat/{chatId}` - Get specific chat details
- `PUT /api/chat/{chatId}` - Update chat info (group chats only)
- `DELETE /api/chat/{chatId}` - Delete or leave chat

### Messaging
- `POST /api/chat/messages` - Send a message
- `GET /api/chat/{chatId}/messages` - Get chat messages
- `PUT /api/chat/{chatId}/read` - Mark messages as read

## Components

### 1. ChatService (`services/ChatService.ts`)
- Handles all chat-related API calls
- Provides convenient methods for common operations
- Manages chat creation, messaging, and retrieval

### 2. ChatList (`components/matching/ChatList.tsx`)
- Displays list of user's conversations
- Shows last message, timestamp, and unread count
- Includes "Start New Chat" button
- Supports pull-to-refresh

### 3. ChatScreen (`components/matching/ChatScreen.tsx`)
- Individual chat conversation interface
- Message input and display
- Real-time message updates
- Keyboard-aware layout

### 4. CreateChat (`components/matching/CreateChat.tsx`)
- Interface for starting new conversations
- User search and selection
- Chat type selection (private/group)
- Group name input for group chats

## Routes

### 1. Chat Route (`app/chat/[id].tsx`)
- Dynamic route for individual chat conversations
- Uses chat ID from URL parameters
- Renders ChatScreen component

### 2. Create Chat Route (`app/create-chat.tsx`)
- Route for starting new conversations
- Renders CreateChat component

## Usage Examples

### Starting a Chat from Matches
```typescript
const handleStartChat = async (userId: string) => {
  try {
    const response = await chatService.createDirectChat(userId);
    if (response.success) {
      router.push(`/chat/${response.result._id}`);
    }
  } catch (err) {
    console.error('Error starting chat:', err);
  }
};
```

### Sending a Message
```typescript
const sendMessage = async () => {
  if (!newMessage.trim()) return;
  
  try {
    const response = await chatService.sendTextMessage(chatId, newMessage.trim());
    if (response.success) {
      setNewMessage('');
      // Update local messages state
    }
  } catch (err) {
    console.error('Error sending message:', err);
  }
};
```

### Fetching Chat Messages
```typescript
const fetchMessages = async () => {
  try {
    const response = await chatService.getRecentMessages(chatId);
    if (response.success) {
      setMessages(response.result.messages.reverse());
    }
  } catch (err) {
    console.error('Error fetching messages:', err);
  }
};
```

## Data Types

### Chat Interface
```typescript
interface Chat {
  _id: string;
  participants: string[];
  chatType: 'direct' | 'group';
  name?: string;
  description?: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Message Interface
```typescript
interface Message {
  _id: string;
  chatId: string;
  sender: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'location';
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}
```

## State Management

The chat system uses React's built-in state management with hooks:

- **useState**: For local component state (messages, input, loading states)
- **useEffect**: For API calls and side effects
- **useRef**: For scroll management and DOM references

## Error Handling

- Network errors are caught and displayed to users
- Loading states provide feedback during API calls
- Retry mechanisms for failed operations
- User-friendly error messages

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live messaging
2. **Push Notifications**: Notify users of new messages
3. **Media Support**: Image, file, and location sharing
4. **Chat Search**: Search within conversations
5. **Message Reactions**: Like, heart, and other reactions
6. **Typing Indicators**: Show when users are typing
7. **Message Threading**: Reply to specific messages
8. **Chat Backup**: Export chat history

## Configuration

The chat system uses the existing API configuration from `constants/ApiConfig.ts`:

```typescript
CHAT: {
  CREATE: '/chat',
  GET_CHATS: '/chat',
  GET_CHAT: '/chat/{chatId}',
  UPDATE_CHAT: '/chat/{chatId}',
  DELETE_CHAT: '/chat/{chatId}',
  SEND_MESSAGE: '/chat/messages',
  GET_MESSAGES: '/chat/{chatId}/messages',
  MARK_AS_READ: '/chat/{chatId}/read',
}
```

## Testing

To test the chat functionality:

1. Navigate to the Matches screen
2. Toggle to the Chat view using the chat icon
3. Use "Start New Chat" to create conversations
4. Send messages and verify they appear
5. Test navigation between different chat screens

## Troubleshooting

### Common Issues

1. **Chat not loading**: Check API endpoint configuration
2. **Messages not sending**: Verify authentication and permissions
3. **Navigation errors**: Ensure chat routes are properly configured
4. **Type errors**: Check TypeScript interfaces and API response structures

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Confirm route parameters are correct
4. Validate chat service method calls

## Dependencies

The chat system requires the following dependencies:
- React Native components
- Expo Router for navigation
- Ionicons for UI icons
- Existing API client and services

## Security Considerations

- User authentication required for all chat operations
- Participant validation for chat access
- Input sanitization for message content
- Rate limiting for message sending
- Privacy controls for group chat management
