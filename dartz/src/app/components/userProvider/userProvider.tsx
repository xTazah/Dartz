'use client'

import React, { useState, useEffect } from "react";
import { LoginPage } from "../login/login";
import {User} from '@/app/utils/types'



export const UserContext = React.createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};