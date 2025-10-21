import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ChatMessage, ChatSession } from '../types/chat'

interface ChatStoreState {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  fetchSessions: () => Promise<void>
  fetchSessionMessages: (sessionId: string) => Promise<void>
  createSession: (title?: string) => Promise<ChatSession>
  appendMessage: (message: ChatMessage) => void
  clearMessages: () => void
  setCurrentSession: (session: ChatSession | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const createMockSession = (id: string, title: string): ChatSession => ({
  id,
  userId: 'mock-user',
  topic: 'general',
  createdAt: new Date().toISOString(),
  lastMessageAt: new Date().toISOString(),
  messageCount: 0,
  isActive: true,
})

const createMockMessage = (sessionId: string): ChatMessage[] => [
  {
    id: `msg-${sessionId}-1`,
    sessionId,
    role: 'assistant',
    content:
      'こんにちは！栄養やトレーニングの質問があればお手伝いします。',
    createdAt: new Date().toISOString(),
  },
]

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      messages: [],
      loading: false,
      error: null,

      fetchSessions: async () => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 200))
          const mockSessions = [
            createMockSession('chat-1', 'ウェルカムチャット'),
            createMockSession('chat-2', '栄養相談'),
          ]
          set({
            sessions: mockSessions,
            currentSession: mockSessions[0],
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch chat sessions',
          })
        }
      },

      fetchSessionMessages: async (sessionId: string) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          set({
            messages: createMockMessage(sessionId),
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch chat messages',
          })
        }
      },

      createSession: async (title?: string) => {
        set({ loading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 150))
          const session = createMockSession(
            `chat-${Date.now()}`,
            title || '新しいチャット',
          )
          set({
            sessions: [session, ...get().sessions],
            currentSession: session,
            messages: createMockMessage(session.id),
            loading: false,
            error: null,
          })
          return session
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create chat session',
          })
          throw error
        }
      },

      appendMessage: (message) => {
        set({
          messages: [...get().messages, message],
        })
      },

      clearMessages: () => set({ messages: [] }),

      setCurrentSession: (session) => set({ currentSession: session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
      }),
    },
  ),
)
