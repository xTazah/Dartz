class LobbyNotFoundError extends Error {
    constructor(lobbyId: string) {
      super(`Lobby with ID "${lobbyId}" not found.`);
      this.name = "LobbyNotFoundError";
    }
  }

  export {LobbyNotFoundError};