"use client";

import { Lobby } from "@/app/utils/types";

interface GameProps {
  lobby: Lobby;
  setLobby: (updatedLobby: Lobby) => void;
}

const Game = ({ lobby, setLobby }: GameProps) => {
  return (
    <>
      <h1>Running gAme</h1>
    </>
  );
};

export default Game;
