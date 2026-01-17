"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/app/utils/types";
import PlayerService from "@/app/services/backend/playerService";
import { LoadingSpinner } from "../loadingSpinner/loadingSpinner";
import { handleUserLogin } from "@/app/services/firebase/userService";

export const UserContext = React.createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  inLobby: boolean;
  setInLobby: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [inLobby, setInLobby] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new PlayerService();
    try {
      service
        .getUserBySession()
        .then((response) => {
          if (response.status === 200) {
            const user = response.data as User;

            setUser(user);
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } catch {
      setUser(null); // Explicitly set user to null
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) handleUserLogin(user);
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner label="Waiting for API... (this may take up to a minute)" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser, inLobby, setInLobby }}>
      {children}
    </UserContext.Provider>
  );
};
