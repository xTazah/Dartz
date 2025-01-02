"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/friendList.module.scss";
import dropdownStyles from "../../styles/dropdown.module.scss";
import Image from "next/image";
import {
  Cog6ToothIcon,
  UserIcon,
  EllipsisHorizontalIcon,
  BellSlashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import Friend from "./friend";
import ThemeSwitcher from "../themeSwitcher/themeSwitcher";
import PlayerService from "@/app/services/playerService";
import { UserContext } from "../userProvider/userProvider";
import { Button } from "@/components/ui/button";
import { Button as NextUiButton } from "@nextui-org/react";
import { Badge } from "@/components/ui/badge";
import { SettingsDropdown } from "../settingsDropdown/settingsDropdown";
import { UnderConstruction } from "../underConstruction";
import { off } from "process";
import {
  DragDataType,
  FriendlistUser,
  FriendRequest,
  LobbyInvite,
  User,
} from "@/app/utils/types";
import {
  clearLobbyInvite,
  setupUserCallbacks,
} from "@/app/services/userService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, UserPlusIcon, PlayIcon } from "@heroicons/react/24/solid";
import Draggable from "../DragDrop/draggable";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function FriendList() {
  const friends: FriendlistUser[] = [
    {
      online: true,
      user: { id: 69, initial: "X", username: "xTazah" } as User,
    },
  ];

  const { user, inLobby } = useContext(UserContext)!;

  const router = useRouter();

  const [lobbyInvites, setLobbyInvites] = useState<Record<string, LobbyInvite>>(
    {}
  );
  const [friendRequests, setFriendRequests] = useState<
    Record<string, FriendRequest>
  >({});

  useEffect(() => {
    if (!user) return;

    const unsubscribe = setupUserCallbacks(
      user.id,
      setLobbyInvites,
      setFriendRequests
    );

    return () => unsubscribe();
  }, [user]);

  const handleAcceptInvite = (key: string, lobbyId: string) => {
    clearLobbyInvite(key, user);
    router.push(`/lobby?id=${lobbyId}`);
  };

  const handleDeclineInvite = (key: string) => {
    clearLobbyInvite(key, user);
  };

  const numNotifications =
    Object.values(lobbyInvites).length + Object.values(friendRequests).length;

  return (
    <div className={styles.friendList}>
      <div className={styles.userProfile}>
        <div className="flex flex-row items-center gap-3">
          <div className={`${styles.circle}`}>
            <UserIcon className="size-5 " />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                {numNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium">
                    {numNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-auto p-4 bg-[var(--component-background)] rounded-md shadow-lg"
            >
              <DropdownMenuLabel className="mb-2 text-lg font-medium">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator
                className={`${dropdownStyles.dropdownSeperator} my-2`}
              />
              {Object.keys(friendRequests).length > 0 && (
                <DropdownMenuGroup className="space-y-4">
                  {Object.entries(friendRequests).map(
                    ([key, friendRequest]) => (
                      <div
                        key={friendRequest.userId}
                        className="flex items-start gap-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bc6c25] text-white">
                          <UserPlusIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-sm font-medium">
                            Friend Request from {friendRequest.username}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                  <DropdownMenuSeparator
                    className={`${dropdownStyles.dropdownSeperator} my-2`}
                  />
                </DropdownMenuGroup>
              )}

              {Object.keys(lobbyInvites).length > 0 && (
                <DropdownMenuGroup className="space-y-4">
                  {Object.entries(lobbyInvites).map(([key, invite]) => (
                    <div key={key} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        <PlayIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Lobby Invite from: {invite.sender?.username}
                        </p>
                        <div className="flex gap-2">
                          <Tooltip
                            content={"You are already in a lobby"}
                            className="text-black"
                            showArrow
                            placement="top"
                            isDisabled={!inLobby}
                          >
                            <span>
                              <NextUiButton
                                onClick={() =>
                                  handleAcceptInvite(key, invite.lobbyId)
                                }
                                isIconOnly
                                isDisabled={inLobby}
                                className={`flex items-center gap-1 text-sm text-white rounded-full bg-[var(--primary)]`}
                              >
                                <CheckIcon className="h-5 w-5" />
                              </NextUiButton>
                            </span>
                          </Tooltip>
                          <NextUiButton
                            isIconOnly
                            onClick={() => handleDeclineInvite(key)}
                            className="flex items-center gap-1 text-sm text-white rounded-full bg-red-500"
                          >
                            <XMarkIcon className="size-5" />
                          </NextUiButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </DropdownMenuGroup>
              )}

              {numNotifications <= 0 && (
                <div>
                  <BellSlashIcon className="h-5 w-5" />
                  <p className="text-sm">No new Notifications</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div>{user?.username}</div>
        </div>
        <SettingsDropdown />
      </div>
      <div className={` ${styles.list} `}>
        <p className="title">Friend List</p>
        {friends.map((friend) => (
          <Draggable
            id={friend.user!.id}
            data={{ type: DragDataType.FRIEND, customData: friend.user }}
            key={friend.user?.id}
          >
            <Friend user={friend} />
          </Draggable>
        ))}
      </div>
    </div>
  );
}
