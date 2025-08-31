import React from 'react';
import { cn } from '../../libs/utils';
import { 
  Check, 
  CheckCheck, 
  Star, 
  MoreVertical, 
  Pin,
  Volume2,
  VolumeX,
  Users,
  Crown
} from 'lucide-react';
import { Badge } from './badge';
import { Tooltip } from './tooltip';

const ChatListItem = React.forwardRef(({ 
  chat, 
  isSelected = false, 
  isOnline = false,
  isPinned = false,
  isMuted = false,
  isGroup = false,
  isAdmin = false,
  onSelect,
  onStar,
  onPin,
  onMute,
  onMore,
  className,
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
      default:
        return null;
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return '';
    
    const maxLength = 50;
    const text = message.content || '';
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageTime.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onStar?.(chat.id, !chat.isStarred);
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    onPin?.(chat.id, !isPinned);
  };

  const handleMuteClick = (e) => {
    e.stopPropagation();
    onMute?.(chat.id, !isMuted);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    onMore?.(chat);
  };

  return (
    <div
      ref={ref}
      onClick={() => onSelect?.(chat)}
      className={cn(
        "group relative flex items-center space-x-3 p-3 cursor-pointer transition-all duration-200 hover:bg-secondary-50 rounded-lg",
        isSelected && "bg-primary-50 border border-primary-200",
        isPinned && "bg-secondary-50",
        className
      )}
      {...props}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
          alt={chat.name}
          className={cn(
            "w-12 h-12 rounded-full border-2 transition-colors",
            isOnline ? "border-success-500" : "border-secondary-200",
            isSelected && "border-primary-300"
          )}
        />
        
        {/* Online Status */}
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
        )}
        
        {/* Group Icon */}
        {isGroup && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
            <Users className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Admin Badge */}
        {isAdmin && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-primary-900" : "text-secondary-900"
          )}>
            {chat.name}
          </h3>
          
          <div className="flex items-center space-x-1">
            {/* Pin Icon */}
            {isPinned && (
              <Pin className="w-3 h-3 text-secondary-400" />
            )}
            
            {/* Time */}
            <span className="text-xs text-secondary-500">
              {formatTime(chat.lastMessage?.timestamp)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {/* Message Status */}
            {chat.lastMessage?.senderId === 'currentUser' && (
              <div className="flex-shrink-0">
                {getStatusIcon(chat.lastMessage?.status)}
              </div>
            )}
            
            {/* Last Message */}
            <p className={cn(
              "text-sm truncate",
              chat.unreadCount > 0 
                ? "text-secondary-900 font-medium" 
                : "text-secondary-600"
            )}>
              {formatLastMessage(chat.lastMessage)}
            </p>
          </div>
          
          {/* Unread Count */}
          {chat.unreadCount > 0 && (
            <Badge 
              variant="default" 
              className="ml-2 flex-shrink-0 bg-primary-500 text-white text-xs"
            >
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Star Button */}
        <Tooltip content={chat.isStarred ? "Remove from starred" : "Add to starred"}>
          <button
            onClick={handleStarClick}
            className={cn(
              "p-1 rounded hover:bg-secondary-200 transition-colors",
              chat.isStarred && "text-warning-500"
            )}
          >
            <Star className={cn("w-4 h-4", chat.isStarred && "fill-current")} />
          </button>
        </Tooltip>
        
        {/* Pin Button */}
        <Tooltip content={isPinned ? "Unpin chat" : "Pin chat"}>
          <button
            onClick={handlePinClick}
            className={cn(
              "p-1 rounded hover:bg-secondary-200 transition-colors",
              isPinned && "text-primary-500"
            )}
          >
            <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
          </button>
        </Tooltip>
        
        {/* Mute Button */}
        <Tooltip content={isMuted ? "Unmute notifications" : "Mute notifications"}>
          <button
            onClick={handleMuteClick}
            className={cn(
              "p-1 rounded hover:bg-secondary-200 transition-colors",
              isMuted && "text-secondary-500"
            )}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </Tooltip>
        
        {/* More Options */}
        <Tooltip content="More options">
          <button
            onClick={handleMoreClick}
            className="p-1 rounded hover:bg-secondary-200 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
});

ChatListItem.displayName = "ChatListItem";

export { ChatListItem };
