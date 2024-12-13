'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import {User} from '@/app/utils/types'
import playerService from '@/app/services/playerService';
import { toast } from "sonner";
import { useState } from "react";


interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  
  const handleLogin = async () => {
    const service = new playerService();
    try {
      const payload = { username, password };
      const response = await service.login(payload);

      if (response.status === 200) {
        const userData: User = response.data;
        onLogin(userData);
      }
    } catch (err) {
      toast('Invalid username or password.');
      setError('Invalid username or password.');
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
