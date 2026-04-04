import { ensureConnected, getConnection } from "./signalRClient";

export async function checkLobbyExists(lobbyId: string): Promise<boolean> {
  const conn = await ensureConnected();
  return conn.invoke<boolean>("CheckLobbyExists", lobbyId);
}

export async function createLobby(
  lobbyId: string,
  ownerUserId: number,
  ownerUsername: string,
  gameModeKey: string
): Promise<any> {
  const conn = await ensureConnected();
  return conn.invoke("CreateLobby", lobbyId, ownerUserId, ownerUsername, gameModeKey);
}

export async function joinLobby(
  lobbyId: string,
  userId: number,
  username: string,
  initial: string,
  profilePicture: string | null,
  dartColor: string
): Promise<any> {
  const conn = await ensureConnected();
  return conn.invoke(
    "JoinLobby", lobbyId, userId, username, initial, profilePicture, dartColor
  );
}

export async function leaveLobby(
  lobbyId: string,
  userId: number
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("LeaveLobby", lobbyId, userId);
}

export async function changeGameMode(
  lobbyId: string,
  gameModeKey: string
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("ChangeGameMode", lobbyId, gameModeKey);
}

export async function changeSetsAndLegs(
  lobbyId: string,
  sets: number,
  legs: number
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("ChangeSetsAndLegs", lobbyId, sets, legs);
}

export async function startGame(lobbyId: string): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("StartGame", lobbyId);
}

export async function submitThrow(
  lobbyId: string,
  userId: number,
  dartThrow: {
    score1: number; multiplier1: number;
    score2: number; multiplier2: number;
    score3: number; multiplier3: number;
  }
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("SubmitThrow", lobbyId, userId, dartThrow);
}

export async function undoTurn(
  lobbyId: string,
  requestingUserId: number
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("UndoTurn", lobbyId, requestingUserId);
}

export async function syncDartPositions(
  lobbyId: string,
  playerId: number,
  darts: Array<{ x: number; y: number; z: number; score?: number; multiplier?: number }>
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("SyncDartPositions", lobbyId, playerId, darts);
}

export function listenToLobby(
  onUpdate: (serverLobby: any) => void
): () => void {
  const conn = getConnection();
  conn.on("LobbyUpdated", onUpdate);
  return () => conn.off("LobbyUpdated", onUpdate);
}

export function listenToDartPositions(
  onUpdate: (playerId: number, darts: any[]) => void
): () => void {
  const conn = getConnection();
  conn.on("DartPositionsUpdated", onUpdate);
  return () => conn.off("DartPositionsUpdated", onUpdate);
}

export function listenToGameFinished(
  onFinished: (winnerUserId: number) => void
): () => void {
  const conn = getConnection();
  conn.on("GameFinished", onFinished);
  return () => conn.off("GameFinished", onFinished);
}
