'use client'

import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from 'sonner';
import { Lobby, Player, GameMode } from '@/app/utils/types';
import { joinLobby } from '@/app/services/lobbyService';
import { listenToLobby } from '@/app/handlers/lobbyHandler'; 
import GameModeSwitch from "./gameModeSwitch";
import { UserContext } from '../userProvider/userProvider';
import { handleThrow } from "@/app/logic/game";

const LobbyComponent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const context = useContext(UserContext); const { user } = context!;

  const [lobbyState, setLobbyState] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLobby = async () => {
      try {
        console.error("Trying to join lobby with id " + id);
        const lobby = await joinLobby(id, user);
        setLobbyState(lobby);

        listenToLobby(lobby.id, (state: Lobby) => setLobbyState(state));
        toast.success("Joined lobby successfully!");
      } catch (error) {
        console.error("Error joining lobby:", error);
        toast.error("Failed to join the lobby.");
      } finally {
        setLoading(false);
      }
    };

    fetchLobby();
  }, [id, user]);

  if (!id) {
    return <div>No ID found in URL</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleThrowAction = (points: number) => {
    if (!lobbyState) return;
    const newState = handleThrow(lobbyState, points);
    setLobbyState(newState);
  };

  const setSelectedGameMode = (gameMode: GameMode) => {
    if (!lobbyState) return;
    setLobbyState({
      ...lobbyState,
      gameMode: gameMode,
    });
  };

  const handleAddPlayer = async () => {
    if (lobbyState) {
      setLobbyState(await joinLobby(id, user));
    }
  };

  return (
    <div>
      <h1>Lobby</h1>
      {lobbyState && <GameModeSwitch selectedGameMode={lobbyState.gameMode} setSelectedGameMode={setSelectedGameMode} />}
      <div>
        {lobbyState?.players.map((player: Player, index: number) => (
          <div key={player.user?.id}>
            {player.user?.username}: {player.score} {index === lobbyState.currentPlayerIndex ? "(Your turn)" : ""}
          </div>
        ))}
      </div>
      <button className="bg-gray-500" onClick={handleAddPlayer}>
        Add Player
      </button>
      <br />
      <button className="bg-gray-500" onClick={() => handleThrowAction(50)}>
        Test Throw
      </button>
    </div>
  );
};


export default LobbyComponent;
