"use client";

import {
  DragDataType,
  DropZoneProps,
  GameMode,
  Lobby,
  User,
} from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import GameModeSwitch from "./gameModeSwitch";
import { UserContext } from "../userProvider/userProvider";
import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Tooltip } from "@nextui-org/react";
import DropZone from "../DragDrop/dropzone";
import { inviteUserToLobby } from "@/app/services/gameServer/userService";
import { toast } from "sonner";
import { leaveLobby } from "@/app/services/gameServer/lobbyService";
import { useRouter } from "next/navigation";
import { PlusIcon, UserIcon, StarIcon, PlayIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import dartboardStyles from "../../styles/dartboard.module.scss";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFriendsStore } from "@/app/utils/globalStore";
import PlayerService from "@/app/services/backend/playerService";
import { Button as CustomButton } from "@/components/ui/button";

interface WaitingLobbyProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
  localUsers: User[] | null;
  setLocalUsers: (updatedUsers: User[]) => void;
}

const WaitingLobby = ({
  lobby,
  setLobby,
  localUsers,
  setLocalUsers,
}: WaitingLobbyProps) => {
  const [isSetsSelected, setIsSetsSelected] = useState(false);
  const [isLegsSelected, setIsLegsSelected] = useState(false);

  const [sets, setSets] = useState(1);
  const [legs, setLegs] = useState(3);

  const router = useRouter();
  const changeGameMode = async (gameMode: GameMode) => {
    await LobbyHandler.changeGameMode(lobby.id, gameMode.key);
  };

  const changeSetsAndLegs = async () => {
    if (isSetsSelected)
      await LobbyHandler.changeSetsAndLegs(lobby.id, sets, legs);
    else if (isLegsSelected)
      await LobbyHandler.changeSetsAndLegs(lobby.id, 0, legs);
  };

  const startGame = async () => {
    await LobbyHandler.startGame(lobby.id);

    if (isSetsSelected || isLegsSelected)
      await changeSetsAndLegs();
  };

  const leave = () => {
    if (user?.id !== undefined) {
      leaveLobby(lobby.id, user.id);
    }
    router.push("/");
  };

  const { user } = useContext(UserContext)!;

  const DragDropProperties: DropZoneProps = {
    dropzoneId: "lobby-dropzone",
    allowedDataTypes: [DragDataType.FRIEND],
    onDrop: (event: any): void => {
      const invited = event.active.data.current.customData as User;

      if (!invited) {
        toast.error("Invalid drop data. Please invite player manually!");
        return;
      }
      if (user) {
        inviteUserToLobby(lobby.id, invited.id, user.id, user.username, user.profilePicture || null, user.initial || user.username.charAt(0));
      }
    },
  };

  const isOwner = user?.id === lobby.owner?.id;

  const { friends } = useFriendsStore();
  const [open, setOpen] = React.useState(false);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [allowNoAuth, setAllowNoAuth] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"select" | "invite" | "local">("select");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // When a friend is selected, check their AllowNoAuth setting
  const handleFriendSelect = async (friendUsername: string) => {
    const friend = friends?.find((f) => f.user?.username === friendUsername);
    if (!friend?.user) return;

    setUsername(friendUsername);
    setSelectedFriendId(friend.user.id);
    setOpen(false);
    setMode("select");
    setAllowNoAuth(null);

    // Check if friend allows no-auth
    setIsCheckingAuth(true);
    try {
      const service = new PlayerService();
      const response = await service.checkAllowNoAuth(friend.user.id);
      setAllowNoAuth(response.data);
    } catch {
      setAllowNoAuth(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    const service = new PlayerService();
    setIsLoginLoading(true);
    try {
      const payload = { username, password };
      const response = await service.login(payload, false);

      if (response.status === 200) {
        const userData: User = response.data;
        await LobbyHandler.joinLobby(lobby.id, userData);
        if (localUsers) setLocalUsers([...localUsers, userData]);
        else setLocalUsers([userData]);

        resetPopup();
      }
    } catch (err) {
      toast("Invalid password.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLocalPlayerNoAuth = async () => {
    // For no-auth users, we need to get their user data without password
    // We'll use the friend data we already have since it contains basic user info
    const friend = friends?.find((f) => f.user?.username === username);
    if (!friend?.user) {
      toast.error("User not found");
      return;
    }

    setIsLoginLoading(true);
    try {
      // Add the friend as a local player using their existing data
      const userData: User = {
        id: friend.user.id,
        username: friend.user.username,
        initial: friend.user.initial || friend.user.username.charAt(0).toUpperCase(),
        dartColor: friend.user.dartColor,
        profilePicture: friend.user.profilePicture,
        bio: friend.user.bio,
        memberSince: friend.user.memberSince,
      };

      await LobbyHandler.joinLobby(lobby.id, userData);
      if (localUsers) setLocalUsers([...localUsers, userData]);
      else setLocalUsers([userData]);

      resetPopup();
    } catch (err) {
      toast.error("Failed to add local player");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleInvite = async () => {
    setIsLoginLoading(true);
    try {
      const invited = friends?.find(
        (friend) => friend.user!.username == username
      );
      if (!invited) {
        toast.error("Error handling invite. Enter lobby code manually");
        return;
      }

      if (user && invited.user) {
        await inviteUserToLobby(lobby.id, invited.user.id, user.id, user.username, user.profilePicture || null, user.initial || user.username.charAt(0));
      }
      resetPopup();
    } catch (err) {
    } finally {
      setIsLoginLoading(false);
    }
  };

  const resetPopup = () => {
    setUsername("");
    setPassword("");
    setSelectedFriendId(null);
    setAllowNoAuth(null);
    setMode("select");
  };

  return (
    <div className={dartboardStyles.lobbyContainer}>
      {/* Game Mode Switch */}
      {lobby && (
        <GameModeSwitch
          selectedGameMode={lobby.gameMode}
          setSelectedGameMode={changeGameMode}
          isOwner={isOwner}
        />
      )}

      {/* Players Section */}
      <DropZone
        dropzoneId={DragDropProperties.dropzoneId}
        allowedDataTypes={DragDropProperties.allowedDataTypes}
        onDrop={DragDropProperties.onDrop}
      >
        <div className={dartboardStyles.lobbySection}>
          <h3 className={dartboardStyles.lobbySectionTitle}>Players</h3>
          <div className={dartboardStyles.lobbyPlayerGrid}>
            {Array.isArray(lobby.players) && lobby.players.map((player) => {
              const isCurrentUser = player?.user?.id === user?.id;
              const isPlayerOwner = player?.user?.id === lobby.owner?.id;
              
              return (
                <div 
                  key={player.user?.id}
                  className={cn(
                    dartboardStyles.lobbyPlayerCard,
                    isCurrentUser && dartboardStyles.currentUserCard,
                    isPlayerOwner && dartboardStyles.ownerCard
                  )}
                >
                  {isCurrentUser && (
                    <div className={dartboardStyles.lobbyYouBadge}>
                      <UserIcon className="w-3 h-3" />
                      You
                    </div>
                  )}
                  {isPlayerOwner && (
                    <div className={dartboardStyles.lobbyOwnerBadge}>
                      <StarIcon className="w-3 h-3" />
                      Owner
                    </div>
                  )}
                  <div 
                    className={dartboardStyles.lobbyPlayerAvatar}
                    style={{ 
                      background: player.user?.dartColor 
                        ? `linear-gradient(135deg, ${player.user.dartColor}, ${player.user.dartColor}dd)` 
                        : undefined 
                    }}
                  >
                    {player.user?.profilePicture ? (
                      <img src={player.user.profilePicture} alt={player.user.username} className={dartboardStyles.lobbyPlayerImage} />
                    ) : (
                      <>{player.user?.initial || player.user?.username?.charAt(0) || "?"}</>
                    )}
                    
                  </div>
                  <h4 className={dartboardStyles.lobbyPlayerName}>
                    {player.user?.username || "Unknown"}
                  </h4>
                  <div className={dartboardStyles.lobbyPlayerStatus}>
                    <span className={cn(
                      dartboardStyles.lobbyStatusDot,
                      !player.connected && dartboardStyles.offline
                    )} />
                    <span>{player.connected ? "Ready" : "Connecting..."}</span>
                  </div>
                </div>
              );
            })}

            {/* Add Player Card */}
            <Popover>
              <PopoverTrigger asChild>
                <div className={dartboardStyles.lobbyAddPlayerCard}>
                  <div className={dartboardStyles.lobbyAddIcon}>
                    <PlusIcon className="w-6 h-6" />
                  </div>
                  <span className={dartboardStyles.lobbyAddText}>Add Player</span>
                </div>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={10}
                align="start"
                className="w-90 p-4 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
              >
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add Player</h4>
                    <p className="text-sm text-[var(--font-color-muted)]">
                      Select a player from your friendlist
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="items-center">
                      <Popover
                        open={open}
                        onOpenChange={(isOpen) => {
                          setOpen(isOpen);
                          if (!isOpen) {
                            setUsername("");
                            setPassword("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <CustomButton
                            role="combobox"
                            className="z-40 w-[200px] text-white justify-between bg-[var(--component-background-hover)] focus:outline outline outline-[var(--component-background)]"
                          >
                            {username && friends
                              ? username
                              : "Select friend..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </CustomButton>
                        </PopoverTrigger>
                        <PopoverContent
                          sideOffset={10}
                          align="start"
                          className="p-4 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
                        >
                          <Command>
                            <CommandInput
                              className="bg-[var(--component-background)]"
                              placeholder="Search for friend..."
                            />
                            <CommandList>
                              <CommandEmpty>No friend found.</CommandEmpty>
                              <CommandGroup className="mt-4">
                                {friends &&
                                  friends.map((friend) => (
                                    <CommandItem
                                      className="select-none p-2 rounded-md hover:bg-[var(--component-background-hover)] "
                                      key={friend.user!.id}
                                      value={friend.user!.username}
                                      onSelect={(currentValue) => {
                                        handleFriendSelect(currentValue);
                                      }}
                                    >
                                      {friend.user!.username}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {username && (
                        <div className="items-center mt-4">
                          {isCheckingAuth ? (
                            <p className="text-sm text-[var(--font-color-muted)]">
                              Checking settings...
                            </p>
                          ) : (
                            <>
                              {/* Mode selection buttons */}
                              {mode === "select" && (
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm mb-2">
                                    What would you like to do with{" "}
                                    <span className="font-bold">{username}</span>?
                                  </p>
                                  <Button
                                    className="w-full bg-[var(--primary)]"
                                    onPress={handleInvite}
                                    isLoading={isLoginLoading}
                                    color="primary"
                                  >
                                    📨 Invite to Lobby
                                  </Button>
                                  <Button
                                    className="w-full bg-[var(--secondary)]"
                                    onPress={() => {
                                      if (allowNoAuth) {
                                        handleLocalPlayerNoAuth();
                                      } else {
                                        setMode("local");
                                      }
                                    }}
                                    isLoading={isLoginLoading}
                                    color="secondary"
                                  >
                                    👤 Add as Local Player
                                    {allowNoAuth && (
                                      <span className="ml-1 text-xs opacity-75">
                                        (no password needed)
                                      </span>
                                    )}
                                  </Button>
                                </div>
                              )}

                              {/* Password required for local player */}
                              {mode === "local" && !allowNoAuth && (
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm">
                                    Enter <span className="font-bold">{username}</span>&apos;s password to add as local player
                                  </p>
                                  <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && password) {
                                        handleLogin();
                                      }
                                    }}
                                    placeholder="Password"
                                    className="focus:outline outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      className="flex-1 bg-[var(--component-background-hover)]"
                                      onPress={() => setMode("select")}
                                      color="primary"
                                    >
                                      Back
                                    </Button>
                                    <Button
                                      className="flex-1 bg-[var(--primary)]"
                                      onPress={handleLogin}
                                      isLoading={isLoginLoading}
                                      isDisabled={!password}
                                      color="primary"
                                    >
                                      Add Player
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </DropZone>

      {/* Settings Section (Owner only) */}
      {isOwner && (
        <div className={dartboardStyles.lobbySection}>
          <h3 className={dartboardStyles.lobbySectionTitle}>Match Settings</h3>
          <div className={dartboardStyles.lobbyCheckboxRow}>
            <Checkbox
              isSelected={isSetsSelected}
              onValueChange={() => {
                if (isLegsSelected) setIsLegsSelected(false);
                setIsSetsSelected(!isSetsSelected);
              }}
            >
              Sets & Legs
            </Checkbox>
            <Checkbox
              isSelected={isLegsSelected}
              onValueChange={() => {
                if (isSetsSelected) setIsSetsSelected(false);
                setIsLegsSelected(!isLegsSelected);
              }}
            >
              Legs Only
            </Checkbox>
          </div>
          
          {isSetsSelected && (
            <div className={dartboardStyles.lobbySettingsGrid}>
              <div className={dartboardStyles.lobbySettingItem}>
                <label className={dartboardStyles.lobbySettingLabel}>Sets</label>
                <input
                  type="number"
                  className={dartboardStyles.lobbySettingInput}
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className={dartboardStyles.lobbySettingItem}>
                <label className={dartboardStyles.lobbySettingLabel}>Legs per Set</label>
                <input
                  type="number"
                  className={dartboardStyles.lobbySettingInput}
                  value={legs}
                  onChange={(e) => setLegs(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          )}
          
          {isLegsSelected && (
            <div className={dartboardStyles.lobbySettingsGrid}>
              <div className={dartboardStyles.lobbySettingItem}>
                <label className={dartboardStyles.lobbySettingLabel}>Legs</label>
                <input
                  type="number"
                  className={dartboardStyles.lobbySettingInput}
                  value={legs}
                  onChange={(e) => setLegs(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lobby Code */}
      <div className={dartboardStyles.lobbyCodeSection}>
        <span className={dartboardStyles.lobbyCodeLabel}>Lobby Code:</span>
        <span className={dartboardStyles.lobbyCodeValue}>{lobby.id}</span>
      </div>

      {/* Action Buttons */}
      <div className={dartboardStyles.lobbyActions}>
        <button
          className={dartboardStyles.lobbyButtonSecondary}
          onClick={leave}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Leave Lobby
        </button>
        {isOwner && (
          <button
            className={dartboardStyles.lobbyButtonPrimary}
            onClick={startGame}
            disabled={!Array.isArray(lobby.players)}
          >
            <PlayIcon className="w-5 h-5" />
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default WaitingLobby;
