import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

const GAME_SERVER_URL =
  process.env.NEXT_PUBLIC_GAME_SERVER_URL || "http://localhost:5063";

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;

export function getConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(`${GAME_SERVER_URL}/gamehub`)
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();
  }
  return connection;
}

export async function ensureConnected(): Promise<HubConnection> {
  const conn = getConnection();
  if (conn.state === HubConnectionState.Connected) return conn;

  // Coalesce concurrent callers onto a single start promise so parallel
  // invocations during page load (registerUser + joinLobby on F5) don't race.
  if (!startPromise && conn.state === HubConnectionState.Disconnected) {
    startPromise = conn.start().finally(() => {
      startPromise = null;
    });
  }
  if (startPromise) await startPromise;
  return conn;
}

export async function registerUser(
  userId: number,
  username: string
): Promise<void> {
  const conn = await ensureConnected();
  await conn.invoke("Register", userId, username);
}

export async function disconnectSignalR(): Promise<void> {
  if (connection && connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
}
