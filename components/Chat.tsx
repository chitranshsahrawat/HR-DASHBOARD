
import React, { useState, useRef, useEffect } from 'react';
import { getHrInsights } from '../services/geminiService';
import { SendIcon } from './icons';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getHrInsights(input);
      const aiMessage: Message = { text: aiResponse, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-secondary rounded-lg shadow-lg animate-fadeIn">
      <div className="p-4 border-b border-accent">
        <h1 className="text-xl font-bold text-text-primary">HR AI Assistant</h1>
        <p className="text-sm text-text-secondary">Ask me about HR policies, employee data, or project statuses.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-highlight text-white' : 'bg-accent text-text-primary'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg px-4 py-3 rounded-xl bg-accent text-text-primary">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-accent mt-auto">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 w-full bg-accent p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="p-3 rounded-lg bg-highlight text-white disabled:bg-accent disabled:cursor-not-allowed transition-colors">
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
