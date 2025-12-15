"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io as socketIO } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    const newSocket = socketIO(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);

      // Emit user_connected event with user ID
      newSocket.emit('user_connected', session.user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session, status]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context;
};
