"use client";

import React, { useContext, useState } from "react";
import styles from "../../styles/friendList.module.scss";
import Image from "next/image";
import {
  Cog6ToothIcon,
  UserIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import Friend from "./friend";
import ThemeSwitcher from "../themeSwitcher/themeSwitcher";
import PlayerService from "@/app/services/playerService";
import { UserContext } from "../userProvider/userProvider";
import { Button } from "@nextui-org/react";
import { SettingsDropdown } from "../settingsDropdown/settingsDropdown";
import { UnderConstruction } from "../underConstruction";

export default function FriendList() {
  const [selected, setSelected] = useState(1);
  const playerService = new PlayerService();
  const names = ["Timinz", "Tazah", "Bunkert", "Jonas", "Felix"];

  const context = useContext(UserContext);
  const { user } = context!;

  return (
    <div className={styles.friendList}>
      <div className={styles.userProfile}>
        <div className="flex flex-row items-center gap-3">
          <div className={`${styles.circle}`}>
            <UserIcon className="size-5 " />
          </div>
          <div>{user?.username}</div>
        </div>
        <SettingsDropdown />
      </div>
      <div className={` ${styles.list} `}>
        <p className="title">Friend List</p>
        <UnderConstruction>
          {names.map((name) => (
            <Friend key={name} name={name} />
          ))}
        </UnderConstruction>
      </div>
    </div>
  );
}
