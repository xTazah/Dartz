"use client";

import React, { useState, useEffect } from "react";
import { LoginPage } from "../login/login";
import { User } from "@/app/utils/types";
import PlayerService from "@/app/services/playerService";
import { useRouter } from "next/navigation";

export const UserContext = React.createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
} | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    //checks if the user can be logged in using cookies
    const checkSession = async () => {
      try {
        const service = new PlayerService();
        const response = await service
          .getUserBySession()
          .then((response) => {
            if (response.status === 200) {
              setUser(response.data);
              router.push("/");
            }
          })
          .catch((response) => {
            router.push("/login");
          });
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    checkSession();
  }, []);

  //handle logout
  useEffect(() => {
    if (user == null) router.push("/login");
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
