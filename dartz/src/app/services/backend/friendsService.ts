import ApiService from "./apiService";
import { ApiResponse } from "../../utils/types";

class FriendsService extends ApiService {
  constructor() {
    super("friends");
  }

  async getFriends<T>(userId: number): Promise<ApiResponse<T>> {
    return this.get<T>(`${userId}`);
  }
  async getIsFriend(
    userId1: number,
    userId2: number
  ): Promise<ApiResponse<boolean>> {
    return this.post(`isFriend`, {
      userId1: userId1,
      userId2: userId2,
    });
  }

  async addFriend(
    userId1: number,
    userId2: number
  ): Promise<ApiResponse<object>> {
    return this.post(`add`, { userId1: userId1, userId2: userId2 });
  }

  async removeFriend(
    userId1: number,
    userId2: number
  ): Promise<ApiResponse<object>> {
    return this.delete<object>(`remove`, {
      userId1: userId1,
      userId2: userId2,
    });
  }
}

export default FriendsService;
