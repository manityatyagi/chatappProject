import React, { useState, useRef } from 'react';
import { cn } from '../../libs/utils';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff, 
  Image as ImageIcon,
  File,
  X,
  Plus
} from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Tooltip } from './tooltip';

const ChatInput = React.forwardRef(({ 
  onSend, 
  onFileUpload, 
  onEmojiSelect,
  onVoiceRecord,
  isRecording = false,
  isTyping = false,
  disabled = false,
  placeholder = "Type a message...",
  className,
  ...props 
}, ref) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend?.(message.trim());
      setMessage('');
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onFileUpload?.(files, type);
    }
    // Reset input
    event.target.value = '';
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      onVoiceRecord?.('stop');
    } else {
      onVoiceRecord?.('start');
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    onEmojiSelect?.(emoji);
  };

  const quickEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👏', '🙏'];

  return (
    <div
      ref={ref}
      className={cn(
        "border-t border-secondary-200 bg-white p-4 space-y-3",
        className
      )}
      {...props}
    >
      {/* Emoji Quick Picker */}
      {isExpanded && (
        <div className="flex items-center space-x-2 p-2 bg-secondary-50 rounded-lg">
          {quickEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 text-lg hover:bg-white rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end space-x-2">
        {/* Attachment Button */}
        <Tooltip content="Attach file">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="text-secondary-600 hover:text-secondary-900"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        </Tooltip>

        {/* Image Upload Button */}
        <Tooltip content="Send image">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="text-secondary-600 hover:text-secondary-900"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
        </Tooltip>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-32 resize-none pr-12"
            rows={1}
          />
          
          {/* Emoji Button */}
          <Tooltip content="Add emoji">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className="absolute right-2 bottom-2 text-secondary-600 hover:text-secondary-900"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </Tooltip>
        </div>

        {/* Voice Record Button */}
        <Tooltip content={isRecording ? "Stop recording" : "Voice message"}>
          <Button
            variant={isRecording ? "default" : "ghost"}
            size="icon"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={cn(
              isRecording 
                ? "bg-error-500 hover:bg-error-600 text-white" 
                : "text-secondary-600 hover:text-secondary-900"
            )}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        </Tooltip>

        {/* Send Button */}
        <Tooltip content="Send message">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </Tooltip>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 p-2 bg-error-50 border border-error-200 rounded-lg">
          <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-error-700">Recording... Tap to stop</span>
        </div>
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 text-sm text-secondary-500">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>Someone is typing...</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e, 'file')}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e, 'image')}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export { ChatInput };
