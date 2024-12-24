import axios, { AxiosError } from "axios";

interface ApiResponse<T> {
  data: any;
  status: number;
  error?: string;
}

class PlayerService {
  private baseURL = process.env.NEXT_PUBLIC_BASE_URL + "player/";

  constructor() {
    axios.defaults.withCredentials = true;
  }

  async getById<T>(id: number): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get<T>(`${this.baseURL}${id}`);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async login<T>(payload: T): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<T>(`${this.baseURL}login`, payload);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async logout<T>(): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<T>(`${this.baseURL}logout`);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async signup<T>(payload: T): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<T>(`${this.baseURL}signup`, payload);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getUserBySession<T>(): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<T>(
        `${this.baseURL}login/sessionId`,
        null,
        {
          withCredentials: true, // ensures credentials (cookies) are sent with the request
        }
      );
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(endpoint: string, payload: T): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<T>(
        `${this.baseURL}${endpoint}`,
        payload
      );
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(
        "API Error:",
        axiosError.response?.data || axiosError.message
      );
    } else {
      console.error("Unexpected Error:", error);
    }
  }
}

export default PlayerService;
