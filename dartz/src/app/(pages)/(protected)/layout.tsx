"use client";

import { Inter } from "next/font/google";
import "../../globals.css";
import Navigation from "../../components/navigation/navigation";
import FriendList from "../../components/friendList/friendList";
import BackNavigation from "../../components/backNavigation/backNavigation";
import { withAuth } from "@/app/components/withAuth";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import PhoneNavigation from "@/app/components/navigation/phoneNavigation";

const inter = Inter({ subsets: ["latin"] });

function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  const [friendListCollapsed, setFriendListCollapsed] = useState(false);

  return (
    <DndContext>
      <div className="grid grid-cols-12 gap-7 relative">
        <div
          className={
            collapsed
              ? "hidden lg:block lg:col-span-1"
              : "hidden lg:block lg:col-span-2"
          }
        >
          <Navigation collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        <div
          className={
            collapsed
              ? "pt-20 pb-20 p-8 lg:p-0 col-span-12 lg:col-span-9 relative "
              : "pt-20 pb-20 p-8 lg:p-0 col-span-12 lg:col-span-8 relative"
          }
        >
          {/* <div className="top-0 z-10">
            <BackNavigation />
          </div> */}
          <main className={`${inter.className} mt-4`}>{children}</main>
        </div>

        <div className={` ${friendListCollapsed? "block" :"hidden"} lg:block fixed top-0 w-full col-span-12 lg:static lg:col-span-2`}>
          <FriendList />
        </div>
        <PhoneNavigation friendListCollapsed={friendListCollapsed} setFriendListCollapsed={setFriendListCollapsed} />
      </div>
    </DndContext>
  );
}

export default withAuth(ProtectedLayout);
