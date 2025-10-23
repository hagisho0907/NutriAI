import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatMessage, ChatSession, MessageType } from '../types';

interface ChatStore {
  // State
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isTyping: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  fetchSessionMessages: (sessionId: string) => Promise<void>;
  createNewSession: (title?: string) => Promise<ChatSession>;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setCurrentSession: (session: ChatSession | null) => void;
  
  // Message actions
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // AI interactions
  askNutritionQuestion: (question: string) => Promise<void>;
  analyzeMeal: (mealData: any) => Promise<void>;
  getExerciseRecommendations: (preferences: any) => Promise<void>;
  getMotivationalMessage: () => Promise<void>;
  
  // Utility actions
  searchMessages: (query: string) => ChatMessage[];
  exportChatHistory: () => string;
  setTyping: (isTyping: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [],
      currentSession: null,
      messages: [],
      isTyping: false,
      loading: false,
      error: null,

      // Actions
      fetchSessions: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock sessions data
          const mockSessions: ChatSession[] = [
            {
              id: '1',
              userId: '1',
              title: 'Weight Loss Journey',
              lastMessageAt: new Date(Date.now() - 86400000), // Yesterday
              messageCount: 15,
              createdAt: new Date(Date.now() - 7 * 86400000), // Week ago
              updatedAt: new Date(Date.now() - 86400000)
            },
            {
              id: '2',
              userId: '1',
              title: 'Meal Planning Help',
              lastMessageAt: new Date(Date.now() - 3600000), // Hour ago
              messageCount: 8,
              createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
              updatedAt: new Date(Date.now() - 3600000)
            }
          ];

          set({
            sessions: mockSessions,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch chat sessions'
          });
        }
      },

      fetchSessionMessages: async (sessionId: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock messages data
          const mockMessages: ChatMessage[] = [
            {
              id: '1',
              sessionId,
              content: 'Hello! I need help with creating a meal plan for weight loss.',
              sender: 'user',
              type: 'text',
              timestamp: new Date(Date.now() - 7200000) // 2 hours ago
            },
            {
              id: '2',
              sessionId,
              content: "I'd be happy to help you create a meal plan for weight loss! To provide you with the most personalized recommendations, could you tell me:\n\n1. Your current weight and target weight\n2. Any dietary restrictions or preferences\n3. Your activity level\n4. Any foods you particularly enjoy or dislike\n\nThis information will help me create a sustainable and effective meal plan for you.",
              sender: 'assistant',
              type: 'text',
              timestamp: new Date(Date.now() - 7180000),
              metadata: {
                confidence: 0.95,
                responseTime: 1200
              }
            },
            {
              id: '3',
              sessionId,
              content: 'I currently weigh 180 lbs and want to reach 160 lbs. I\'m vegetarian and exercise 3-4 times per week.',
              sender: 'user',
              type: 'text',
              timestamp: new Date(Date.now() - 7000000)
            },
            {
              id: '4',
              sessionId,
              content: "Perfect! Based on your goals and preferences, here's a personalized meal plan:\n\n**Daily Calorie Target:** ~1,600-1,700 calories\n**Protein Goal:** 80-100g per day\n\n**Sample Day:**\n\n🌅 **Breakfast (400 cal)**\n- Greek yogurt with berries and granola\n- OR Protein smoothie with spinach, banana, protein powder\n\n🥗 **Lunch (450 cal)**\n- Quinoa Buddha bowl with chickpeas, vegetables, and tahini dressing\n- OR Lentil soup with whole grain bread\n\n🍽️ **Dinner (500 cal)**\n- Tofu stir-fry with brown rice and vegetables\n- OR Black bean and sweet potato tacos\n\n🥜 **Snacks (250-350 cal)**\n- Nuts and fruit\n- Hummus with vegetables\n- Protein bar\n\nWould you like me to create a full weekly meal plan or focus on any specific meals?",
              sender: 'assistant',
              type: 'meal_plan',
              timestamp: new Date(Date.now() - 6980000),
              metadata: {
                confidence: 0.92,
                responseTime: 2100,
                mealPlan: {
                  calories: 1650,
                  protein: 90,
                  carbs: 180,
                  fat: 65
                }
              }
            }
          ];

          set({
            messages: mockMessages,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch messages'
          });
        }
      },

      createNewSession: async (title?: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const newSession: ChatSession = {
            id: Date.now().toString(),
            userId: '1',
            title: title || 'New Chat',
            lastMessageAt: new Date(),
            messageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const sessions = [newSession, ...get().sessions];
          set({
            sessions,
            currentSession: newSession,
            messages: [],
            loading: false,
            error: null
          });

          return newSession;
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create new session'
          });
          throw error;
        }
      },

      updateSession: async (sessionId: string, updates: Partial<ChatSession>) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const sessions = get().sessions.map(session =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: new Date() }
              : session
          );

          const currentSession = get().currentSession;
          const updatedCurrentSession = currentSession?.id === sessionId
            ? { ...currentSession, ...updates, updatedAt: new Date() }
            : currentSession;

          set({
            sessions,
            currentSession: updatedCurrentSession,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update session'
          });
        }
      },

      deleteSession: async (sessionId: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const sessions = get().sessions.filter(session => session.id !== sessionId);
          const currentSession = get().currentSession;

          set({
            sessions,
            currentSession: currentSession?.id === sessionId ? null : currentSession,
            messages: currentSession?.id === sessionId ? [] : get().messages,
            loading: false,
            error: null
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete session'
          });
        }
      },

      setCurrentSession: (session: ChatSession | null) => {
        set({ currentSession: session });
        if (session) {
          get().fetchSessionMessages(session.id);
        } else {
          set({ messages: [] });
        }
      },

      sendMessage: async (content: string, type: MessageType = 'text') => {
        const currentSession = get().currentSession;
        if (!currentSession) return;

        // Add user message immediately
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          sessionId: currentSession.id,
          content,
          sender: 'user',
          type,
          timestamp: new Date()
        };

        get().addMessage(userMessage);
        set({ isTyping: true });

        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Mock AI response
          const responses = [
            "That's a great question! Let me help you with that.",
            "Based on your goals, I recommend...",
            "Here's what I suggest for your nutrition plan:",
            "I understand your concern. Let me provide some guidance.",
            "Excellent progress! Here's how you can continue:"
          ];

          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sessionId: currentSession.id,
            content: responses[Math.floor(Math.random() * responses.length)],
            sender: 'assistant',
            type: 'text',
            timestamp: new Date(),
            metadata: {
              confidence: 0.9 + Math.random() * 0.1,
              responseTime: 1500 + Math.random() * 1000
            }
          };

          get().addMessage(assistantMessage);

          // Update session
          await get().updateSession(currentSession.id, {
            lastMessageAt: new Date(),
            messageCount: currentSession.messageCount + 2
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send message'
          });
        } finally {
          set({ isTyping: false });
        }
      },

      addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date()
        };

        const messages = [...get().messages, newMessage];
        set({ messages });
      },

      clearMessages: () => set({ messages: [] }),

      regenerateResponse: async (messageId: string) => {
        set({ isTyping: true });
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const messages = get().messages.map(msg => {
            if (msg.id === messageId && msg.sender === 'assistant') {
              return {
                ...msg,
                content: "Here's an alternative response: " + msg.content,
                timestamp: new Date(),
                metadata: {
                  ...msg.metadata,
                  regenerated: true
                }
              };
            }
            return msg;
          });

          set({ messages });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to regenerate response'
          });
        } finally {
          set({ isTyping: false });
        }
      },

      editMessage: async (messageId: string, newContent: string) => {
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const messages = get().messages.map(msg =>
            msg.id === messageId
              ? { ...msg, content: newContent, edited: true }
              : msg
          );

          set({ messages });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to edit message'
          });
        }
      },

      deleteMessage: async (messageId: string) => {
        try {
          // TODO: Replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const messages = get().messages.filter(msg => msg.id !== messageId);
          set({ messages });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete message'
          });
        }
      },

      askNutritionQuestion: async (question: string) => {
        await get().sendMessage(`Nutrition question: ${question}`, 'nutrition_question');
      },

      analyzeMeal: async (mealData: any) => {
        const content = `Please analyze this meal: ${JSON.stringify(mealData)}`;
        await get().sendMessage(content, 'meal_analysis');
      },

      getExerciseRecommendations: async (preferences: any) => {
        const content = `I need exercise recommendations based on: ${JSON.stringify(preferences)}`;
        await get().sendMessage(content, 'exercise_recommendation');
      },

      getMotivationalMessage: async () => {
        await get().sendMessage("Can you give me some motivation for my fitness journey?", 'motivation');
      },

      searchMessages: (query: string) => {
        const messages = get().messages;
        return messages.filter(msg =>
          msg.content.toLowerCase().includes(query.toLowerCase())
        );
      },

      exportChatHistory: () => {
        const messages = get().messages;
        const currentSession = get().currentSession;
        
        const chatHistory = {
          session: currentSession,
          messages: messages.map(msg => ({
            sender: msg.sender,
            content: msg.content,
            type: msg.type,
            timestamp: msg.timestamp.toISOString()
          })),
          exportedAt: new Date().toISOString()
        };

        return JSON.stringify(chatHistory, null, 2);
      },

      setTyping: (isTyping: boolean) => set({ isTyping }),
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error })
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions
      })
    }
  )
);