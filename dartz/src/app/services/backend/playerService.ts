import ApiService from "./apiService";
import { ApiResponse } from "../../utils/types";

class PlayerService extends ApiService {
  constructor() {
    super("player");
  }

  async getById<T>(id: number): Promise<ApiResponse<T>> {
    return this.get<T>(`${id}`);
  }

  async getByUsername<T>(username: string): Promise<ApiResponse<T>> {
    return this.get<T>(`username/${username}`);
  }

  async login<T>(
    payload: T,
    setCookies: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.post("login", payload, setCookies);
  }

  async logout<T>(): Promise<ApiResponse<T>> {
    return this.post("logout", undefined, true);
  }

  async signup<T>(payload: T): Promise<ApiResponse<T>> {
    return this.post("signup", payload, false);
  }

  async getUserBySession<T>(): Promise<ApiResponse<T>> {
    return this.post("login/sessionId", undefined, true);
  }
}

export default PlayerService;
