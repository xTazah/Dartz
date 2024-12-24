"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import { Toaster } from "sonner";
import Navigation from "../../components/navigation/navigation";
import FriendList from "../../components/friendList/friendList";
import BackNavigation from "../../components/backNavigation/backNavigation";
import { withAuth } from "@/app/components/withAuth";

const inter = Inter({ subsets: ["latin"] });

function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="grid grid-cols-12 gap-7 relative">

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
    </>
  );
}

export default withAuth(ProtectedLayout);
