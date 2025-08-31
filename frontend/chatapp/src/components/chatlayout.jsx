import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setActiveTab } from '../store/slices/uiSlice';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import AIChat from './AIChat';
import UserProfile from './UserProfile';
import { Menu, X, MessageSquare, Bot, Users } from 'lucide-react';
import { cn } from '../libs/utils';

const ChatLayout = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { activeTab } = useAppSelector((state) => state.ui);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const tabs = [
    { id: 'chats', label: 'Chats', icon: Users },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  const handleTabChange = (tabId) => {
    dispatch(setActiveTab(tabId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AIChat />;
      case 'chats':
      default:
        return <ChatArea />;
    }
  };

  return (
    <div className="h-screen bg-secondary-50 flex overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-strong transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-secondary-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-primary-50 text-primary-700 border border-primary-200"
                          : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-secondary-600">
                <span>Welcome,</span>
                <span className="font-medium text-secondary-900">
                  {currentUser?.name || 'User'}
                </span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="relative group"
                >
                  <img
                    src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-secondary-200 hover:border-primary-300 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>

      <UserProfile 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </div>
  );
};

export default ChatLayout;