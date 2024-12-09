import { ref, set, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import { Lobby } from "../utils/types"; 

function syncLobby(lobbyId: string, state: Lobby) {
  const lobbyRef = ref(database, `Lobby_${lobbyId}`);
  set(lobbyRef, state);
}

function listenToLobby(lobbyId: string, onUpdate: (state: Lobby) => void) {
  const lobbyRef = ref(database, `Lobby_${lobbyId}`);
  onValue(lobbyRef, (snapshot) => {
    const state = snapshot.val();
    if (state) {
      onUpdate(state);
    }
  });
}

export { syncLobby, listenToLobby };
