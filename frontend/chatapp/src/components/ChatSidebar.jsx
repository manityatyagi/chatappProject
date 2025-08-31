import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { selectChat } from '../store/slices/chatSlice';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  X,
  Filter,
  Star
} from 'lucide-react';
import { cn } from '../libs/utils';

const ChatSidebar = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { chats, selectedChat } = useAppSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = chats.filter(chat => {
    const matchesSearch = (chat?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (chat?.lastMessage || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && chat?.unreadCount > 0) ||
                         (filterType === 'starred' && chat?.isStarred);
    return matchesSearch && matchesFilter;
  });

  const safeSearch = (searchTerm || "").toLowerCase();

  const filteredUsers = users.filter(user =>
    (user?.name || "").toLowerCase().includes(safeSearch)
  );

  const handleNewChat = () => {
    console.log('New chat clicked');
  };

  const handleChatSelect = (chat) => {
    dispatch(selectChat(chat));
    
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-secondary-900">ChatHive</h1>
            <p className="text-xs text-secondary-500">Connected</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-1">
          {[
            { id: 'all', label: 'All', count: chats.length },
            { id: 'unread', label: 'Unread', count: chats.filter(c => c.unreadCount > 0).length },
            { id: 'starred', label: 'Starred', count: chats.filter(c => c.isStarred).length }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                filterType === filter.id
                  ? "bg-primary-100 text-primary-700"
                  : "text-secondary-600 hover:bg-secondary-100"
              )}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-secondary-200 text-secondary-700 rounded-full text-xs">
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500 text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleNewChat}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Start your first conversation
                </button>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={cn(
                  "group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  selectedChat?.id === chat.id
                    ? "bg-primary-50 border border-primary-200"
                    : "hover:bg-secondary-50"
                )}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full border-2 border-secondary-200"
                  />
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-secondary-900 truncate">
                      {chat.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {chat.isStarred && (
                        <Star className="w-3 h-3 text-warning-500 fill-current" />
                      )}
                      {chat.lastMessageTime && (
                        <span className="text-xs text-secondary-500">
                          {new Date(chat.lastMessageTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-secondary-600 truncate flex-1">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full min-w-[18px] text-center">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                
                <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-all duration-200">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-secondary-200 p-4">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt="Profile"
            className="w-8 h-8 rounded-full border-2 border-secondary-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 truncate">
              {currentUser?.email || 'user@example.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;