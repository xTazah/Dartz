"use client";
import React, { useEffect, useState, useRef } from "react";
import LobbyHandler from "@/app/handlers/lobbyHandler";
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
import { setUserConnected } from "@/app/services/firebase/lobbyService";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const paramMode = searchParams.get("mode");
  const gameMode: GameMode | undefined = GAME_MODES.find(
    (mode: GameMode) => mode.key === String(paramMode ? paramMode : "")
  );

  const { user, setInLobby } = React.useContext(UserContext)!;

  const [lobby, setLobby] = useState<Lobby | null>(null);

  // Use refs to track current values for cleanup
  const lobbyRef = useRef<Lobby | null>(null);
  const userRef = useRef<User | null>(null);
  const unsubscribeRef = useRef<any>(null);

  // Keep refs in sync with current values
  useEffect(() => {
    lobbyRef.current = lobby;
  }, [lobby]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  //local users are bound to the player that adds them to the lobby (--> everybody can add unlimited amounts of local players)
  const [localUsers, setLocalUsers] = useState<User[] | null>(() => {
    // retrieve the initial value from localStorage (in case of page reload)
    const storedUsers = localStorage.getItem(`Lobby_${id}/localUsers`);
    return storedUsers ? JSON.parse(storedUsers) : null;
  });

  // sync state with localStorage
  useEffect(() => {
    if (localUsers !== null) {
      localStorage.setItem(
        `Lobby_${id}/localUsers`,
        JSON.stringify(localUsers)
      );
    }
  }, [localUsers, id]);

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
        unsubscribeRef.current = LobbyHandler.listenToLobby(id, setLobby);
      });
    }
  }, [id, paramMode, gameMode, user, setInLobby]);

  useEffect(() => {
    //on unmount of component - use refs to get current values
    return () => {
      setInLobby(false);
      const currentLobby = lobbyRef.current;
      const currentUser = userRef.current;
      
      if (currentLobby && currentUser) {
        let isSpectator = false;
        let index = currentLobby.players.findIndex(
          (player) => player.user?.id === currentUser?.id
        );
        if (index === -1) {
          index = currentLobby.spectators.findIndex(
            (spectator) => spectator.user?.id === currentUser?.id
          );
          isSpectator = true;
        }
        if (index !== -1) {
          setUserConnected(currentLobby.id, index, isSpectator, false);
        }
      }
      unsubscribeRef.current && unsubscribeRef.current();
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
