import ApiService from "./apiService";
import { ApiResponse } from "../utils/types";

class PlayerService extends ApiService {
  constructor() {
    super("player");
  }

  async getById<T>(id: number): Promise<ApiResponse<T>> {
    return this.get<T>(`${id}`);
  }

  async login<T>(payload: T): Promise<ApiResponse<T>> {
    return this.post<T>("login", payload, true);
  }

  async logout<T>(): Promise<ApiResponse<T>> {
    return this.post<T>("logout", undefined, false);
  }

  async signup<T>(payload: T): Promise<ApiResponse<T>> {
    return this.post<T>("signup", payload, false);
  }

  async getUserBySession<T>(): Promise<ApiResponse<T>> {
    return this.post<T>("login/sessionId", undefined, true);
  }
}

export default PlayerService;
