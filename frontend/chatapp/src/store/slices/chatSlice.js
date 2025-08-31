import { createSlice } from '@reduxjs/toolkit';
import { mockChats, mockGroupChats, mockArchivedChats, mockMessages } from '../../mock';

const initialState = {
  selectedChat: null,
  chats: mockChats,
  groupChats: mockGroupChats,
  archivedChats: mockArchivedChats,
  messages: mockMessages,
  searchQuery: '',
  activeTab: 'chats',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    clearSelectedChat: (state) => {
      state.selectedChat = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload);
    },
    updateChat: (state, action) => {
      const { id, updates } = action.payload;
      const chat = state.chats.find(c => c.id === id) || 
                   state.groupChats.find(c => c.id === id) || 
                   state.archivedChats.find(c => c.id === id);
      if (chat) {
        Object.assign(chat, updates);
      }
    },
    archiveChat: (state, action) => {
      const chatId = action.payload;
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        const [chat] = state.chats.splice(chatIndex, 1);
        state.archivedChats.unshift(chat);
      }
    },
    deleteChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.filter(c => c.id !== chatId);
      state.groupChats = state.groupChats.filter(c => c.id !== chatId);
      state.archivedChats = state.archivedChats.filter(c => c.id !== chatId);
      state.messages = state.messages.filter(m => m.chatId !== chatId);
      if (state.selectedChat?.id === chatId) {
        state.selectedChat = null;
      }
    },
  },
});

export const {
  selectChat,
  clearSelectedChat,
  addMessage,
  setMessages,
  updateMessage,
  deleteMessage,
  setSearchQuery,
  setActiveTab,
  addChat,
  updateChat,
  archiveChat,
  deleteChat,
} = chatSlice.actions;

export default chatSlice.reducer;