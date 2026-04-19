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

// withAutomaticReconnect only covers reconnects AFTER a successful initial
// connect — it doesn't retry the first conn.start(). Render free tier spins
// the container down after idle, so the first request after a cold period
// can take ~60s. Retry the initial handshake with capped backoff so F5 /
// direct-URL visits wait out the cold start instead of bouncing the user
// back to home.
const INITIAL_CONNECT_DELAYS_MS = [0, 1000, 2000, 4000, 8000, 15000, 15000, 15000];

async function startWithRetry(conn: HubConnection): Promise<void> {
  let lastErr: unknown;
  for (const delay of INITIAL_CONNECT_DELAYS_MS) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    try {
      await conn.start();
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export async function ensureConnected(): Promise<HubConnection> {
  const conn = getConnection();
  if (conn.state === HubConnectionState.Connected) return conn;

  // Coalesce concurrent callers onto a single start promise so parallel
  // invocations during page load (registerUser + joinLobby on F5) don't race.
  if (!startPromise && conn.state === HubConnectionState.Disconnected) {
    startPromise = startWithRetry(conn).finally(() => {
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
