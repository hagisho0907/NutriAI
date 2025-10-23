// Chat MSW handlers
import { http, HttpResponse } from 'msw'
import { delay, MOCK_DELAY } from '../../api/config'
import { mockChatMessages } from '../../mockData'
import type { ChatMessage, ChatSuggestion } from '../../../types/chat'

// Mock chat database
const mockChatMessagesDatabase = new Map<string, ChatMessage>()

// Helper to extract user ID from auth token
const getUserIdFromToken = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer mock-access-token')) {
    return null
  }
  return '1'
}

// Initialize with default data
mockChatMessages.forEach(message => {
  mockChatMessagesDatabase.set(message.id, message)
})

// Mock AI responses for different topics
const getMockAIResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  if (message.includes('食事') || message.includes('食べ物') || message.includes('栄養')) {
    return 'バランスの良い食事を心がけましょう。タンパク質、炭水化物、脂質をバランス良く摂取することが重要です。野菜や果物も忘れずに！'
  }
  
  if (message.includes('運動') || message.includes('トレーニング') || message.includes('筋トレ')) {
    return '定期的な運動は健康維持に欠かせません。週3-4回、1回30分程度の有酸素運動から始めてみましょう。筋力トレーニングも取り入れると効果的です。'
  }
  
  if (message.includes('体重') || message.includes('ダイエット') || message.includes('痩せ')) {
    return '健康的な体重減少には、適切な食事制限と運動の組み合わせが効果的です。急激な減量ではなく、月1-2kgのペースを目標にしましょう。'
  }
  
  if (message.includes('水分') || message.includes('水')) {
    return '十分な水分補給は重要です。1日2-3リットルを目標に、こまめに水分を摂取しましょう。運動時はさらに多く摂取することをお勧めします。'
  }
  
  if (message.includes('睡眠') || message.includes('眠り')) {
    return '質の良い睡眠は健康管理に重要です。7-8時間の睡眠を心がけ、就寝前のスマホやカフェインの摂取は控えましょう。'
  }
  
  if (message.includes('モチベーション') || message.includes('やる気')) {
    return '目標達成には継続が大切です。小さな成功を積み重ねて、自分を褒めることも忘れずに。仲間と一緒に頑張ることも効果的です！'
  }
  
  if (message.includes('サプリメント') || message.includes('プロテイン')) {
    return 'サプリメントは食事で不足しがちな栄養素を補完するものです。基本は食事からの栄養摂取を心がけ、必要に応じてサプリメントを活用しましょう。'
  }
  
  // Default response
  return 'ご質問ありがとうございます。健康的な生活習慣について、具体的にお聞かせいただければ、より詳しくアドバイスできます。食事、運動、睡眠について何でもお聞きください！'
}

// Mock suggestions based on context
const getMockSuggestions = (context?: string): ChatSuggestion[] => {
  const suggestions: ChatSuggestion[] = [
    {
      id: 'suggest-1',
      text: '今日の食事バランスはどうですか？',
      category: 'nutrition',
    },
    {
      id: 'suggest-2',
      text: 'おすすめの運動メニューを教えて',
      category: 'exercise',
    },
    {
      id: 'suggest-3',
      text: '水分補給のタイミングについて',
      category: 'hydration',
    },
    {
      id: 'suggest-4',
      text: 'モチベーションを保つコツは？',
      category: 'motivation',
    },
    {
      id: 'suggest-5',
      text: '体重が減らない理由を知りたい',
      category: 'weight-management',
    },
    {
      id: 'suggest-6',
      text: '良い睡眠のための習慣',
      category: 'sleep',
    },
  ]
  
  if (context) {
    // Filter suggestions based on context
    if (context.includes('nutrition')) {
      return suggestions.filter(s => s.category === 'nutrition' || s.category === 'hydration')
    }
    if (context.includes('exercise')) {
      return suggestions.filter(s => s.category === 'exercise' || s.category === 'motivation')
    }
  }
  
  // Return random 3 suggestions
  return suggestions.sort(() => Math.random() - 0.5).slice(0, 3)
}

