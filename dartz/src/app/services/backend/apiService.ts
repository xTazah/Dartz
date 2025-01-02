import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../utils/types";

abstract class ApiService {
  protected BaseURL: string;

  constructor(path: string) {
    axios.defaults.withCredentials = true;

    if (!path.endsWith("/")) path += "/";

    this.BaseURL = process.env.NEXT_PUBLIC_BASE_URL + path;
  }

  protected async post(
    endpoint: string,
    payload?: any,
    withCredentials: boolean = true
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post<any>(
        `${this.BaseURL}${endpoint}`,
        payload,
        {
          withCredentials,
        }
      );
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get<T>(`${this.BaseURL}${endpoint}`);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async delete<T>(
    endpoint: string,
    payload?: T
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axios.delete<T>(`${this.BaseURL}${endpoint}`, {
        data: payload,
      });
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected handleError(error: unknown) {
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

export default ApiService;
