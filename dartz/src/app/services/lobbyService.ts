import { ref, set, get, onValue, off, onDisconnect } from "firebase/database";
import { database } from "./firebaseConfig";
import { Lobby, GameMode } from "../utils/types";
import { IconsMap } from "../utils/constants";
import { LobbyNotFoundError } from "../utils/errors";
import { reject } from "lodash";

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

function setUserConnected(
  lobbyId: string,
  index: number,
  connected: boolean = true
) {
  const userRef = ref(database, `Lobby_${lobbyId}/players/${index}/connected`);
  set(userRef, connected);
  if (connected) {
    onDisconnect(userRef).set(false); //mark user as disconnected when firebase detects a disconnect
  }
}

async function getLobbySnapshot(lobbyId: string): Promise<Lobby | null> {
  try {
    const lobbyRef = ref(database, `Lobby_${lobbyId}`);
    const snapshot = await get(lobbyRef);

    if (snapshot.exists()) {
      return snapshot.val() as Lobby;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching lobby snapshot:", error);
    return null;
  }
}

function loadLobby(lobbyId: string): Promise<Lobby> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check Firebase for the lobby
      const firebaseLobby = await getLobbySnapshot(lobbyId);

      if (firebaseLobby) {
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

export {
  syncLobby,
  listenToLobby,
  setUserConnected,
  loadLobby,
  getLobbySnapshot,
};
