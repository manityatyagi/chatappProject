import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { addMessage, setMessages } from '../store/slices/chatSlice';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Search, 
  UserPlus,
  Info,
  Image as ImageIcon,
  File,
  Mic,
  MicOff,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { cn } from '../libs/utils';
import socketService from '../services/socket';
import VoiceRecorder from './VoiceRecorder';
import api from '../api/axios';

const ChatArea = () =>  {
  const dispatch = useAppDispatch();
  const { selectedChat, messages } = useAppSelector((state) => state.chat);
  const { currentUser } = useAppSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);  
  
  useEffect(() => {
    if (!currentUser?._id) return
    socketService.connect(currentUser._id)
    socketService.onReceiveMessage((message) => {
      dispatch(addMessage(message));
    });

    socketService.onUserTyping(({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

return () => {
      socketService.offReceiveMessage();
      socketService.offUserTyping();
      socketService.disconnect();
    };
  }, [currentUser, dispatch]);

useEffect(() => {
    if (selectedChat?._id) {
      socketService.joinChat(selectedChat._id);
      loadMessages(selectedChat._id);
    }
    return () => {
      if (selectedChat?._id) {
        socketService.leaveChat(selectedChat._id);
      }
    };
  }, [selectedChat]);

  const loadMessages = async (chatId) => {
    try {
      const response = await api.get(`/api/messages/${chatId}`);
      dispatch(setMessages(response.data));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat?._id) {
      socketService.sendMessage(selectedChat._id, newMessage.trim());
      setNewMessage('');
  
      socketService.setTyping(selectedChat._id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
     if (selectedChat?._id) {
      socketService.setTyping(selectedChat._id, true);
      
     if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.setTyping(selectedChat._id, false);
      }, 1000);
    }
  };

  const handleSendAudio = async (audioUrl, transcript) => {
    if (selectedChat?._id) {
      socketService.sendAudioMessage(selectedChat._id, audioUrl, transcript);
      setShowVoiceRecorder(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message) => {
    return message.senderId === currentUser?.id;
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-secondary-600 mb-4">
            Choose a chat from the sidebar to start messaging
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-secondary-500">
            <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
            <span>Your conversations will appear here</span>
            <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={selectedChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.name}`}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full border-2 border-secondary-200"
            />
            {selectedChat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              {selectedChat.name}
            </h2>
            <p className="text-sm text-secondary-500">
              {selectedChat.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-secondary-50">
        <div className="p-4 space-y-4">
          {messages.filter(m => m.chatId === selectedChat.id).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No messages yet
              </h3>
              <p className="text-secondary-600">
                Start the conversation by sending a message
              </p>
            </div>
          ) : (
            messages
              .filter(m => m.chatId === selectedChat.id)
              .map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isOwnMessage(message) ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                      isOwnMessage(message)
                        ? "bg-primary-600 text-white"
                        : "bg-white text-secondary-900 border border-secondary-200"
                    )}
                  >
                    {!isOwnMessage(message) && (
                      <p className="text-xs text-secondary-500 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    
                    <div className="space-y-1">
                      {message.type === 'text' && (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      
                      {message.type === 'image' && (
                        <div className="space-y-2">
                          <img
                            src={message.content}
                            alt="Shared image"
                            className="rounded-lg max-w-full"
                          />
                          {message.caption && (
                            <p className="text-sm">{message.caption}</p>
                          )}
                        </div>
                      )}
                      
                      {message.type === 'file' && (
                        <div className="flex items-center space-x-2 p-2 bg-secondary-100 rounded-lg">
                          <File className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {message.fileName}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {message.fileSize}
                            </p>
                          </div>
                        </div>
                      )}

                      {message.messageType === 'audio' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 bg-secondary-100 rounded-lg">
                            <Volume2 className="w-4 h-4" />
                            <div className="flex-1">
                              <audio 
                                controls 
                                src={message.fileUrl}
                                className="w-full h-8"
                              />
                            </div>
                          </div>
                          {message.content && message.content !== 'Audio message' && (
                            <p className="text-sm italic text-secondary-600">
                              "{message.content}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={cn(
                      "flex items-center justify-end mt-2 text-xs",
                      isOwnMessage(message) ? "text-primary-100" : "text-secondary-500"
                    )}>
                      <span>{formatTime(message.timestamp)}</span>
                      {isOwnMessage(message) && (
                        <div className="ml-2 flex items-center space-x-1">
                          {message.status === 'sent' && (
                            <div className="w-3 h-3 border border-current rounded-full"></div>
                          )}
                          {message.status === 'delivered' && (
                            <div className="w-3 h-3 border border-current rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                            </div>
                          )}
                          {message.status === 'read' && (
                            <div className="w-3 h-3 border border-current rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
          
          {typingUsers.size > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-secondary-200 rounded-2xl px-4 py-2">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-secondary-500 ml-2">typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-secondary-200 bg-white">
        <div className="flex items-end space-x-3">
          <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full resize-none border border-secondary-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            <button className="absolute right-3 bottom-3 p-1 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={newMessage.trim() ? handleSendMessage : () => setShowVoiceRecorder(true)}
            className={cn(
              "p-3 rounded-full transition-all duration-200",
              newMessage.trim()
                ? "bg-primary-600 text-white hover:bg-primary-700"

                : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
            )}
          >
            {newMessage.trim() ? (
              <Send className="w-5 h-5" />
              
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {showVoiceRecorder && (
          <div className="mt-3">
            <VoiceRecorder 
              onSendAudio={handleSendAudio}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
