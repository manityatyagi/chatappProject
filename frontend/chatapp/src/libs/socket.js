import { io } from 'socket.io-client';

let socketInstance;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });
  }
  return socketInstance;
};

export default getSocket;

