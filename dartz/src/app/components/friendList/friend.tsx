import React, { useContext } from "react";
import styles from "../../styles/friendList.module.scss";
import iconStyles from "../../styles/icon.module.scss";
import dropdownStyles from "../../styles/dropdown.module.scss";
import {
  UserMinusIcon,
  EllipsisHorizontalIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import { FriendlistUser } from "@/app/utils/types";
import UserComponent from "./User";
import { DotIcon } from "lucide-react";
import { Tooltip } from "@nextui-org/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FriendsService from "@/app/services/backend/friendsService";
import { UserContext } from "../userProvider/userProvider";

interface FriendProps {
  friendlistUser: FriendlistUser;
}

export default function Friend({ friendlistUser }: FriendProps) {
  const friendsService = new FriendsService();
  const { user } = useContext(UserContext)!;

  return (
    <div className="flex items-center justify-between mb-5 text-sm">
      <div className="flex items-center gap-1">
        <UserComponent username={friendlistUser.user!.username} />
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisHorizontalIcon
            className={`size-5 ${iconStyles.icon}`}
            color="#6F7172"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`w-56 ${dropdownStyles.dropdownBackground}`}
        >
          <DropdownMenuLabel>{friendlistUser.user?.username}</DropdownMenuLabel>
          <DropdownMenuSeparator
            className={`${dropdownStyles.dropdownSeperator}`}
          />

          <DropdownMenuItem
            className={`${dropdownStyles.dropdownItem}`}
            onClick={() => {
              console.log("removing friend");
              friendsService
                .removeFriend(user!.id, friendlistUser.user!.id)
                .then(() => console.log("Friend removed successfully"));
            }}
          >
            <UserMinusIcon
              className={`size-5 ${iconStyles.icon}`}
              color="#6F7172"
            />
            Remove Friend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
