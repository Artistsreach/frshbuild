"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseFunctions } from '../lib/firebaseFunctions';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatComponent: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!user) {
      setError('Please sign in to use chat');
      return;
    }

    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage('');

      // Send to Firebase Function
      const response = await firebaseFunctions.chatWithCredits(updatedMessages);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response
      };

      setMessages(prev => [...prev, assistantMessage]);

      console.log(`Credits deducted: ${response.creditsDeducted}, Remaining: ${response.remainingCredits}`);

    } catch (error: any) {
      console.error('Chat error:', error);
      setError(error.message || 'Failed to send message');
      
      // Remove the user message if it failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Please sign in to use the chat feature</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <p className="text-sm text-gray-500">Each message costs 5 credits</p>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Start a conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-500">AI is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
