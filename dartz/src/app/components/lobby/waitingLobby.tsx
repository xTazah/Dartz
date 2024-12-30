"use client";

import { GameMode, GameStatus, Lobby, User } from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import GameModeSwitch from "./gameModeSwitch";
import { UserContext } from "../userProvider/userProvider";
import React, { useEffect, useState } from "react";
import { Button, Checkbox } from "@nextui-org/react";
import Friend from "../friendList/friend";

interface WaitingLobbyProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

const WaitingLobby = ({ lobby, setLobby }: WaitingLobbyProps) => {
  const [isSetsSelected, setIsSetsSelected] = useState(false);
  const [isLegsSelected, setIsLegsSelected] = useState(false);

  const [sets, setSets] = useState(1);
  const [legs, setLegs] = useState(3);

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

  const { user } = React.useContext(UserContext)!;

  let isOwner = user?.id === lobby.owner?.id;
  console.log("Is owner: ", isOwner);
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
      <div>
        <div>
          {isOwner && (
            <div>
              <h2 className="text-lg mb-3">Settings</h2>
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
        <h2 className="text-lg mb-3 mt-4">Player</h2>
        {lobby.players?.map((player) => (
          <Friend
            key={player.user?.id}
            name={
              (player.user?.username == undefined
                ? ""
                : player.user?.username) +
              (player.user?.id == lobby.owner?.id ? " (Owner)" : "")
            }
          />
        ))}
      </div>
      <Button className="text-black" onClick={startGame}>
        Start Game
      </Button>
    </div>
  );
};

export default WaitingLobby;
