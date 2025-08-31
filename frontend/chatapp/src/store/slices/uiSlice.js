import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarVisible: true,
  theme: 'light',
  activeTab: 'chats', 
  notifications: [],
  modals: {
    settings: false,
    profile: false,
    newChat: false,
  },
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarVisible = !state.sidebarVisible;
    },
    setSidebarVisible: (state, action) => {
      state.sidebarVisible = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarVisible,
  setTheme,
  setActiveTab,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;