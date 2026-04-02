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

  async updateUserProfile<T>(ID: number, username: string, profilePicture: string, bio: string): Promise<ApiResponse<T>> {
    return this.post("editProfile", { ID, username, profilePicture, bio }, true);
  }

  async updateDartColor<T>(playerId: number, dartColor: string): Promise<ApiResponse<T>> {
    return this.put("settings/dartColor", { playerId, dartColor });
  }

  async getSettings<T>(playerId: number): Promise<ApiResponse<T>> {
    return this.get<T>(`settings/${playerId}`);
  }

  async updateAllSettings<T>(playerId: number, dartColor: string, allowNoAuth: boolean): Promise<ApiResponse<T>> {
    return this.put("settings/all", { playerId, dartColor, allowNoAuth });
  }

  async checkAllowNoAuth(playerId: number): Promise<ApiResponse<boolean>> {
    return this.get<boolean>(`settings/allowNoAuth/${playerId}`);
  }
}

export default PlayerService;
