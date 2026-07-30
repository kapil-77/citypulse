/**
 * API Client — stub ready for real backend integration.
 * 
 * Currently returns mock data. When a backend is connected,
 * replace these functions with actual fetch/axios calls.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    // TODO: Replace with actual fetch
    console.log(`[API] GET ${this.baseUrl}${path}`);
    return { data: null as T, error: null, status: 200 };
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    // TODO: Replace with actual fetch
    console.log(`[API] POST ${this.baseUrl}${path}`, body);
    return { data: null as T, error: null, status: 201 };
  }

  async patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    // TODO: Replace with actual fetch
    console.log(`[API] PATCH ${this.baseUrl}${path}`, body);
    return { data: null as T, error: null, status: 200 };
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    // TODO: Replace with actual fetch
    console.log(`[API] DELETE ${this.baseUrl}${path}`);
    return { data: null as T, error: null, status: 200 };
  }
}

export const apiClient = new ApiClient(BASE_URL);