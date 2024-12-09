import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";
import Navigation from "../components/navigation/navigation";
import FriendList from "../components/friendList/friendList";
import BackNavigation from "../components/backNavigation/backNavigation";
import { UserProvider } from "../components/userProvider/userProvider";

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
      <body>
        <UserProvider>
          <div className="grid grid-cols-12 gap-7 relative">
            <div className="absolute">
              <Toaster closeButton />
            </div>

            <div className="col-span-2">
              <Navigation />
            </div>

            <div className="col-span-8 relative">
              <div className="top-0 z-10">
                <BackNavigation />
              </div>
              <main className={inter.className}>{children}</main>
            </div>

            <div className="col-span-2">
              <FriendList />
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}