"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import { Toaster } from "sonner";
import Navigation from "../../components/navigation/navigation";
import FriendList from "../../components/friendList/friendList";
import BackNavigation from "../../components/backNavigation/backNavigation";
import { withAuth } from "@/app/components/withAuth";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { DragDataType } from "@/app/utils/types";
import { WaitingLobbyDragDropProps } from "@/app/components/lobby/waitingLobby";

const inter = Inter({ subsets: ["latin"] });

function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (
      over?.id === WaitingLobbyDragDropProps.dropzoneId &&
      WaitingLobbyDragDropProps.dragDataTypes.includes(
        active?.data.current?.type as DragDataType
      )
    ) {
      console.log(`Invite ${active.id} to the lobby`);
      // Perform the invite action here
    } else {
      console.log("Invalid drop");
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;

    // check if drop is valid
    if (
      over?.id === WaitingLobbyDragDropProps.dropzoneId &&
      WaitingLobbyDragDropProps.dragDataTypes.includes(
        active?.data.current?.type as DragDataType
      )
    ) {
      console.log("Valid drop here"); //todo set highlight of dropzone here
    } else {
      console.log("Invalid drop");
    }
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={(event) => {
        console.log("Drag started", event.active.id);
        //todo: only set dashed broder on dropzones when item is dragged
      }}
    >
      <div className="grid grid-cols-12 gap-7 relative">
        <div className={collapsed ? "col-span-1" : "col-span-2"}>
          <Navigation collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        <div
          className={collapsed ? "col-span-9 relative" : "col-span-8 relative"}
        >
          <div className="top-0 z-10">
            <BackNavigation />
          </div>
          <main className={inter.className}>{children}</main>
        </div>

        <div className="col-span-2">
          <FriendList />
        </div>
      </div>
    </DndContext>
  );
}

export default withAuth(ProtectedLayout);
