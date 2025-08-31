import React, { useState, useEffect } from 'react';
import { cn } from '../../libs/utils';
import { 
  Bot, 
  Copy, 
  Check, 
  Download,
  Play,
  Code,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Button } from './button';
import { Tooltip } from './tooltip';

const AIChatMessage = React.forwardRef(({ 
  message, 
  isTyping = false,
  isStreaming = false,
  onCopy,
  onRegenerate,
  onContinue,
  className,
  ...props 
}, ref) => {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isStreaming && message.content) {
      const timer = setTimeout(() => {
        if (currentIndex < message.content.length) {
          setDisplayedContent(message.content.substring(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, 20);

      return () => clearTimeout(timer);
    } else if (!isStreaming) {
      setDisplayedContent(message.content || '');
      setCurrentIndex(message.content?.length || 0);
    }
  }, [isStreaming, message.content, currentIndex]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderContent = () => {
    if (message.type === 'code') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-secondary-50 rounded-t-lg border border-secondary-200">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-700">
                {message.language || 'Code'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Tooltip content="Copy code">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 text-secondary-600 hover:text-secondary-900"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </Tooltip>
              {message.runnable && (
                <Tooltip content="Run code">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-secondary-600 hover:text-secondary-900"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
          <pre className="p-4 bg-secondary-900 text-secondary-100 rounded-b-lg overflow-x-auto text-sm">
            <code>{displayedContent}</code>
          </pre>
        </div>
      );
    }

    if (message.type === 'image') {
      return (
        <div className="space-y-2">
          <img 
            src={message.content} 
            alt="AI generated image" 
            className="max-w-full rounded-lg border border-secondary-200"
          />
          {message.prompt && (
            <p className="text-sm text-secondary-600 italic">
              "{message.prompt}"
            </p>
          )}
        </div>
      );
    }
    
    return (
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap leading-relaxed">
          {displayedContent}
          {isTyping && (
            <span className="inline-block w-2 h-4 bg-primary-500 ml-1 animate-pulse"></span>
          )}
        </p>
      </div>
    );
  };

  const isAI = message.sender === 'ai';
  const hasActions = message.actions && message.actions.length > 0;

  return (
    <div
      ref={ref}
      className={cn(
        "group flex items-start space-x-3 mb-6 animate-slide-up",
        isAI ? "flex-row" : "flex-row-reverse space-x-reverse",
        className
      )}
      {...props}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isAI ? (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-secondary-600" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isAI ? "text-left" : "text-right"
      )}>
        {/* Sender Name */}
        <div className={cn(
          "flex items-center space-x-2 mb-2",
          isAI ? "justify-start" : "justify-end"
        )}>
          {isAI && (
            <>
              <span className="text-sm font-medium text-secondary-900">
                AI Assistant
              </span>
              <Sparkles className="w-4 h-4 text-warning-500" />
            </>
          )}
          {!isAI && (
            <span className="text-sm font-medium text-secondary-900">
              You
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          "relative rounded-2xl px-4 py-3 shadow-soft",
          isAI 
            ? "bg-white text-secondary-900 border border-secondary-200" 
            : "bg-primary-500 text-white"
        )}>
          {renderContent()}
          
          {/* Copy Button for AI messages */}
          {isAI && message.content && !isTyping && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip content="Copy message">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 text-secondary-600 hover:text-secondary-900"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isAI && hasActions && !isTyping && (
          <div className="flex items-center space-x-2 mt-3">
            {message.actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => action.onClick?.(message)}
                className="text-xs"
              >
                {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Regenerate/Continue Buttons */}
        {isAI && !isTyping && (
          <div className="flex items-center space-x-2 mt-3">
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate(message)}
                className="text-xs text-secondary-600 hover:text-secondary-900"
              >
                Regenerate
              </Button>
            )}
            {onContinue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onContinue(message)}
                className="text-xs text-secondary-600 hover:text-secondary-900"
              >
                Continue
              </Button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "flex items-center space-x-1 mt-2",
          isAI ? "justify-start" : "justify-end"
        )}>
          <span className="text-xs text-secondary-500">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
});

AIChatMessage.displayName = "AIChatMessage";

export { AIChatMessage };
