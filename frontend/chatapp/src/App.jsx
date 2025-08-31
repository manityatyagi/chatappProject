import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from './store';
import LoginPage from './components/login.jsx';
import ChatLayout from './components/ChatLayout';
import { Toaster } from './components/ui/toaster';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { setLoading } from './store/slices/authSlice.js';
import "./index.css";
import "./App.css";
import api from './api/axios.js';

const API_BASE = import.meta.env.VITE_API_URL;

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await api.get('/');
      } catch (error) {
        // Handle error silently for demo
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading ChatHive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? (
                <ChatLayout />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;