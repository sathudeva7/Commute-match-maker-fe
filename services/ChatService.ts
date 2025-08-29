import { apiClient } from './ApiClient';
import { API_CONFIG } from '@/constants/ApiConfig';
import {
  Chat,
  Message,
  CreateChatRequest,
  SendMessageRequest,
  UpdateChatRequest,
  MarkAsReadRequest,
  ChatResponse,
  ChatsResponse,
  MessagesResponse,
  MessageResponse,
} from '@/types/api';

class ChatService {
  /**
   * Create a new chat
   */
  async createChat(request: CreateChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.CREATE,
      request
    );
    return response;
  }

  /**
   * Get user's chats with pagination
   */
  async getChats(page: number = 1, limit: number = 20): Promise<ChatsResponse> {
    const response = await apiClient.get<ChatsResponse>(
      `${API_CONFIG.ENDPOINTS.CHAT.GET_CHATS}?page=${page}&limit=${limit}`
    );
    return response;
  }

  /**
   * Get specific chat by ID
   */
  async getChat(chatId: string): Promise<ChatResponse> {
    const response = await apiClient.get<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.GET_CHAT.replace('{chatId}', chatId)
    );
    return response;
  }

  /**
   * Update chat info (group chats only)
   */
  async updateChat(chatId: string, request: UpdateChatRequest): Promise<ChatResponse> {
    const response = await apiClient.put<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.UPDATE_CHAT.replace('{chatId}', chatId),
      request
    );
    return response;
  }

  /**
   * Delete or leave chat
   */
  async deleteChat(chatId: string): Promise<ChatResponse> {
    const response = await apiClient.delete<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.DELETE_CHAT.replace('{chatId}', chatId)
    );
    return response;
  }

  /**
   * Send a message
   */
  async sendMessage(request: SendMessageRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_CONFIG.ENDPOINTS.CHAT.SEND_MESSAGE,
      request
    );
    return response;
  }

  /**
   * Get chat messages with pagination and optional timestamp filtering
   */
  async getMessages(
    chatId: string,
    page: number = 1,
    limit: number = 50,
    before?: string
  ): Promise<MessagesResponse> {
    let url = `${API_CONFIG.ENDPOINTS.CHAT.GET_MESSAGES.replace('{chatId}', chatId)}?page=${page}&limit=${limit}`;
    
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }

    const response = await apiClient.get<MessagesResponse>(url);
    return response;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: string, request: MarkAsReadRequest = {}): Promise<ChatResponse> {
    const response = await apiClient.put<ChatResponse>(
      API_CONFIG.ENDPOINTS.CHAT.MARK_AS_READ.replace('{chatId}', chatId),
      request
    );
    return response;
  }

  /**
   * Create a private chat between two users
   */
  async createDirectChat(participantId: string): Promise<ChatResponse> {
    return this.createChat({
      participantId,
      chatType: 'direct'
    });
  }

  /**
   * Create a group chat
   */
  async createGroupChat(participantIds: string[], name: string, description?: string): Promise<ChatResponse> {
    // For group chats, we'll need to handle multiple participants differently
    // This might need to be updated based on your backend implementation
    return this.createChat({
      participantId: participantIds[0], // This might need adjustment for group chats
      chatType: 'group',
      name
    });
  }

  /**
   * Send a text message
   */
  async sendTextMessage(chatId: string, content: string): Promise<MessageResponse> {
    return this.sendMessage({
      chatId,
      content,
      messageType: 'text'
    });
  }

  /**
   * Get recent messages for a chat (last 20 messages)
   */
  async getRecentMessages(chatId: string): Promise<MessagesResponse> {
    return this.getMessages(chatId, 1, 20);
  }

  /**
   * Get messages before a specific timestamp (for pagination)
   */
  async getMessagesBefore(chatId: string, before: string, limit: number = 20): Promise<MessagesResponse> {
    return this.getMessages(chatId, 1, limit, before);
  }
}

export const chatService = new ChatService();
