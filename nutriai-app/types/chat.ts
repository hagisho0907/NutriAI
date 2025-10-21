// Chat-related type definitions for NutriAI

export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatTopic = 'nutrition' | 'training' | 'mood' | 'general';

// Chat session
export interface ChatSession {
  id: string;
  userId: string;
  topic?: ChatTopic;
  contextSnapshot?: any; // User context at session start (JSONB)
  createdAt: string;
  lastMessageAt?: string;
  messageCount: number;
  isActive: boolean;
}

// Chat message
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  contextTags?: string[]; // e.g., ["plateau", "protein"]
  latencyMs?: number; // Response time for assistant messages
  createdAt: string;
}

// Create chat message request
export interface CreateChatMessageRequest {
  sessionId?: string; // If not provided, create new session
  message: string;
  topic?: ChatTopic;
}

// Chat response
export interface ChatResponse {
  sessionId: string;
  messageId: string;
  reply: string;
  suggestedActions?: SuggestedAction[];
  confidence?: number;
  contextTags?: string[];
}

// Suggested action from AI
export interface SuggestedAction {
  type: 'habit' | 'meal' | 'exercise' | 'goal' | 'tracking';
  title: string;
  description: string;
  actionData?: any; // Specific data for the action
  priority?: 'high' | 'medium' | 'low';
}

// Chat summary for listing
export interface ChatSessionSummary {
  id: string;
  topic?: ChatTopic;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

// AI inference record (for audit/improvement)
export interface AIInference {
  id: string;
  sourceType: 'meal' | 'chat' | 'review' | 'goal';
  sourceId?: string;
  modelName?: string;
  inputSummary?: string;
  outputJson: any;
  confidence?: number;
  createdAt: string;
}

// Chat context for AI
export interface ChatContext {
  userProfile: {
    age?: number;
    gender?: string;
    activityLevel?: string;
    currentWeight?: number;
    targetWeight?: number;
  };
  recentMetrics?: {
    avgCaloriesIntake?: number;
    avgProteinG?: number;
    avgExerciseMin?: number;
    weightTrend?: string;
  };
  currentGoals?: {
    goalType?: string;
    targetCalories?: number;
    progressPercent?: number;
  };
}