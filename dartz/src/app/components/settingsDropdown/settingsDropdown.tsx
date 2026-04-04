"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Cog6ToothIcon,
  UserIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/solid";

import iconStyles from "../../styles/icon.module.scss";
import PlayerService from "@/app/services/backend/playerService";
import { useContext, useState } from "react";
import { UserContext } from "../userProvider/userProvider";
import { disconnectSignalR } from "@/app/services/gameServer/signalRClient";
import { useRouter } from "next/navigation";

export function SettingsDropdown() {
  const playerService = new PlayerService();
  const context = useContext(UserContext);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setOpen(false);
    playerService.logout().then(() => {
      disconnectSignalR();
      context?.setUser(null);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-[var(--component-background-hover)] transition-colors">
          <Cog6ToothIcon
            className={`size-5 ${iconStyles.icon}`}
            color="#6F7172"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={5}
        side="left"
        align="start"
        className="w-48 p-3 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
      >
        <div className="grid gap-1">
          <h4 className="font-medium leading-none mb-2 text-sm text-[var(--font-color-muted)]">
            Account Settings
          </h4>
          
          <button
            onClick={() => handleNavigation("/profile")}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-[var(--font-color)] hover:bg-[var(--component-background-hover)] transition-colors text-left"
          >
            <UserIcon className="size-4" color="#6F7172" />
            Profile
          </button>
          
          <button
            onClick={() => handleNavigation("/settings")}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-[var(--font-color)] hover:bg-[var(--component-background-hover)] transition-colors text-left"
          >
            <Cog6ToothIcon className="size-4" color="#6F7172" />
            Settings
          </button>
          
          <div className="h-px bg-[var(--component-background-hover)] my-1" />
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-red-400 hover:bg-[var(--component-background-hover)] transition-colors text-left"
          >
            <ArrowLeftEndOnRectangleIcon className="size-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
