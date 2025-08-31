import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw,
  MessageSquare,
  Lightbulb,
  Zap,
  Brain,
  Code,
  Palette,
  BookOpen,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Upload,
  FileText,
  Camera,
  Settings
} from 'lucide-react';
import { cn } from '../libs/utils';
import api from '../api/axios';
import ImageGenerator from './ImageGenerator';
import FileUploader from './FileUploader';

const AIChat = () => {
  const { currentUser } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI assistant. I can help you with various tasks like writing, coding, analysis, and more. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        { text: "Help me write an email", icon: MessageSquare },
        { text: "Explain a concept", icon: BookOpen },
        { text: "Generate code", icon: Code },
        { text: "Create a design", icon: Palette }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
      return `I'd be happy to help you write an email! Here's a professional template:

      Subject: [Your Subject Here]

      Dear [Recipient's Name],

      I hope this email finds you well. [Your main message here]

      [Additional details or context]

      Thank you for your time and consideration.

      Best regards,
      [Your Name]

      Would you like me to customize this template for a specific situation?`;
    }
    
    
    if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('function')) {
      return `I can help you with code! Here's a simple example:

        \`\`\`javascript
        function greetUser(name) {
          return \`Hello, \${name}! Welcome to our application.\`;
        }

        // Usage
        console.log(greetUser('John')); // Output: Hello, John! Welcome to our application
        // 
        \`\`\`

        What specific programming language or functionality are you looking for?`;
      }
    
    if (lowerMessage.includes('design') || lowerMessage.includes('ui') || lowerMessage.includes('layout')) {
      return `For design and UI help, here are some key principles:

          - Keep it simple and clean
          - Use consistent spacing and typography
          - Ensure good contrast for readability
          - Make it mobile-responsive
          - Follow accessibility guidelines

          Would you like me to help you with a specific design challenge?`;
     }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! How can I assist you today? I can help with:
        • Writing and communication
        • Code and programming
        • Design and creativity
        • Analysis and problem-solving
        • Learning and explanations

        What would you like to work on?`;
    }
    return "I will help with that. Could you provide more details?";
  };

  const getSuggestions = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
      return [
        { text: "Write a professional email", icon: MessageSquare },
        { text: "Email templates", icon: BookOpen }
      ];
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('program')) {
      return [
        { text: "Show me more examples", icon: Code },
        { text: "Explain this code", icon: BookOpen }
      ];
    }
    
    return [
      { text: "Tell me more", icon: MessageSquare },
      { text: "Give me examples", icon: Lightbulb },
      { text: "Explain further", icon: BookOpen },
      { text: "Show me code", icon: Code }
    ];
  };

  const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    const { data } = await api.post('/api/ai/chat', { message: userMessage.content });
    const aiText = data?.message || "I'm here to help! Could you please clarify your request?";
    const aiResponse = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiText,
      timestamp: new Date(),
      suggestions: getSuggestions(userMessage.content)
    };
    setMessages(prev => [...prev, aiResponse]);
  } catch (err) {
    const failResponse = {
      id: Date.now() + 1,
      type: 'ai',
      content: "Sorry, I didnt understand what you meant.",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, failResponse]);
  } finally {
    setIsLoading(false);
  }
};

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion.text);
  };

  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="bg-white border-b border-secondary-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              AI Assistant
            </h2>
            <p className="text-sm text-secondary-500">
              Powered by advanced AI technology
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-success-50 border border-success-200 rounded-full">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-success-700 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-2xl",
                message.type === 'user' ? "order-2" : "order-1"
              )}>
                <div className={cn(
                  "flex items-start space-x-3",
                  message.type === 'user' ? "flex-row-reverse space-x-reverse" : ""
                )}>
                  
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.type === 'user'
                      ? "bg-primary-600"
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  )}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className={cn(
                    "flex-1 space-y-2",
                    message.type === 'user' ? "text-right" : ""
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl",
                      message.type === 'user'
                        ? "bg-primary-600 text-white"
                        : "bg-white text-secondary-900 border border-secondary-200 shadow-soft"
                    )}>
                      <div className="flex items-start justify-between space-x-2">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className={cn(
                            "flex-shrink-0 p-1 rounded transition-colors",
                            message.type === 'user'
                              ? "text-primary-100 hover:bg-primary-500"
                              : "text-secondary-400 hover:bg-secondary-100"
                          )}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {message.suggestions && message.type === 'ai' && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => {
                          const Icon = suggestion.icon;
                          return (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="flex items-center space-x-2 px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200"
                            >
                              <Icon className="w-3 h-3" />
                              <span>{suggestion.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <p className={cn(
                      "text-xs text-secondary-500",
                      message.type === 'user' ? "text-right" : "text-left"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-secondary-200 rounded-2xl px-4 py-3 shadow-soft">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-secondary-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-secondary-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => setShowImageGen(!showImageGen)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showImageGen ? "bg-purple-100 text-purple-600" : "text-secondary-600 hover:bg-secondary-100"
                )}
                title="Generate Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowDocUpload(!showDocUpload)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showDocUpload ? "bg-blue-100 text-blue-600" : "text-secondary-600 hover:bg-secondary-100"
                )}
                title="Upload Document"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors" title="AI Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full resize-none border border-secondary-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              
              <div className="absolute right-3 bottom-3">
                <Bot className="w-4 h-4 text-secondary-400" />
              </div>
            </div>

            <button
              onClick={inputMessage.trim() ? handleSendMessage : () => setIsRecording(!isRecording)}
              disabled={isLoading}
              className={cn(
                "p-3 rounded-full transition-all duration-200",
                inputMessage.trim() && !isLoading
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  : isRecording
                  ? "bg-error-600 text-white hover:bg-error-700"
                  : "bg-secondary-100 text-secondary-400 cursor-not-allowed"
              )}
            >
              {inputMessage.trim() ? (
                <Send className="w-5 h-5" />
              ) : isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-secondary-500">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>AI Assistant v2.0</span>
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <ImageGenerator 
        isOpen={showImageGen} 
        onClose={() => setShowImageGen(false)} 
      />

      <FileUploader 
        isOpen={showDocUpload} 
        onClose={() => setShowDocUpload(false)}
        onUploadComplete={(documents) => {
          console.log('Documents processed:', documents);
          setShowDocUpload(false);
        }}
      />
    </div>
  );
};

export default AIChat;