// Chat hooks for React Query
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { 
  chatService, 
  type ChatMessagesParams, 
  type SendMessageRequest, 
  type ChatFeedbackRequest,
  type ChatExportParams
} from '../../api/services/chat'
import { queryKeys } from '../query-keys'
import { STALE_TIME, CACHE_TIME } from '../config'
import type { ChatMessage, ChatSuggestion } from '../../../types/chat'
import type { PaginatedResponse } from '../../../types/api'

// Chat query hooks

/**
 * Hook to get chat messages with pagination
 * Uses shorter cache time for real-time feel
 */
export function useChatMessages(params: ChatMessagesParams = {}) {
  return useQuery({
    queryKey: queryKeys.chat.messages('default', params.limit, params.offset),
    queryFn: () => chatService.getMessages(params),
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
  })
}

/**
 * Infinite query hook for chat messages
 * Useful for loading more messages as user scrolls up
 */
export function useInfiniteChatMessages(params: Omit<ChatMessagesParams, 'offset'> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages('default', params.limit),
    queryFn: ({ pageParam }) =>
      chatService.getMessages({ ...params, before: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PaginatedResponse<ChatMessage>) => {
      if (!lastPage.pagination.hasMore) return undefined
      const oldestMessage = lastPage.items[lastPage.items.length - 1]
      return oldestMessage?.id
    },
    staleTime: STALE_TIME.SHORT,
    gcTime: CACHE_TIME.MEDIUM,
    // Reverse the pages so newest messages appear first
    select: (data) => ({
      ...data,
      pages: [...data.pages].reverse(),
    }),
  })
}

/**
 * Hook to get chat suggestions based on context
 */
