"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/friendList.module.scss";
import iconStyles from "../../styles/icon.module.scss";
import dropdownStyles from "../../styles/dropdown.module.scss";
import Image from "next/image";
import {
  Cog6ToothIcon,
  UserIcon,
  EllipsisHorizontalIcon,
  BellSlashIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import Friend from "./friend";
import ThemeSwitcher from "../themeSwitcher/themeSwitcher";
import PlayerService from "@/app/services/backend/playerService";
import { UserContext } from "../userProvider/userProvider";
import { Button } from "@/components/ui/button";
import { Input, Button as NextUiButton } from "@nextui-org/react";
import { Badge } from "@/components/ui/badge";
import { SettingsDropdown } from "../settingsDropdown/settingsDropdown";
import {
  DragDataType,
  FriendlistUser,
  FriendRequest,
  LobbyInvite,
  User,
} from "@/app/utils/types";
import {
  clearOpen,
  getOnlineStatus,
  sendFriendRequest,
  setupOnlineStatusListener,
  setupUserCallbacks,
} from "@/app/services/firebase/userService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, UserPlusIcon, PlayIcon } from "@heroicons/react/24/solid";
import Draggable from "../DragDrop/draggable";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import FriendsService from "@/app/services/backend/friendsService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { useFriendsStore } from "@/app/utils/globalStore";

export default function FriendList() {
  const { user, inLobby } = useContext(UserContext)!;

  const friendService = new FriendsService();
  const { friends, fetchFriends } = useFriendsStore();

  useEffect(() => {
    if (user) {
      fetchFriends(user.id);
    }
  }, [user, fetchFriends]);

  const [friendUsername, setFriendUsername] = useState("");

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

  const handleAcceptFriend = (key: string, userId2: number) => {
    clearOpen("FriendRequests", key, user);
    const friendService = new FriendsService();
    friendService
      .addFriend(user!.id, userId2)
      .then(() => fetchFriends(user!.id))
      .catch(() => toast("You are already friends with this user"));
  };

  const handleDeclineFriend = (key: string) => {
    clearOpen("FriendRequests", key, user);
  };

  const handleAcceptInvite = (key: string, lobbyId: string) => {
    clearOpen("LobbyInvites", key, user);
    router.push(`/lobby?id=${lobbyId}`);
  };

  const handleDeclineInvite = (key: string) => {
    clearOpen("LobbyInvites", key, user);
  };

  const numNotifications =
    Object.values(lobbyInvites).length + Object.values(friendRequests).length;

  return (
    <div
      className={` w-fill h-fill min-h-screen p-5 pt-20 lg:pt-5 bg-[var(--component-background)]`}
    >
      <div className={styles.userProfile}>
        <div className="flex flex-row items-center gap-3">
          <div className={`${styles.circle}`}>
            <UserIcon className="size-5 " />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative focus-visible:ring-inset ring-transparent focus-visible:ring-offset-0"
              >
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
              className={` w-auto min-w-52 p-4 rounded-md shadow-lg ${dropdownStyles.dropdownBackground}`}
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
                          <p className="text-sm font-medium">
                            Friend Request from {friendRequest.username}
                          </p>
                          <div className="flex gap-2 justify-end">
                            <NextUiButton
                              isIconOnly
                              onClick={() => handleDeclineFriend(key)}
                              className=" min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-red-500"
                            >
                              <XMarkIcon className="size-4" />
                            </NextUiButton>
                            <NextUiButton
                              onClick={() =>
                                handleAcceptFriend(key, friendRequest.userId)
                              }
                              isIconOnly
                              className={`min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-[var(--primary)]`}
                            >
                              <CheckIcon className="size-4" />
                            </NextUiButton>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  <DropdownMenuSeparator
                    className={`${dropdownStyles.dropdownSeperator} !my-2`}
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
                        <div className="flex gap-2 justify-end">
                          <NextUiButton
                            isIconOnly
                            onClick={() => handleDeclineInvite(key)}
                            className="min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-red-500"
                          >
                            <XMarkIcon className="size-4" />
                          </NextUiButton>
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
                                className={`min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-[var(--primary)]`}
                              >
                                <CheckIcon className="size-4" />
                              </NextUiButton>
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </DropdownMenuGroup>
              )}

              {numNotifications <= 0 && (
                <div className="flex items-center">
                  <BellSlashIcon className="h-5 w-5" />
                  <p className="ml-4 text-sm">No new Notifications</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div>{user?.username}</div>
        </div>
        <SettingsDropdown />
      </div>
      <div className={` ${styles.list} `}>
        <div className="flex justify-between items-center">
          <p className="title">Friend List</p>
          <Popover>
            <PopoverTrigger asChild>
              <PlusIcon
                className={`size-5 ${iconStyles.icon}`}
                color="#6F7172"
              />
            </PopoverTrigger>
            <PopoverContent
              sideOffset={5}
              side="left"
              align="start"
              className="w-72 p-4 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Add Friend</h4>
                  <p className="text-sm">
                    Send a friend request to another player
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="items-center">
                    <input
                      type="text"
                      value={friendUsername}
                      onChange={(e) => {
                        setFriendUsername(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendFriendRequest(user, friendUsername)
                            .then((success) => {
                              if (success) setFriendUsername("");
                            })
                            .catch((error) => {
                              if (error.status)
                                toast(
                                  "You are already friends with " +
                                    friendUsername
                                );
                            });
                        }
                      }}
                      placeholder="Username"
                      className="focus:outline outline-[var(--component-outline)] w-full col-span-2 h-8 text-white p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {friends &&
          friends
            .sort((a: FriendlistUser, b: FriendlistUser) => {
              if (a.online && !b.online) return -1;
              if (!a.online && b.online) return 1;

              return a.user!.username.localeCompare(b.user!.username);
            })
            .map((friend) => (
              <Draggable
                id={friend.user!.id}
                data={{ type: DragDataType.FRIEND, customData: friend.user }}
                key={friend.user?.id}
              >
                <Friend friendlistUser={friend} />
              </Draggable>
            ))}
      </div>
    </div>
  );
}
