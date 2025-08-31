import React from 'react';
import { cn } from '../../libs/utils';
import { Check, CheckCheck, Clock, AlertCircle, Image as ImageIcon, File, Play, Pause } from 'lucide-react';

const MessageBubble = React.forwardRef(({ 
  message, 
  isOwn = false, 
  showAvatar = true,
  showTime = true,
  className,
  onRetry,
  ...props 
}, ref) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-secondary-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-secondary-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary-500" />;
      case 'sending':
        return <Clock className="w-3 h-3 text-secondary-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-error-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative group">
              <img 
                src={message.content} 
                alt="Shared image" 
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {message.caption && (
              <p className="text-sm text-secondary-700">{message.caption}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg border">
            <File className="w-8 h-8 text-primary-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {message.fileName || 'File'}
              </p>
              <p className="text-xs text-secondary-500">
                {message.fileSize && `${message.fileSize} • `}
                {message.fileType || 'Unknown type'}
              </p>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg border min-w-[200px]">
            <button className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
              <Play className="w-4 h-4 ml-0.5" />
            </button>
            <div className="flex-1">
              <div className="w-full bg-secondary-200 rounded-full h-1">
                <div className="bg-primary-500 h-1 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-secondary-500 mt-1">0:00 / {message.duration || '0:00'}</p>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-xs text-secondary-500 bg-secondary-100 rounded-full">
              {message.content}
            </span>
          </div>
        );
      
      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  const isSystemMessage = message.type === 'system';
  const hasError = message.status === 'error';

  return (
    <div
      ref={ref}
      className={cn(
        "group flex items-start space-x-2 mb-4 animate-slide-up",
        isOwn ? "flex-row-reverse space-x-reverse" : "",
        isSystemMessage ? "justify-center" : "",
        className
      )}
      {...props}
    >

      {showAvatar && !isSystemMessage && (
        <div className={cn(
          "flex-shrink-0",
          isOwn ? "order-1" : "order-0"
        )}>
          <img
            src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`}
            alt={message.senderName}
            className="w-8 h-8 rounded-full border-2 border-secondary-200"
          />
        </div>
      )}


      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>

        {!isOwn && !isSystemMessage && (
          <p className="text-xs font-medium text-secondary-600 mb-1">
            {message.senderName}
          </p>
        )}

        
        <div className={cn(
          "relative rounded-2xl px-4 py-2 shadow-soft",
          isOwn 
            ? "bg-primary-500 text-white" 
            : "bg-white text-secondary-900 border border-secondary-200",
          hasError && "border-error-200 bg-error-50",
          isSystemMessage && "bg-transparent shadow-none"
        )}>
          {renderMessageContent()}
          
          
          {hasError && (
            <button
              onClick={() => onRetry?.(message)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
            >
              <AlertCircle className="w-3 h-3" />
            </button>
          )}
        </div>


        {showTime && !isSystemMessage && (
          <div className={cn(
            "flex items-center space-x-1 mt-1",
            isOwn ? "flex-row-reverse space-x-reverse" : ""
          )}>
            <span className="text-xs text-secondary-500">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {isOwn && getStatusIcon(message.status)}
          </div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export { MessageBubble };
