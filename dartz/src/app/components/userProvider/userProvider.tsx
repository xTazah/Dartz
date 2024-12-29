"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/app/utils/types";
import PlayerService from "@/app/services/playerService";
import { LoadingSpinner } from "../loadingSpinner/loadingSpinner";

export const UserContext = React.createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
} | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const service = new PlayerService();

  useEffect(() => {
    try {
      service
        .getUserBySession()
        .then((response) => {
          if (response.status === 200) {
            setUser(response.data);
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } catch {
      setUser(null); // Explicitly set user to null
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingSpinner label="Waiting for API... (this may take up to a minute)" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