export const chatHandlers = [
  // GET /api/chat/messages
  http.get('/api/chat/messages', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const before = url.searchParams.get('before') // Message ID to get messages before

    let messages = Array.from(mockChatMessagesDatabase.values())

    // Filter messages before a specific message ID if provided
    if (before) {
      const beforeMessage = mockChatMessagesDatabase.get(before)
      if (beforeMessage) {
        const beforeDate = new Date(beforeMessage.createdAt)
        messages = messages.filter(msg => new Date(msg.createdAt) < beforeDate)
      }
    }

    // Sort by creation date (newest first)
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination
    const total = messages.length
    const paginatedMessages = messages.slice(offset, offset + limit)

    return HttpResponse.json({
      items: paginatedMessages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  }),

  // POST /api/chat/messages
  http.post('/api/chat/messages', async ({ request }) => {
    await delay(MOCK_DELAY.network) // Longer delay for AI processing

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json() as { 
      content: string
      context?: any
      sessionId?: string
    }

    // Validate required fields
    if (!body.content || body.content.trim().length === 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message content is required',
            details: [
              { field: 'content', issue: 'Content cannot be empty' },
            ],
          },
        },
        { status: 400 }
      )
    }

    if (body.content.length > 1000) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message content is too long',
            details: [
              { field: 'content', issue: 'Content must be 1000 characters or less' },
            ],
          },
        },
        { status: 400 }
      )
    }

    // Create user message
    const sessionId = body.sessionId ?? 'default-session'

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sessionId,
      role: 'user',
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
      context: body.context,
    }

    mockChatMessagesDatabase.set(userMessage.id, userMessage)

    // Generate AI response
    const aiResponse: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      sessionId,
      role: 'assistant',
      content: getMockAIResponse(body.content),
      createdAt: new Date(Date.now() + 1000).toISOString(), // 1 second later
    }

    mockChatMessagesDatabase.set(aiResponse.id, aiResponse)

    return HttpResponse.json({
      userMessage,
      aiResponse,
    }, { status: 201 })
  }),

  // GET /api/chat/suggest
  http.get('/api/chat/suggest', async ({ request }) => {
    await delay(MOCK_DELAY.fast)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const context = url.searchParams.get('context')

    const suggestions = getMockSuggestions(context || undefined)

    return HttpResponse.json(suggestions)
  }),

  // DELETE /api/chat/messages/:id
  http.delete('/api/chat/messages/:id', async ({ request, params }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const messageId = params.id as string
    const message = mockChatMessagesDatabase.get(messageId)

    if (!message) {
      return HttpResponse.json(
        {
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Chat message not found',
          },
        },
        { status: 404 }
      )
    }

    // Only allow deleting user messages
    if (message.role !== 'user') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot delete assistant messages',
          },
        },
        { status: 403 }
      )
    }

    mockChatMessagesDatabase.delete(messageId)

    return HttpResponse.json({ success: true })
  }),

  // POST /api/chat/clear
  http.post('/api/chat/clear', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    // Clear all messages (in real app, would filter by userId)
    mockChatMessagesDatabase.clear()

    // Add welcome message back
    const sessionId = 'default-session'
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sessionId,
      role: 'assistant',
      content: 'こんにちは！栄養、トレーニング、モチベーションについて何でも相談してください。',
      createdAt: new Date().toISOString(),
    }

    mockChatMessagesDatabase.set(welcomeMessage.id, welcomeMessage)

    return HttpResponse.json({ success: true })
  }),

  // POST /api/chat/feedback
  http.post('/api/chat/feedback', async ({ request }) => {
    await delay(MOCK_DELAY.medium)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json() as {
      messageId: string
      rating: 'positive' | 'negative'
      comment?: string
    }

    // Validate required fields
    if (!body.messageId || !body.rating) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message ID and rating are required',
            details: [
              { field: 'messageId', issue: !body.messageId ? 'Message ID is required' : '' },
              { field: 'rating', issue: !body.rating ? 'Rating is required' : '' },
            ].filter(detail => detail.issue),
          },
        },
        { status: 400 }
      )
    }

    const message = mockChatMessagesDatabase.get(body.messageId)
    if (!message) {
      return HttpResponse.json(
        {
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Chat message not found',
          },
        },
        { status: 404 }
      )
    }

    // In a real app, you would save the feedback to a database
    return HttpResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
    })
  }),

  // GET /api/chat/export
  http.get('/api/chat/export', async ({ request }) => {
    await delay(MOCK_DELAY.slow)

    const userId = getUserIdFromToken(request.headers.get('Authorization'))
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
          },
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'json' // json, txt, csv

    const messages = Array.from(mockChatMessagesDatabase.values())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    if (format === 'json') {
      return HttpResponse.json({
        exportedAt: new Date().toISOString(),
        totalMessages: messages.length,
        messages,
      })
    }

    if (format === 'txt') {
      const textContent = messages
        .map(msg => `[${msg.createdAt}] ${msg.role}: ${msg.content}`)
        .join('\n')

      return new HttpResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="chat-export.txt"',
        },
      })
    }

    if (format === 'csv') {
      const csvHeader = 'timestamp,role,content\n'
      const csvRows = messages
        .map(msg => `"${msg.createdAt}","${msg.role}","${msg.content.replace(/"/g, '""')}"`)
        .join('\n')

      return new HttpResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="chat-export.csv"',
        },
      })
    }

    return HttpResponse.json(
      {
        error: {
          code: 'INVALID_FORMAT',
          message: 'Unsupported export format',
        },
      },
      { status: 400 }
    )
  }),
]
