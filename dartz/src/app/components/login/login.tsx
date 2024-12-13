"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import { User } from "@/app/utils/types";
import PlayerService from "@/app/services/playerService";
import { toast } from "sonner";
import { useContext, useState } from "react";
import { Checkbox } from "@nextui-org/react";

import { UserContext } from "@/app/components/userProvider/userProvider";
import { useRouter } from "next/navigation";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const context = useContext(UserContext);

  const handleLogin = async () => {
    const service = new PlayerService();
    try {
      const payload = { Username: username, Password: password };
      const response = await service.login(payload);

      if (response.status === 200) {
        const userData: User = response.data;
        context?.setUser(userData);
        router.push("/");
      }
    } catch (err) {
      toast("Invalid username or password.");
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-[400px] p-6 bg-white shadow-lg rounded">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p>Login to your account here.</p>
            <div className="mt-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border rounded"
              />
              <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
                Remember me?
              </Checkbox>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleLogin}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Login
            </button>
          </TabsContent>
          <TabsContent value="password">
            <p>Change your password here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
