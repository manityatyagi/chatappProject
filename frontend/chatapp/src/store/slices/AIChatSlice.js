import { createSlice } from '@reduxjs/toolkit';
import { mockAIMessages } from '../../mock';

const initialState = {
  messages: mockAIMessages,
  isTyping: false,
  isActive: false,
  suggestions: ["Write an email", "Explain a concept", "Generate ideas", "Help with code"],
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    activateAIChat: (state) => {
      state.isActive = true;
    },
    deactivateAIChat: (state) => {
      state.isActive = false;
    },
    addAIMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setAITyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearAIMessages: (state) => {
      state.messages = mockAIMessages;
    },
    updateAIMessage: (state, action) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
  },
});

export const {
  activateAIChat,
  deactivateAIChat,
  addAIMessage,
  setAITyping,
  clearAIMessages,
  updateAIMessage,
} = aiChatSlice.actions;

export default aiChatSlice.reducer;