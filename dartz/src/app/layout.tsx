import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Navigation from "./components/navigation/navigation";
import FriendList from "./components/friendList/friendList";
import BackNavigation from "./components/backNavigation/backNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dartz",
  description: "Dartz by Timinz & xTazah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grid grid-cols-12 gap-7 relative">
        <div className="absolute"> {/*this takes up space otherwise */}
          <Toaster closeButton /*richColors */ />
        </div>
        
        <div className="col-span-2">{ /* ToDo: navigation component shrinks but this still takes up 2 col always*/}
          <Navigation />
        </div>
        
        <div className="col-span-8 relative">
          <div className="top-0 z-10">
            <BackNavigation />
          </div>
          <main className={inter.className}>
            {children}
          </main>
        </div>
        
        <div className="col-span-2">
          <FriendList />
        </div>
      </body>
    </html>
  );
}
