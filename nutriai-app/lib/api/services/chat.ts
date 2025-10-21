// Chat API service
import { apiClient } from '../client'
import type { ChatMessage, ChatSuggestion } from '../../../types'
import type { PaginatedResponse } from '../../../types/api'

export interface ChatMessagesParams {
  limit?: number
  offset?: number
  before?: string // Message ID to get messages before
}

export interface SendMessageRequest {
  content: string
  context?: any
}

export interface SendMessageResponse {
  userMessage: ChatMessage
  aiResponse: ChatMessage
}

export interface ChatFeedbackRequest {
  messageId: string
  rating: 'positive' | 'negative'
  comment?: string
}

export interface ChatExportParams {
  format?: 'json' | 'txt' | 'csv'
}

export interface ChatExportResponse {
  exportedAt: string
  totalMessages: number
  messages: ChatMessage[]
}

export const chatService = {
  // Get chat messages with pagination
  async getMessages(params: ChatMessagesParams = {}): Promise<PaginatedResponse<ChatMessage>> {
    const searchParams = new URLSearchParams()
    
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.before) searchParams.set('before', params.before)

    const response = await apiClient.get<PaginatedResponse<ChatMessage>>(`/api/chat/messages?${searchParams}`)
    return response.data
  },

  // Send a message and get AI response
  async sendMessage(messageData: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiClient.post<SendMessageResponse>('/api/chat/messages', messageData)
    return response.data
  },

  // Get chat suggestions based on context
  async getSuggestions(context?: string): Promise<ChatSuggestion[]> {
    const searchParams = new URLSearchParams()
    if (context) searchParams.set('context', context)

    const response = await apiClient.get<ChatSuggestion[]>(`/api/chat/suggest?${searchParams}`)
    return response.data
  },

  // Delete a specific message
  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/api/chat/messages/${messageId}`)
    return response.data
  },

  // Clear all chat messages
  async clearMessages(): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/api/chat/clear')
    return response.data
  },

  // Submit feedback for a message
  async submitFeedback(feedbackData: ChatFeedbackRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/api/chat/feedback', feedbackData)
    return response.data
  },

  // Export chat history
  async exportChat(params: ChatExportParams = {}): Promise<ChatExportResponse | Blob> {
    const searchParams = new URLSearchParams()
    if (params.format) searchParams.set('format', params.format)

    if (params.format === 'txt' || params.format === 'csv') {
      // For file downloads, we need to handle the response differently
      const response = await fetch(`/api/chat/export?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to export chat')
      }
      
      return response.blob()
    } else {
      const response = await apiClient.get<ChatExportResponse>(`/api/chat/export?${searchParams}`)
      return response.data
    }
  },

  // Helper method to get auth token (similar to the one in apiClient)
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage) return null
      
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    } catch {
      return null
    }
  },

  // Get conversation summary
  async getConversationSummary(): Promise<{
    totalMessages: number
    totalUserMessages: number
    totalAiMessages: number
    firstMessageDate: string
    lastMessageDate: string
    topTopics: Array<{
      topic: string
      count: number
    }>
    averageResponseTime: number
  }> {
    const response = await apiClient.get('/api/chat/summary')
    return response.data
  },

  // Get AI insights based on chat history
  async getAIInsights(): Promise<{
    personalizedRecommendations: string[]
    healthTrends: Array<{
      category: string
      trend: 'improving' | 'declining' | 'stable'
      description: string
    }>
    suggestedActions: Array<{
      action: string
      priority: 'high' | 'medium' | 'low'
      category: string
    }>
    motivationalMessage: string
  }> {
    const response = await apiClient.get('/api/chat/insights')
    return response.data
  },

  // Stream a message (for real-time AI responses)
  async streamMessage(messageData: SendMessageRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(messageData),
    })

    if (!response.ok) {
      throw new Error('Failed to start message stream')
    }

    if (!response.body) {
      throw new Error('No response body available for streaming')
    }

    return response.body
  },

  // Get conversation starters based on user's current data
  async getConversationStarters(): Promise<{
    nutrition: string[]
    exercise: string[]
    motivation: string[]
    general: string[]
  }> {
    const response = await apiClient.get('/api/chat/conversation-starters')
    return response.data
  },

  // Search through chat history
  async searchMessages(query: string, filters?: {
    role?: 'user' | 'assistant'
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<{
    results: Array<{
      message: ChatMessage
      relevanceScore: number
      matchedText: string
    }>
    totalResults: number
    searchQuery: string
  }> {
    const searchParams = new URLSearchParams({ q: query })
    
    if (filters?.role) searchParams.set('role', filters.role)
    if (filters?.dateFrom) searchParams.set('dateFrom', filters.dateFrom)
    if (filters?.dateTo) searchParams.set('dateTo', filters.dateTo)
    if (filters?.limit) searchParams.set('limit', filters.limit.toString())

    const response = await apiClient.get(`/api/chat/search?${searchParams}`)
    return response.data
  },

  // Get message templates for quick responses
  async getMessageTemplates(category?: string): Promise<Array<{
    id: string
    category: string
    title: string
    content: string
    usage_count: number
  }>> {
    const searchParams = new URLSearchParams()
    if (category) searchParams.set('category', category)

    const response = await apiClient.get(`/api/chat/templates?${searchParams}`)
    return response.data
  },

  // Mark a conversation as important/favorite
  async markConversationImportant(messageIds: string[]): Promise<{ success: boolean }> {
    const response = await apiClient.post('/api/chat/mark-important', { messageIds })
    return response.data
  },

  // Get conversation context for better AI responses
  async getConversationContext(messageId?: string): Promise<{
    recentTopics: string[]
    userGoals: string[]
    currentChallenges: string[]
    preferredCommunicationStyle: string
    relevantData: {
      nutrition?: any
      exercise?: any
      bodyMetrics?: any
    }
  }> {
    const searchParams = new URLSearchParams()
    if (messageId) searchParams.set('messageId', messageId)

    const response = await apiClient.get(`/api/chat/context?${searchParams}`)
    return response.data
  },
}