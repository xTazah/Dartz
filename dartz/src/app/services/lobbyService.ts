import { ref, set, get, onValue, off } from "firebase/database";
import { database } from "./firebaseConfig";
import { Lobby, GameMode } from "../utils/types";
import { IconsMap } from "../utils/constants";
import { LobbyNotFoundError } from "../utils/errors";

//persistence and syncing logic

//strip out unnecssary props that dont need to be saved
function mapLobbyForFirebase(lobby: Lobby) {
  const { Icon, logic, ...gamemode } = lobby.gameMode;
  return {
    ...lobby,
    gameMode: gamemode,
  };
}

// add the properties back again
function restoreLobbyFromFirebase(lobby: Lobby): Lobby {
  const { gameMode, ...rest } = lobby;
  return {
    ...rest,
    gameMode: {
      ...gameMode,
      Icon: IconsMap[gameMode.key],
      logic: gameMode.logic,
    },
  };
}

// Save lobby to localStorage
function saveLobbyToLocal(lobbyId: string, lobby: Lobby) {
  localStorage.setItem(`Lobby_${lobbyId}`, JSON.stringify(lobby));
}

// Load lobby from localStorage
function loadLobbyFromLocal(lobbyId: string): Lobby | null {
  const lobbyFromStorage = localStorage.getItem(`Lobby_${lobbyId}`);
  return lobbyFromStorage ? JSON.parse(lobbyFromStorage) : null;
}

function saveLobbyToFirebase(lobbyId: string, lobby: Lobby) {
  const lobbyRef = ref(database, `Lobby_${lobbyId}`);
  const mappedLobby = mapLobbyForFirebase(lobby); // Strip Icon before saving
  set(lobbyRef, mappedLobby);
}

// sync lobby to localStorage and firebase
function syncLobby(lobbyId: string, lobby: Lobby) {
  saveLobbyToLocal(lobbyId, lobby);
  saveLobbyToFirebase(lobbyId, lobby);
}

// litsen for updates from firebase
function listenToLobby(
  lobbyId: string,
  onUpdate: (lobby: Lobby) => void
): () => void {
  const lobbyRef = ref(database, `Lobby_${lobbyId}`);
  const callback = (snapshot: any) => {
    const updatedLobby = snapshot.val();
    if (updatedLobby) {
      const mappedLobby = restoreLobbyFromFirebase(updatedLobby);
      saveLobbyToLocal(lobbyId, mappedLobby);
      onUpdate(mappedLobby);
    }
  };

  onValue(lobbyRef, callback);

  // return an unsubscribe function
  return () => off(lobbyRef, "value", callback);
}

function loadLobby(lobbyId: string): Promise<Lobby> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check Firebase for the lobby
      const lobbyRef = ref(database, `Lobby_${lobbyId}`);
      console.log("Getting lobbyRef from firebase ", lobbyRef);
      const snapshot = await get(lobbyRef);
      console.log("Got lobbyRef from firebase");

      if (snapshot.exists()) {
        const firebaseLobby: Lobby = snapshot.val();
        if (!firebaseLobby.players) firebaseLobby.players = [];

        // Save to localStorage for offline access
        saveLobbyToLocal(lobbyId, firebaseLobby);
        return resolve(firebaseLobby);
      }
      console.log("Not in firebase. Checking local storage");
      // If not in Firebase, check localStorage
      const localLobby = loadLobbyFromLocal(lobbyId);
      if (localLobby) {
        return resolve(localLobby);
      }

      // If neither Firebase nor localStorage has the lobby, throw an error
      throw new LobbyNotFoundError(lobbyId);
    } catch (error) {
      reject(error);
    }
  });
}

export { syncLobby, listenToLobby, loadLobby };
