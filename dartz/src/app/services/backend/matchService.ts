import ApiService from "./apiService";
import {
  MatchSubmissionPayload,
  MatchHistoryEntry,
  MatchDetail,
  PlayerStatsResponse,
  OpponentStatsEntry,
  ActivityDay,
  MatchTrendPoint,
  ApiResponse,
} from "../../utils/types";

class MatchService extends ApiService {
  constructor() {
    super("match");
  }

  async submitMatch(
    payload: MatchSubmissionPayload
  ): Promise<ApiResponse<{ matchId: number }>> {
    return this.post("", payload);
  }

  async getMatchHistory(
    playerId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<MatchHistoryEntry[]>> {
    return this.get(`history/${playerId}?page=${page}&pageSize=${pageSize}`);
  }

  async getMatchDetail(matchId: number): Promise<ApiResponse<MatchDetail>> {
    return this.get(`${matchId}`);
  }

  async getPlayerStats(
    playerId: number
  ): Promise<ApiResponse<PlayerStatsResponse>> {
    return this.get(`stats/${playerId}`);
  }

  async getOpponentStats(
    playerId: number
  ): Promise<ApiResponse<OpponentStatsEntry[]>> {
    return this.get(`opponents/${playerId}`);
  }

  async getActivityData(
    playerId: number
  ): Promise<ApiResponse<ActivityDay[]>> {
    return this.get(`analytics/activity/${playerId}`);
  }

  async getMatchTrends(
    playerId: number
  ): Promise<ApiResponse<MatchTrendPoint[]>> {
    return this.get(`analytics/trends/${playerId}`);
  }
}

export default MatchService;
