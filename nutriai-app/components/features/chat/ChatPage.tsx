'use client';

import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ScrollArea } from '../../ui/scroll-area';
import { Send, Sparkles } from 'lucide-react';
import { type ChatMessage } from '../../../types/chat';

const presetQuestions = [
  { topic: 'nutrition', text: '夜にどうしても甘いものを食べたくなります' },
  { topic: 'training', text: '筋トレの頻度はどれくらいが良いですか？' },
  { topic: 'mood', text: 'モチベーションが下がっています' },
];

const aiResponses: Record<string, string> = {
  nutrition: '夕食後にタンパク質を多めに摂ると血糖値が安定し、甘い物欲求が落ち着きやすいです。温かいハーブティーもおすすめです。',
  training: '初心者の方は週2-3回から始めて、徐々に頻度を増やしましょう。筋肉の回復には48時間必要なので、同じ部位は週2回程度が理想的です。',
  mood: '目標達成には波があって当然です。小さな成功を記録して振り返ることで、モチベーションを保ちやすくなります。今日できることを1つ選んで実行してみましょう！',
  default: 'ご質問ありがとうございます。あなたの目標達成をサポートします。具体的な状況を教えていただけますか？',
};

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sessionId: 'default-session',
      role: 'assistant',
      content: 'こんにちは！栄養、トレーニング、モチベーションについて何でも相談してください。',
      createdAt: '2025-10-17T08:00:00Z',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: 'default-session',
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const topic = presetQuestions.find((q) => q.text === messageText)?.topic || 'default';
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: 'default-session',
        role: 'assistant',
        content: aiResponses[topic] || aiResponses.default,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handlePresetClick = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-foreground">AIチャット</h1>
          <p className="text-sm text-muted-foreground">栄養・トレーニング・モチベーションについて相談</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto p-4 space-y-4 pb-32">
            {/* Preset Questions */}
            {messages.length <= 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">よくある質問</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {presetQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(question.text)}
                      className="px-4 py-2 bg-white border border-border rounded-full text-sm hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {question.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary">AI</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              placeholder="メッセージを入力..."
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="bg-primary hover:bg-accent"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}