export function useChatSuggestions(context?: string) {
  return useQuery({
    queryKey: queryKeys.chat.suggestions(context ? { context } : undefined),
    queryFn: () => chatService.getSuggestions(context),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

/**
 * Hook to get conversation summary
 */
export function useConversationSummary() {
  return useQuery({
    queryKey: [...queryKeys.chat.all, 'summary'],
    queryFn: chatService.getConversationSummary,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get AI insights from chat history
 */
export function useAIInsights() {
  return useQuery({
    queryKey: queryKeys.chat.aiInsights(),
    queryFn: chatService.getAIInsights,
    staleTime: STALE_TIME.LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get conversation starters
 */
export function useConversationStarters() {
  return useQuery({
    queryKey: [...queryKeys.chat.all, 'conversation-starters'],
    queryFn: chatService.getConversationStarters,
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to search through chat history
 */
export function useSearchMessages(
  query: string, 
  filters?: {
    role?: 'user' | 'assistant'
    dateFrom?: string
    dateTo?: string
    limit?: number
  }
) {
  return useQuery({
    queryKey: [...queryKeys.chat.all, 'search', { query, ...filters }],
    queryFn: () => chatService.searchMessages(query, filters),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
    enabled: query.length >= 2, // Only search when query is at least 2 characters
  })
}

/**
 * Hook to get message templates
 */
export function useMessageTemplates(category?: string) {
  return useQuery({
    queryKey: [...queryKeys.chat.all, 'templates', category],
    queryFn: () => chatService.getMessageTemplates(category),
    staleTime: STALE_TIME.VERY_LONG,
    gcTime: CACHE_TIME.VERY_LONG,
  })
}

/**
 * Hook to get conversation context
 */
export function useConversationContext(messageId?: string) {
  return useQuery({
    queryKey: [...queryKeys.chat.all, 'context', messageId],
    queryFn: () => chatService.getConversationContext(messageId),
    staleTime: STALE_TIME.MEDIUM,
    gcTime: CACHE_TIME.LONG,
  })
}

// Chat mutation hooks

/**
 * Hook to send a message
 * Includes optimistic updates for immediate UI feedback
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageData: SendMessageRequest) => chatService.sendMessage(messageData),
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.chat.all })

      const sessionId = 'default-session'

      // Create optimistic user message
      const optimisticUserMessage: ChatMessage = {
        id: `temp_user_${Date.now()}`,
        sessionId,
        role: 'user',
        content: newMessage.content,
        createdAt: new Date().toISOString(),
        context: newMessage.context,
      }

      // Create optimistic AI message (loading state)
      const optimisticAiMessage: ChatMessage = {
        id: `temp_ai_${Date.now()}`,
        sessionId,
        role: 'assistant',
        content: '...',
        createdAt: new Date(Date.now() + 1000).toISOString(),
      }

      // Update chat messages cache
      queryClient.setQueryData(
        queryKeys.chat.messages('default'),
        (old: PaginatedResponse<ChatMessage> | undefined) => {
          if (!old) {
            return {
              items: [optimisticAiMessage, optimisticUserMessage],
              pagination: { total: 2, limit: 50, offset: 0, hasMore: false },
            }
          }

          return {
            ...old,
            items: [optimisticAiMessage, optimisticUserMessage, ...old.items],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 2,
            },
          }
        }
      )

      return { optimisticUserMessage, optimisticAiMessage }
    },
    onError: (error, variables, context) => {
      // Remove optimistic messages on error
      if (context) {
        queryClient.setQueryData(
          queryKeys.chat.messages('default'),
          (old: PaginatedResponse<ChatMessage> | undefined) => {
            if (!old) return old

            return {
              ...old,
              items: old.items.filter(
                msg => msg.id !== context.optimisticUserMessage.id && 
                       msg.id !== context.optimisticAiMessage.id
              ),
              pagination: {
                ...old.pagination,
                total: Math.max(0, old.pagination.total - 2),
              },
            }
          }
        )
      }
      console.error('Failed to send message:', error)
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic messages with real ones
      queryClient.setQueryData(
        queryKeys.chat.messages('default'),
        (old: PaginatedResponse<ChatMessage> | undefined) => {
          if (!old) return old

          const filteredItems = old.items.filter(
            msg => context ? (
              msg.id !== context.optimisticUserMessage.id && 
              msg.id !== context.optimisticAiMessage.id
            ) : true
          )

          return {
            ...old,
            items: [data.aiResponse, data.userMessage, ...filteredItems],
          }
        }
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.suggestions() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chat.all, 'summary'] })
    },
  })
}

/**
 * Hook to delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => chatService.deleteMessage(messageId),
    onMutate: async (messageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.chat.all })

      // Remove message optimistically
      queryClient.setQueryData(
        queryKeys.chat.messages('default'),
        (old: PaginatedResponse<ChatMessage> | undefined) => {
          if (!old) return old

          return {
            ...old,
            items: old.items.filter(msg => msg.id !== messageId),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          }
        }
      )

      return { messageId }
    },
    onError: (error, variables, context) => {
      console.error('Failed to delete message:', error)
      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages('default') })
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chat.all, 'summary'] })
    },
  })
}

/**
 * Hook to clear all messages
 */
export function useClearMessages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: chatService.clearMessages,
    onSuccess: () => {
      // Clear all chat-related cache
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all })
    },
    onError: (error) => {
      console.error('Failed to clear messages:', error)
    },
  })
}

/**
 * Hook to submit feedback for a message
 */
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (feedbackData: ChatFeedbackRequest) => chatService.submitFeedback(feedbackData),
    onError: (error) => {
      console.error('Failed to submit feedback:', error)
    },
  })
}

/**
 * Hook to export chat history
 */
export function useExportChat() {
  return useMutation({
    mutationFn: (params: ChatExportParams = {}) => chatService.exportChat(params),
    onError: (error) => {
      console.error('Failed to export chat:', error)
    },
  })
}

/**
 * Hook to mark conversation as important
 */
export function useMarkConversationImportant() {
  return useMutation({
    mutationFn: (messageIds: string[]) => chatService.markConversationImportant(messageIds),
    onError: (error) => {
      console.error('Failed to mark conversation as important:', error)
    },
  })
}

/**
 * Custom hook for streaming messages (for real-time AI responses)
 * Note: This is a simplified version - real implementation would need more sophisticated streaming handling
 */
export function useStreamMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageData: SendMessageRequest) => {
      const stream = await chatService.streamMessage(messageData)
      const reader = stream.getReader()
      
      let aiResponse = ''
      const sessionId = 'default-session'
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        sessionId,
        role: 'user',
        content: messageData.content,
        createdAt: new Date().toISOString(),
        context: messageData.context,
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sessionId,
        role: 'assistant',
        content: '',
        createdAt: new Date(Date.now() + 1000).toISOString(),
      }

      // Add initial messages to cache
      queryClient.setQueryData(
        queryKeys.chat.messages('default'),
        (old: PaginatedResponse<ChatMessage> | undefined) => ({
          items: [aiMessage, userMessage, ...(old?.items || [])],
          pagination: {
            total: (old?.pagination.total || 0) + 2,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        })
      )

      // Stream the response
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          aiResponse += chunk

          // Update the AI message in cache
          queryClient.setQueryData(
            queryKeys.chat.messages('default'),
            (old: PaginatedResponse<ChatMessage> | undefined) => {
              if (!old) return old

              return {
                ...old,
                items: old.items.map(msg =>
                  msg.id === aiMessage.id
                    ? { ...msg, content: aiResponse }
                    : msg
                ),
              }
            }
          )
        }

        // Mark streaming as complete
        queryClient.setQueryData(
          queryKeys.chat.messages('default'),
          (old: PaginatedResponse<ChatMessage> | undefined) => {
            if (!old) return old

            return {
              ...old,
              items: old.items.map(msg =>
                msg.id === aiMessage.id
                  ? { ...msg, isStreaming: false }
                  : msg
              ),
            }
          }
        )

        return { userMessage, aiResponse: { ...aiMessage, content: aiResponse, isStreaming: false } }
      } finally {
        reader.releaseLock()
      }
    },
    onError: (error) => {
      console.error('Failed to stream message:', error)
    },
  })
}
