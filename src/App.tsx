import React, { useState, useRef, useEffect } from 'react';
import { Send, Calendar, Bot, User, Search } from 'lucide-react';
import SignIn from './SignIn';
import { salesforce } from './lib/salesforce';
import { getChatResponse } from './lib/openai';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type UserType = {
  username: string;
  isGuest: boolean;
} | null;

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState<UserType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to Salesforce when a non-guest user signs in
    if (user && !user.isGuest) {
      salesforce.login('arpan', 'arpan').catch(console.error);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    if (!isExpanded) {
      setIsExpanded(true);
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInput('');

    try {
      const aiResponse = await getChatResponse(input, messages);
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'I apologize, but I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setMessages([]);
    setIsExpanded(false);
    setInput('');
  };

  if (!user) {
    return <SignIn onSignIn={setUser} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full border-b border-red-100">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-normal text-gray-900">Appointments</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user.isGuest ? 'Guest User' : user.username}
            </span>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4">
        {!isExpanded && (
          <div className="mt-32 mb-8 flex flex-col items-center">
            <Calendar className="w-20 h-20 text-red-600 mb-6" />
            <h1 className="text-4xl font-normal text-gray-900 mb-2">Appointment Scheduler</h1>
            <p className="text-gray-700 mb-8">Tell me when you'd like to schedule your appointment</p>
          </div>
        )}

        <div className={`w-full max-w-2xl transition-all duration-300 ${isExpanded ? 'h-[600px]' : ''}`}>
          {/* Search-like input container */}
          <div className="relative w-full">
            <form onSubmit={handleSubmit} className="w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your preferred appointment time..."
                  className="w-full py-4 px-12 border border-red-200 rounded-full shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-200 outline-none text-lg focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  className="absolute right-4 text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                  disabled={!input.trim() || isProcessing}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Chat messages */}
          {isExpanded && messages.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-red-100 shadow-sm overflow-y-auto h-[500px] p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-50 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-red-100">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center text-sm text-gray-600">
          <div>© 2025 Appointment Scheduler</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-red-900">Privacy</a>
            <a href="#" className="hover:text-red-900">Terms</a>
            <a href="#" className="hover:text-red-900">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;