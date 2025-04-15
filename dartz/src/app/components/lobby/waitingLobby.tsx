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
import UserComponent from "../friendList/User";
import { inviteUserToLobby } from "@/app/services/firebase/userService";
import { toast } from "sonner";
import { leaveLobby } from "@/app/services/firebase/lobbyService";
import { useRouter } from "next/navigation";
import { PlusCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import iconStyles from "../../styles/icon.module.scss";
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
  const changeGameMode = (gameMode: GameMode) => {
    const updatedLobby = LobbyHandler.changeGameMode(lobby, gameMode);
    setLobby(updatedLobby);
  };

  const changeSetsAndLegs = (lobby: Lobby) => {
    if (isSetsSelected)
      return LobbyHandler.changeSetsAndLegs(lobby, sets, legs);
    else if (isLegsSelected)
      return LobbyHandler.changeSetsAndLegs(lobby, 0, legs);
  };

  const startGame = () => {
    let updatedLobby = LobbyHandler.startGame(lobby);

    if (isSetsSelected || isLegsSelected)
      updatedLobby = changeSetsAndLegs(updatedLobby)!;

    setLobby(updatedLobby);
  };

  const leave = () => {
    let isSpectator = false;
    let index = lobby.players.findIndex(
      (player) => player.user?.id === user?.id
    );
    if (index === -1) {
      index = lobby.spectators.findIndex(
        (spectator) => spectator.user?.id === user?.id
      );
      isSpectator = true;
    }
    leaveLobby(lobby.id, index, isSpectator);
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
      inviteUserToLobby(lobby.id, user, invited);
    },
  };

  let isOwner = user?.id === lobby.owner?.id;
  useEffect(() => {
    isOwner = user?.id === lobby.owner?.id;
  }, [lobby.owner]);

  const { friends } = useFriendsStore();
  const [open, setOpen] = React.useState(false);

  const [username, setUsername] = React.useState(""); //finn ToDo: when user from friendlist is selected focus the password input
  const [password, setPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLogin = async () => {
    const service = new PlayerService();
    setIsLoginLoading(true);
    try {
      const payload = { username, password };
      const response = await service.login(payload, false);

      if (response.status === 200) {
        const userData: User = response.data;
        let updatedLobby = LobbyHandler.addPlayer(lobby, userData);
        setLobby(updatedLobby);
        if (localUsers) setLocalUsers([...localUsers, userData]);
        else setLocalUsers([userData]);

        setUsername("");
        setPassword("");
        setOpen(false);
      }
    } catch (err) {
      toast("Invalid username or password.");
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

      inviteUserToLobby(lobby.id, user, invited.user);

      setUsername("");
      setPassword("");
      setOpen(false);
    } catch (err) {
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <div>
      {lobby && (
        <GameModeSwitch
          selectedGameMode={lobby.gameMode}
          setSelectedGameMode={changeGameMode}
          isOwner={isOwner}
        />
      )}
      <div className="grid grid-cols-2 gap-6">
        <DropZone
          dropzoneId={DragDropProperties.dropzoneId}
          allowedDataTypes={DragDropProperties.allowedDataTypes}
          onDrop={DragDropProperties.onDrop}
        >
          <h2 className="text-lg mb-3 mt-4">Player</h2>
          <div className="flex flex-col gap-4">
            {lobby.players?.map((player) => (
              <UserComponent
                key={player.user?.id}
                username={
                  (player.user?.username == undefined
                    ? ""
                    : player.user?.username) +
                  (player.user?.id == lobby.owner?.id ? " (Owner)" : "")
                }
              />
            ))}

            <Popover>
              <PopoverTrigger asChild>
                <PlusIcon
                  className={`size-7 ${iconStyles.icon}`}
                  color="#6F7172"
                />
              </PopoverTrigger>
              <PopoverContent
                sideOffset={10}
                align="start"
                className="w-90 p-4 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
              >
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add Player</h4>
                    <p className="text-sm">
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
                          <Button
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] text-white justify-between bg-[var(--component-background-hover)] focus:outline outline outline-[var(--component-background)]"
                          >
                            {username && friends
                              ? username
                              : "Select friend..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
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
                                        setUsername(
                                          currentValue === username
                                            ? ""
                                            : currentValue
                                        );
                                        setOpen(false);
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
                        <div className="items-center mt-2">
                          <div className="space-y-2">
                            <p className="text-sm">
                              Enter password to add{" "}
                              <span className="font-bold">{username}</span> as
                              local player
                            </p>
                          </div>
                          <div className="mt-2">
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                              }}
                              //onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                              placeholder="Password"
                              className="focus:outline outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                            />
                          </div>

                          <Button
                            className="mt-4 w-auto bg-[var(--primary)]"
                            onClick={
                              password == "" ? handleInvite : handleLogin
                            }
                            isLoading={isLoginLoading}
                            color="primary"
                          >
                            {password == ""
                              ? "Invite to lobby"
                              : "Add local player"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </DropZone>
        <div>
          {isOwner && (
            <div>
              <h2 className="text-lg mb-3 mt-4">Settings</h2>
              <Checkbox
                className="mr-4"
                isSelected={isSetsSelected}
                onValueChange={() => {
                  if (isLegsSelected) setIsLegsSelected(false);
                  setIsSetsSelected(!isSetsSelected);
                }}
              >
                Sets
              </Checkbox>
              <Checkbox
                className="mr-4 mb-2"
                isSelected={isLegsSelected}
                onValueChange={() => {
                  if (isSetsSelected) setIsSetsSelected(false);
                  setIsLegsSelected(!isLegsSelected);
                }}
              >
                Only Legs
              </Checkbox>
            </div>
          )}
          {isSetsSelected && (
            <div>
              <label>Sets</label>
              <input
                type="number"
                className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                value={sets}
                onChange={(e) => {
                  setSets(Number(e.target.value));
                }}
              />
              <label>Legs</label>
              <input
                type="number"
                className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                value={legs}
                onChange={(e) => {
                  setLegs(Number(e.target.value));
                }}
              />
            </div>
          )}
          {isLegsSelected && (
            <div>
              <label>Legs</label>
              <input
                type="number"
                className="focus:outline font-bold outline-[var(--component-outline)] w-full p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                value={legs}
                onChange={(e) => {
                  setLegs(Number(e.target.value));
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-end gap-10">
        <Button
          className="mt-4 w-full bg-[var(--secondary)]"
          onPress={leave}
          color="secondary"
        >
          Leave Lobby
        </Button>
        <Button
          className="mt-4 w-full bg-[var(--primary)]"
          onPress={startGame}
          color="primary"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default WaitingLobby;
