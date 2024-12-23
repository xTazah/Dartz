class LobbyNotFoundError extends Error {
  constructor(lobbyId: string) {
    super(`Lobby with ID "${lobbyId}" not found.`);
    this.name = "LobbyNotFoundError";
  }
}

class MissingLobbyDataError extends Error {
  constructor() {
    super(`Missing Data for Lobby.`);
    this.name = "MissingLobbyDataError";
  }
}

export { LobbyNotFoundError, MissingLobbyDataError };
