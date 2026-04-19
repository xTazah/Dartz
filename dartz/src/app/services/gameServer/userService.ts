import { ensureConnected, getConnection } from "./signalRClient";

export async function getOnlineStatus(userId: number): Promise<boolean> {
  const conn = await ensureConnected();
  return conn.invoke<boolean>("GetOnlineStatus", userId);
}

export async function getBulkOnlineStatus(
  userIds: number[]
): Promise<Record<number, boolean>> {
  const conn = await ensureConnected();
  return conn.invoke("GetBulkOnlineStatus", userIds);
}

export async function inviteUserToLobby(
  lobbyId: string,
  targetUserId: number,
  senderUserId: number,
  senderUsername: string,
  senderProfilePicture: string | null,
  senderInitial: string
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke(
    "InviteToLobby", lobbyId, targetUserId, senderUserId,
    senderUsername, senderProfilePicture, senderInitial
  );
}

export async function clearLobbyInvite(
  userId: number,
  key: string
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("ClearLobbyInvite", userId, key);
}

export async function sendFriendRequest(
  targetUserId: number,
  senderUserId: number,
  senderUsername: string
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("SendFriendRequest", targetUserId, senderUserId, senderUsername);
}

export async function clearFriendRequest(
  userId: number,
  key: string
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("ClearFriendRequest", userId, key);
}

// ==================== EVENT LISTENERS ====================

export function onUserOnline(callback: (userId: number) => void): () => void {
  const conn = getConnection();
  conn.on("UserOnline", callback);
  return () => conn.off("UserOnline", callback);
}

export function onUserOffline(callback: (userId: number) => void): () => void {
  const conn = getConnection();
  conn.on("UserOffline", callback);
  return () => conn.off("UserOffline", callback);
}

export function onLobbyInviteReceived(
  callback: (invite: any) => void
): () => void {
  const conn = getConnection();
  conn.on("LobbyInviteReceived", callback);
  return () => conn.off("LobbyInviteReceived", callback);
}

export function onLobbyInviteRemoved(
  callback: (key: string) => void
): () => void {
  const conn = getConnection();
  conn.on("LobbyInviteRemoved", callback);
  return () => conn.off("LobbyInviteRemoved", callback);
}

export function onFriendRequestReceived(
  callback: (request: any) => void
): () => void {
  const conn = getConnection();
  conn.on("FriendRequestReceived", callback);
  return () => conn.off("FriendRequestReceived", callback);
}

export function onPendingInvites(
  callback: (invites: any[]) => void
): () => void {
  const conn = getConnection();
  conn.on("PendingInvites", callback);
  return () => conn.off("PendingInvites", callback);
}

export function onPendingFriendRequests(
  callback: (requests: any[]) => void
): () => void {
  const conn = getConnection();
  conn.on("PendingFriendRequests", callback);
  return () => conn.off("PendingFriendRequests", callback);
}
