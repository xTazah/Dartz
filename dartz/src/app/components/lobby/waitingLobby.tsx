"use client";

import { GameMode, GameStatus, Lobby, User } from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import GameModeSwitch from "./gameModeSwitch";
import { UserContext } from "../userProvider/userProvider";
import React, { useEffect } from "react";
import { Button } from "@nextui-org/react";

interface WaitingLobbyProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

const WaitingLobby = ({ lobby, setLobby }: WaitingLobbyProps) => {
  const changeGameMode = (gameMode: GameMode) => {
    const updatedLobby = LobbyHandler.changeGameMode(lobby, gameMode);
    setLobby(updatedLobby);
  };

  const startGame = () => {
    const updatedLobby = LobbyHandler.startGame(lobby);
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
      <h1>Lobby</h1>
      {lobby && (
        <GameModeSwitch
          selectedGameMode={lobby.gameMode}
          setSelectedGameMode={changeGameMode}
          isOwner={isOwner}
        />
      )}
      <div>
        {lobby.players?.map((player) => (
          <div key={player.user?.id}>
            {player.user?.username}
            {player.user?.id == lobby.owner?.id && " (Owner)"}
          </div>
        ))}
      </div>
      <Button className="text-black" onClick={startGame}>
        Start Game
      </Button>
    </div>
  );
};

export default WaitingLobby;
