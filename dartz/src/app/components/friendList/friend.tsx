import React, { useContext, useState } from "react";
import styles from "../../styles/friendList.module.scss";
import iconStyles from "../../styles/icon.module.scss";
import {
  UserMinusIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import { FriendlistUser } from "@/app/utils/types";
import UserComponent from "./User";
import { DotIcon } from "lucide-react";
import { Tooltip } from "@nextui-org/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FriendsService from "@/app/services/backend/friendsService";
import { UserContext } from "../userProvider/userProvider";
import { useFriendsStore } from "@/app/utils/globalStore";

interface FriendProps {
  friendlistUser: FriendlistUser;
}

export default function Friend({ friendlistUser }: FriendProps) {
  const friendsService = new FriendsService();
  const { user } = useContext(UserContext)!;
  const { fetchFriends } = useFriendsStore();
  const [open, setOpen] = useState(false);

  const handleRemoveFriend = async () => {
    setOpen(false);
    await friendsService.removeFriend(user!.id, friendlistUser.user!.id);
    fetchFriends(user!.id);
  };

  return (
    <div className="flex items-center justify-between mb-5 text-sm">
      <div className="flex items-center gap-1">
        <UserComponent username={friendlistUser.user!.username} ProfilePicture={friendlistUser.user!.profilePicture} />
        <Tooltip
          className="text-black"
          showArrow
          content={friendlistUser.online ? "online" : "offline"}
          closeDelay={0}
        >
          <DotIcon
            viewBox="6 6 12 12"
            color={friendlistUser.online ? "green" : "red"}
          ></DotIcon>
        </Tooltip>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button 
            className="p-1 rounded hover:bg-[var(--component-background-hover)] transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <EllipsisHorizontalIcon
              className={`size-5 ${iconStyles.icon}`}
              color="#6F7172"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={5}
          side="left"
          align="start"
          className="w-44 p-3 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="grid gap-1">
            <h4 className="font-medium leading-none mb-2 text-sm text-[var(--font-color-muted)]">
              {friendlistUser.user?.username}
            </h4>
            
            <button
              onClick={handleRemoveFriend}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-red-400 hover:bg-[var(--component-background-hover)] transition-colors text-left"
            >
              <UserMinusIcon className="size-4" />
              Remove Friend
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
