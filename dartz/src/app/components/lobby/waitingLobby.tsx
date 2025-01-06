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
import { Button, Checkbox } from "@nextui-org/react";
import DropZone from "../DragDrop/dropzone";
import UserComponent from "../friendList/User";
import { inviteUserToLobby } from "@/app/services/firebase/userService";
import { toast } from "sonner";
import { leaveLobby } from "@/app/services/firebase/lobbyService";
import { useRouter } from "next/navigation";

interface WaitingLobbyProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

const WaitingLobby = ({ lobby, setLobby }: WaitingLobbyProps) => {
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
          onClick={leave}
          color="secondary"
        >
          Leave Lobby
        </Button>
        <Button
          className="mt-4 w-full bg-[var(--primary)]"
          onClick={startGame}
          color="primary"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default WaitingLobby;
