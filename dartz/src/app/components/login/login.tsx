'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import {User} from '@/app/utils/types'


interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleLogin = () => {
    // Simulate login logic
    const userData: User = { id:1, username: "John Pork", initial:"J" };
    onLogin(userData);
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
            <p>Make changes to your account here.</p>
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
