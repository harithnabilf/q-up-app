import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// The context is created and exported here. This is correct.
export const QueueContext = createContext();

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export const QueueProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const value = {
    socket,
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
};