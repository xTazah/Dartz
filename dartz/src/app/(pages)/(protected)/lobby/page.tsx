"use client";
import React, { useEffect, useState } from "react";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import WaitingLobby from "@/app/components/lobby/waitingLobby";
import { useSearchParams, useRouter } from "next/navigation";
import { UserContext } from "@/app/components/userProvider/userProvider";
import { GameMode, GameStatus, Lobby } from "@/app/utils/types";
import { GAME_MODES } from "@/app/utils/constants";
import Game from "@/app/components/lobby/game";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const paramMode = searchParams.get("mode");
  const gameMode: GameMode | undefined = GAME_MODES.find(
    (mode: GameMode) => mode.key === String(paramMode ? paramMode : "")
  );

  const { user } = React.useContext(UserContext)!;

  const [lobby, setLobby] = useState<Lobby | null>(null);

  useEffect(() => {
    if (!id && gameMode) {
      const newLobby = LobbyHandler.createLobby(user, gameMode);
      setLobby(newLobby);
      history.replaceState(null, "", `/lobby?id=${newLobby.id}`);
    } else if (id) {
      LobbyHandler.loadLobby(id).then((fetchedLobby) => {
        fetchedLobby = LobbyHandler.addPlayer(fetchedLobby, user);
        setLobby(fetchedLobby);
        const unsubscribe = LobbyHandler.listenToLobby(id, setLobby);
        return () => unsubscribe();
      });
    }
  }, [id, paramMode]);

  switch (lobby?.gameStatus) {
    case GameStatus.Waiting:
      return <WaitingLobby lobby={lobby} setLobby={setLobby} />;
    case GameStatus.Running:
      return <Game lobby={lobby} setLobby={setLobby} />;
    case GameStatus.Finished:
      return <div>Winnder Screen Not implemented yet</div>;
    default:
      return <div>Unknown game state??</div>;
  }
}
