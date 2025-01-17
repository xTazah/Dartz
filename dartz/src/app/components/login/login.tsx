"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import { User } from "@/app/utils/types";
import PlayerService from "@/app/services/backend/playerService";
import { toast } from "sonner";
import { useContext, useState } from "react";
import { UserContext } from "@/app/components/userProvider/userProvider";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import Image from "next/image";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const router = useRouter();
  const context = useContext(UserContext);

  const handleLogin = async () => {
    const service = new PlayerService();
    setIsLoginLoading(true);
    try {
      const payload = { username, password };
      const response = await service.login(payload);

      if (response.status === 200) {
        const userData: User = response.data;
        context?.setUser(userData);
        router.push("/");
      }
    } catch (err) {
      toast("Invalid username or password.");
      setError("Invalid username or password.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    const service = new PlayerService();
    setIsSignupLoading(true);
    try {
      const payload = { username: signupUsername, password: signupPassword };
      const response = await service.signup(payload);

      if (response.status === 200) {
        toast("Account created successfully!");
        const userData: User = response.data;
        console.log(userData);
        context?.setUser(userData);
        router.push("/");
      }
    } catch (err) {
      toast("Failed to create account.");
      setSignupError("Failed to create account.");
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[(var(--background))]">
      <div className="w-[400px] p-6 flex flex-col items-center justify-center shadow-lg rounded bg-[var(--component-background)] text-[var(--font-color)]">
        <Image
          src="/images/DartsLogo.png"
          width={200}
          height={100}
          alt="Dartz Logo"
        />
        <Tabs defaultValue="login">
          <TabsList className="flex justify-center mb-4">
            <TabsTrigger value="login" className="px-4 py-2">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="px-4 py-2">
              Sign-Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="mt-4">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                placeholder="Username"
                className="focus:outline outline-[var(--component-outline)] w-full p-2 mb-4 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                placeholder="Password"
                className="focus:outline outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <Button
              className="mt-4 w-full bg-[var(--primary)]"
              onPress={handleLogin}
              isLoading={isLoginLoading}
              color="primary"
            >
              Login
            </Button>
          </TabsContent>
          <TabsContent value="signup">
            <div className="mt-4">
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => {
                  setSignupUsername(e.target.value);
                  setSignupError(null);
                }}
                onKeyDown={(e) => handleKeyDown(e, handleSignup)}
                placeholder="Username"
                className="focus:outline outline-[var(--component-outline)] w-full p-2 mb-4 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
              />
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value);
                  setSignupError(null);
                }}
                onKeyDown={(e) => handleKeyDown(e, handleSignup)}
                placeholder="Password"
                className="focus:outline outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
              />
            </div>
            {signupError && (
              <p className="text-red-500 text-sm mt-2">{signupError}</p>
            )}
            <Button
              className="mt-4 w-full bg-[var(--primary)]"
              onPress={handleSignup}
              isLoading={isSignupLoading}
              color="primary"
            >
              Sign Up
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
