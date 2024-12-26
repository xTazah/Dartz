"use client";

import { Lobby } from "@/app/utils/types";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import React, { useState } from "react";
import { Button } from "@nextui-org/react";

interface GameProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

const Game = ({ lobby, setLobby }: GameProps) => {
  const [playerScore, setPlayerScore] = useState<number | "">("");

  const currentPlayer = lobby.players[lobby.currentPlayerIndex];

  const handleSubmitScore = () => {
    if (playerScore === "") return;

    const updatedLobby = LobbyHandler.handlePlayerScore(
      lobby,
      currentPlayer,
      Number(playerScore)
    );
    setLobby(updatedLobby);
    setPlayerScore(""); // reset input
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerScore(Number(e.target.value) || "");
  };

  return (
    <div className="p-4 bg-[(var(--background))] text-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Game in Progress</h1>
      <div className="mb-4">
        <h2 className="text-xl">
          Current Player: {currentPlayer.user?.username}
        </h2>
        <p>Remaining Score: {lobby.players[currentPlayer.user!.id].score}</p>
      </div>

      <div>
        {lobby.owner?.id === currentPlayer.user?.id ? (
          <div>
            <h3 className="mb-2">Enter your score:</h3>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="p-2 rounded-md text-black"
                value={playerScore}
                onChange={handleInputChange}
              />
              <Button
                className="mt-4 w-full bg-[var(--primary)]"
                onClick={handleSubmitScore}
                color="primary"
              >
                Submit Score
              </Button>
            </div>
          </div>
        ) : (
          <p>Waiting for {currentPlayer.user?.username} to play...</p>
        )}
      </div>
    </div>
  );
};

export default Game;
