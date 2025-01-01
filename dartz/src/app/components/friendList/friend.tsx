import React from "react";
import styles from "../../styles/friendList.module.scss";
import { UserIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import { FriendlistUser } from "@/app/utils/types";
import UserComponent from "./User";

interface FriendProps {
  user: FriendlistUser;
}

export default function Friend({ user }: FriendProps) {
  return (
    <div className={`${styles.friendProfile}`}>
      <UserComponent username={user.user!.username} />

      <EllipsisHorizontalIcon
        className={`size-5 ${styles.icon}`}
        color="#6F7172"
      />
    </div>
  );
}
