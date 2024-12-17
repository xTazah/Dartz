"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/app/utils/types";
import PlayerService from "@/app/services/playerService";

export const UserContext = React.createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
} | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const service = new PlayerService();
      try {
        const response = await service.getUserBySession();
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch {
        setUser(null); // Explicitly set user to null
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return null; // Prevent rendering until session is checked
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
