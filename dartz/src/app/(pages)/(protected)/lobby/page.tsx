"use client";
import React, { useEffect, useState } from "react";
import LobbyHandler from "@/app/handlers/lobbyHandler";
import WaitingLobby from "@/app/components/lobby/waitingLobby";
import { useSearchParams, useRouter } from "next/navigation";
import { UserContext } from "@/app/components/userProvider/userProvider";
import { GameMode, GameStatus, Lobby } from "@/app/utils/types";
import { GAME_MODES } from "@/app/utils/constants";
import Game from "@/app/components/lobby/game";
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";

import { Tooltip } from "@nextui-org/react";
import { toast } from "sonner";
import WinnerScreen from "@/app/components/lobby/winnerScreen";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const paramMode = searchParams.get("mode");
  const gameMode: GameMode | undefined = GAME_MODES.find(
    (mode: GameMode) => mode.key === String(paramMode ? paramMode : "")
  );

  const { user, setInLobby } = React.useContext(UserContext)!;

  const [lobby, setLobby] = useState<Lobby | null>(null);

  let unsubscribe: any;
  useEffect(() => {
    if (!id && gameMode) {
      const newLobby = LobbyHandler.createLobby(user, gameMode);
      setLobby(newLobby);
      history.replaceState(null, "", `/lobby?id=${newLobby.id}`);
    } else if (id) {
      LobbyHandler.loadLobby(id).then((fetchedLobby) => {
        fetchedLobby = LobbyHandler.addPlayer(fetchedLobby, user);
        setLobby(fetchedLobby);
        setInLobby(true);
        unsubscribe = LobbyHandler.listenToLobby(id, setLobby);
      });
    }
  }, [id, paramMode]);

  useEffect(() => {
    //on unmount of component
    return () => {
      setInLobby(false);
      unsubscribe && unsubscribe();
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl text-center flex-grow text-center">Lobby</h1>
        {lobby && (
          <div className="flex items-center space-x-2 text-sm">
            <span>
              Code: <span className="font-bold">{lobby.id}</span>
            </span>
            <Tooltip
              closeDelay={0}
              showArrow
              className="text-black"
              content="Copy to Clipboard"
            >
              <DocumentDuplicateIcon
                className="size-5 cursor-pointer transition-colors hover:[color:var(--primary)]"
                onClick={() => {
                  navigator.clipboard.writeText(lobby.id);
                  toast.info("Copied to Clipboard", {
                    duration: 2000,
                  });
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {(() => {
        switch (lobby?.gameStatus) {
          case GameStatus.Waiting:
            return <WaitingLobby lobby={lobby} setLobby={setLobby} />;
          case GameStatus.Running:
            return <Game lobby={lobby} setLobby={setLobby} />;
          case GameStatus.Finished:
            return <WinnerScreen lobby={lobby} setLobby={setLobby} />;
          default:
            return <div>Unknown game state??</div>;
        }
      })()}
    </>
  );
}
