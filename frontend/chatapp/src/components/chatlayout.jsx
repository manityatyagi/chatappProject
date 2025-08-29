import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import SubscriptionModal from './SubscriptionModal';

const ChatLayout = () => {
  const [activeRoom, setActiveRoom] = useState('general');
  const [messages, setMessages] = useState({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const user = {
    id: '1',
    name: 'User',
    email: 'user@example.com',
    avatar: null,
    subscription: {
      plan: 'free',
      isActive: false
    }
  };

  const rooms = [
    {
      id: 'general',
      name: 'General',
      type: 'group',
      participants: [],
      isAiBot: false
    },
    {
      id: 'ai-bot',
      name: 'AI Assistant',
      type: 'ai',
      participants: [],
      isAiBot: true
    }
  ];

  const handleSendMessage = (content) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), newMessage]
    }));
  };

  const handleRoomChange = (roomId) => {
    setActiveRoom(roomId);
  };

  const handleSubscriptionUpgrade = (plan) => {
    setShowSubscriptionModal(false);
    // Subscription upgrade logic would go here
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ChatSidebar
        user={user}
        activeRoom={activeRoom}
        rooms={rooms}
        onRoomChange={handleRoomChange}
        onShowSubscription={() => setShowSubscriptionModal(true)}
      />

      <div className="flex-1 flex flex-col">
        <ChatArea
          activeRoom={activeRoom}
          messages={messages[activeRoom] || []}
          user={user}
          rooms={rooms}
          onSendMessage={handleSendMessage}
          onShowSubscription={() => setShowSubscriptionModal(true)}
        />
      </div>

      {showSubscriptionModal && (
        <SubscriptionModal
          user={user}
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={handleSubscriptionUpgrade}
        />
      )}
    </div>
  );
};

export default ChatLayout;