"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import LobbyHandler, { mapServerLobbyToLobby } from "@/app/handlers/lobbyHandler";
import * as gameServerLobby from "@/app/services/gameServer/lobbyService";
import { disconnectFromLobby } from "@/app/services/gameServer/lobbyService";
import WaitingLobby from "@/app/components/lobby/waitingLobby";
import { useSearchParams, useRouter } from "next/navigation";
import { UserContext } from "@/app/components/userProvider/userProvider";
import { GameMode, GameStatus, Lobby, User } from "@/app/utils/types";
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

  const router = useRouter();
  const { user, setInLobby } = React.useContext(UserContext)!;
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const lobbyRef = useRef<Lobby | null>(null);
  const userRef = useRef<User | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => { lobbyRef.current = lobby; }, [lobby]);
  useEffect(() => { userRef.current = user; }, [user]);

  const [localUsers, setLocalUsers] = useState<User[] | null>(() => {
    const storedUsers = localStorage.getItem(`Lobby_${id}/localUsers`);
    return storedUsers ? JSON.parse(storedUsers) : null;
  });

  useEffect(() => {
    if (localUsers !== null) {
      localStorage.setItem(`Lobby_${id}/localUsers`, JSON.stringify(localUsers));
    }
  }, [localUsers, id]);

  // Handle incoming lobby updates from SignalR
  const handleLobbyUpdate = useCallback((serverLobby: any) => {
    const mapped = mapServerLobbyToLobby(serverLobby);
    setLobby(mapped);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!id && gameMode) {
          // Create new lobby
          const newLobbyId = await LobbyHandler.createLobby(user, gameMode);
          if (cancelled) return;

          unsubscribeRef.current = gameServerLobby.listenToLobby(handleLobbyUpdate);

          const joinedLobby = await LobbyHandler.joinLobby(newLobbyId, user);
          if (cancelled) return;
          if (joinedLobby) setLobby(joinedLobby);

          history.replaceState(null, "", `/lobby?id=${newLobbyId}`);
          setInLobby(true);
        } else if (id) {
          // Join or reconnect to existing lobby
          unsubscribeRef.current = gameServerLobby.listenToLobby(handleLobbyUpdate);

          const joinedLobby = await LobbyHandler.joinLobby(id, user);
          if (cancelled) return;

          if (joinedLobby) {
            setLobby(joinedLobby);
            setInLobby(true);
          } else {
            // Lobby doesn't exist
            toast.error("Lobby not found or no longer exists.");
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Failed to join lobby:", err);
        if (!cancelled) {
          toast.error("Failed to connect to lobby.");
          router.push("/");
        }
      }
    };
    init();

    return () => { cancelled = true; };
  }, [id, paramMode, gameMode, user, setInLobby, handleLobbyUpdate]);

  useEffect(() => {
    return () => {
      setInLobby(false);
      const currentLobby = lobbyRef.current;
      const currentUser = userRef.current;

      if (currentLobby && currentUser) {
        // Mark as disconnected (not removed) so other players see the status
        // and the user can reconnect later
        disconnectFromLobby(currentLobby.id, currentUser.id);
      }
      unsubscribeRef.current?.();
    };
  }, [setInLobby]);

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
                  toast.info("Copied to Clipboard", { duration: 2000 });
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {(() => {
        switch (lobby?.gameStatus) {
          case GameStatus.Waiting:
            return (
              <WaitingLobby
                lobby={lobby}
                setLobby={setLobby}
                localUsers={localUsers}
                setLocalUsers={setLocalUsers}
              />
            );
          case GameStatus.Running:
            return (
              <Game lobby={lobby} setLobby={setLobby} localUsers={localUsers} />
            );
          case GameStatus.Finished:
            return <WinnerScreen lobby={lobby} setLobby={setLobby} />;
          default:
            return <div>Unknown game state??</div>;
        }
      })()}
    </>
  );
}
