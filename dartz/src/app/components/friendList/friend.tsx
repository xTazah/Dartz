import React from "react";
import styles from "../../styles/friendList.module.scss";
import {
  UserIcon,
  EllipsisHorizontalIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import { FriendlistUser } from "@/app/utils/types";
import UserComponent from "./User";
import { DotIcon } from "lucide-react";
import { Tooltip } from "@nextui-org/react";

interface FriendProps {
  user: FriendlistUser;
}

export default function Friend({ user }: FriendProps) {
  return (
    <div className="flex items-center justify-between mb-5 text-sm">
      <div className="flex items-center gap-1">
        <UserComponent username={user.user!.username} />
        <Tooltip
          className="text-black"
          showArrow
          content={user.online ? "online" : "offline"}
          closeDelay={0}
        >
          <DotIcon
            viewBox="6 6 12 12"
            color={user.online ? "green" : "red"}
          ></DotIcon>
        </Tooltip>
      </div>

      <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
    </div>
  );
}
