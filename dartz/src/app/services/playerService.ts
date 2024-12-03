import axios, { AxiosError } from 'axios';

interface ApiResponse<T> {
  data: any;
  status: number;
  error?: string;
}

class playerService {
  // private baseURL = process.env.BASE_URL;
  private baseURL = "https://localhost:7128/";


  constructor() {
    console.log(this.baseURL)
  }

  async getById<T>(id: number): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get<T>(`${this.baseURL}player/${id}`);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error; 
    }
  }

  async post<T>(endpoint: string, payload: T): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<T>(`${this.baseURL}${endpoint}`, payload);
      return { data: response.data, status: response.status };
    } catch (error) {
      this.handleError(error);
      throw error; 
    }
  }

  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('API Error:', axiosError.response?.data || axiosError.message);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

export default playerService;
