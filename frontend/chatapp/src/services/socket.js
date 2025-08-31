import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    const BACKEND_URL = import.meta.env.VITE_API_URL;
    
    this.socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinChat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveChat', chatId);
    }
  }

sendMessage(chatId, content, messageType = 'text', fileUrl = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', {
        chatId,
        content,
        messageType,
        fileUrl
      });
    }
  }

sendAudioMessage(chatId, audioUrl, transcript) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendAudioMessage', {
        chatId,
        audioUrl,
        transcript
      });
    }
  }

setTyping(chatId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }
  
onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receiveMessage');
    }
  }

offUserTyping() {
    if (this.socket) {
      this.socket.off('userTyping');
    }
  }

getSocket() {
    return this.socket;
  }
}

export default new SocketService();
