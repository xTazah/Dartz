'use client'

import { Toaster, toast } from 'sonner'
import { useSearchParams  } from "next/navigation";
import { useState, useEffect } from "react";
import { Lobby, Player, handleThrow, addPlayer} from "@/app/logic/game";
import { syncLobby, listenToLobby } from "@/app/services/firebaseSync";
import GameModeSwitch from "./gameModeSwitch";
import { GAME_MODES, GameMode } from "@/app/utils/constants";

const LobbyComponent = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");  

    var lobby: Lobby = {id: "Dummy", currentPlayerIndex: 0, gameMode: GAME_MODES[0], isGameOver: false, owner: {id: "dummy", name:"dummy", score: 0}, players: []};
    var lobbyFromStorage = localStorage.getItem(`Lobby_${id}`);
    if (lobbyFromStorage){
      lobby = JSON.parse(lobbyFromStorage)
      console.log("Found lobby in localStorage: " + lobby)
    }

    
    // firebase sync
    // if (lobbyId) {
    //   listenToLobby(lobbyId, (state: Lobby) => setLobbyState(state));
    // }

    const [lobbyState, setLobbyState] = useState<Lobby>(lobby);
    
    useEffect(() => {
      localStorage.setItem(`Lobby_${lobbyState.id}`, JSON.stringify(lobbyState))
      }, [lobbyState]);

    useEffect(() => {
      toast.info(<div>Game Mode changed to <span className='font-bold'>{lobbyState?.gameMode.name}</span></div>,{
        duration: 3500,
        // icon: <MyIcon />,
      });
      }, [lobbyState?.gameMode]);

  const handleThrowAction = (points: number) => {
    const newState = handleThrow(lobbyState, points);
    setLobbyState(newState);

    // firbase sync
    // if (lobbyId) {
    //   syncLobby(lobbyId, newState); // Syncs the lobby state to Firebase
    // }
  };

const setSelectedGameMode = (gameMode: GameMode) => {
    setLobbyState(lobbyState => ({
      ...lobbyState,
      gameMode: gameMode,
    }));
  };

  const handleAddPlayer = () => {
    const newState = addPlayer(
      lobbyState,
      {id:"Timinz", name: "Timinz", score : 0}
   );
    setLobbyState(newState);
    };

  return (
    <div>
      <h1>Lobby</h1>
      <GameModeSwitch selectedGameMode={lobbyState.gameMode} setSelectedGameMode={setSelectedGameMode} />
      <div>
        {lobbyState.players.map((player: Player, index: number) => (
          <div key={player.id}>
            {player.name}: {player.score} {index === lobbyState.currentPlayerIndex ? "(Your turn)" : ""}
          </div>
        ))}
      </div>
      <button className="bg-gray-500" onClick={() => handleAddPlayer() }>
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
