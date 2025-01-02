"use client";

import { Inter } from "next/font/google";
import "../../globals.css";
import Navigation from "../../components/navigation/navigation";
import FriendList from "../../components/friendList/friendList";
import BackNavigation from "../../components/backNavigation/backNavigation";
import { withAuth } from "@/app/components/withAuth";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";

const inter = Inter({ subsets: ["latin"] });

function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DndContext>
      <div className="grid grid-cols-12 gap-7 relative">
        <div className={collapsed ? "col-span-1" : "col-span-2"}>
          <Navigation collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        <div
          className={collapsed ? "col-span-9 relative" : "col-span-8 relative"}
        >
          {/* <div className="top-0 z-10">
            <BackNavigation />
          </div> */}
          <main className={`${inter.className} mt-4`}>{children}</main>
        </div>

        <div className="col-span-2">
          <FriendList />
        </div>
      </div>
    </DndContext>
  );
}

export default withAuth(ProtectedLayout);
