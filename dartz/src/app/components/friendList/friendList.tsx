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
  onLobbyInviteReceived,
  onLobbyInviteRemoved,
  onFriendRequestReceived,
  onPendingInvites,
  onPendingFriendRequests,
  clearLobbyInvite,
  clearFriendRequest,
  sendFriendRequest as sendFriendRequestSignalR,
  inviteUserToLobby as inviteUserToLobbySignalR,
} from "@/app/services/gameServer/userService";
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

    const unsubInvites = onLobbyInviteReceived((invite: any) => {
      setLobbyInvites((prev: any) => ({ ...prev, [invite.key]: invite }));
    });
    const unsubRemoved = onLobbyInviteRemoved((key: string) => {
      setLobbyInvites((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });
    const unsubRequests = onFriendRequestReceived((request: any) => {
      setFriendRequests((prev: any) => ({ ...prev, [request.key]: request }));
    });
    const unsubPending = onPendingInvites((invites: any[]) => {
      const mapped: Record<string, any> = {};
      invites.forEach((i: any) => { mapped[i.key] = i; });
      setLobbyInvites(mapped);
    });
    const unsubPendingFR = onPendingFriendRequests((requests: any[]) => {
      const mapped: Record<string, any> = {};
      requests.forEach((r: any) => { mapped[r.key] = r; });
      setFriendRequests(mapped);
    });

    return () => { unsubInvites(); unsubRemoved(); unsubRequests(); unsubPending(); unsubPendingFR(); };
  }, [user]);

  const handleAcceptFriend = (key: string, userId2: number) => {
    clearFriendRequest(user!.id, key);
    const friendService = new FriendsService();
    friendService
      .addFriend(user!.id, userId2)
      .then(() => fetchFriends(user!.id))
      .catch(() => toast("You are already friends with this user"));
  };

  const handleDeclineFriend = (key: string) => {
    clearFriendRequest(user!.id, key);
  };

  const removeInviteLocal = (key: string) => {
    setLobbyInvites((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAcceptInvite = (key: string, lobbyId: string) => {
    clearLobbyInvite(user!.id, key);
    removeInviteLocal(key);
    router.push(`/lobby?id=${lobbyId}`);
  };

  const handleDeclineInvite = (key: string) => {
    clearLobbyInvite(user!.id, key);
    removeInviteLocal(key);
  };

  const numNotifications =
    Object.values(lobbyInvites).length + Object.values(friendRequests).length;

  return (
    <div
      className={`w-full min-h-screen h-full p-5 pt-20 lg:pt-5 bg-[var(--component-background)] overflow-y-auto`}
    >
      <div className={styles.userProfile}>
        <div className="flex flex-row items-center gap-3">
        <div className={`${styles.circle}`}>
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={user.username} className={`${styles.friendListImage}`} />
          ) : (

              <UserIcon className="size-5 " />
            
          )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-1 rounded hover:bg-[var(--component-background-hover)] transition-colors">
                <BellIcon className="h-5 w-5" />
                {numNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium">
                    {numNotifications}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={8}
              side="left"
              align="start"
              className="w-72 p-4 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
            >
              <div className="grid gap-3">
                <h4 className="font-medium leading-none text-sm text-[var(--font-color-muted)]">
                  Notifications
                </h4>
                
                {Object.keys(friendRequests).length > 0 && (
                  <div className="space-y-3 border-t border-[var(--component-outline)] pt-3">
                    {Object.entries(friendRequests).map(
                      ([key, friendRequest]) => (
                        <div
                          key={friendRequest.userId}
                          className="flex items-start gap-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bc6c25] text-white flex-shrink-0">
                            <UserPlusIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              Friend request from{" "}
                              <span className="font-medium">{friendRequest.username}</span>
                            </p>
                            <div className="flex gap-2 mt-2">
                              <NextUiButton
                                isIconOnly
                                onClick={() => handleDeclineFriend(key)}
                                className="min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-red-500"
                              >
                                <XMarkIcon className="size-4" />
                              </NextUiButton>
                              <NextUiButton
                                onClick={() =>
                                  handleAcceptFriend(key, friendRequest.userId)
                                }
                                isIconOnly
                                className="min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-[var(--primary)]"
                              >
                                <CheckIcon className="size-4" />
                              </NextUiButton>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {Object.keys(lobbyInvites).length > 0 && (
                  <div className="space-y-3 border-t border-[var(--component-outline)] pt-3">
                    {Object.entries(lobbyInvites).map(([key, invite]) => (
                      <div key={key} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6] text-white flex-shrink-0">
                          <PlayIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            Lobby invite from{" "}
                            <span className="font-medium">{invite.senderUsername}</span>
                          </p>
                          <div className="flex gap-2 mt-2">
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
                                  className="min-w-6 h-6 w-6 flex items-center gap-1 text-sm text-white rounded-full bg-[var(--primary)]"
                                >
                                  <CheckIcon className="size-4" />
                                </NextUiButton>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {numNotifications <= 0 && (
                  <div className="flex items-center gap-3 text-[var(--font-color-muted)] py-2">
                    <BellSlashIcon className="h-5 w-5" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

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
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          try {
                            const service = new PlayerService();
                            const response = await service.getByUsername<{ id: number }>(friendUsername);
                            const receiver = response.data;
                            await sendFriendRequestSignalR(receiver.id, user!.id, user!.username);
                            setFriendUsername("");
                          } catch (error: any) {
                            if (error.status)
                              toast(
                                "You are already friends with " +
                                  friendUsername
                              );
                          }
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
