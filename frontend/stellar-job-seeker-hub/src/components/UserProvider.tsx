
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user } = useAuth();

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
