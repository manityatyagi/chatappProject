

export const mockCurrentUser = {
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
};

export const mockChats = [
  { 
    id: 'c1', 
    name: 'Alice Johnson', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    lastMessage: 'Hello there!', 
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 2, 
    isOnline: true,
    isStarred: false
  },
  { 
    id: 'c2', 
    name: 'Bob Smith', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    lastMessage: 'How are you doing?', 
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 0, 
    isOnline: false,
    isStarred: true
  },
  { 
    id: 'c3', 
    name: 'Carol Davis', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
    lastMessage: 'See you tomorrow!', 
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unreadCount: 1, 
    isOnline: true,
    isStarred: false
  }
];

export const mockGroupChats = [
  { 
    id: 'g1', 
    name: 'Study Group', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=study',
    lastMessage: 'Let\'s meet tomorrow', 
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    unreadCount: 0, 
    isOnline: false,
    isStarred: false
  },
];

export const mockArchivedChats = [];

export const mockMessages = [
  { 
    id: 'm1', 
    chatId: 'c1', 
    senderId: 'u1', 
    senderName: 'Test User',
    content: 'Hi Alice!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: 'text',
    status: 'read'
  },
  { 
    id: 'm2', 
    chatId: 'c1', 
    senderId: 'c1', 
    senderName: 'Alice Johnson',
    content: 'Hello there!',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    type: 'text',
    status: 'delivered'
  },
];

export const mockAIMessages = [
  { 
    id: 1, 
    senderId: 'ai', 
    message: 'How can I help you today?', 
    timestamp: '09:00' 
  },
];


