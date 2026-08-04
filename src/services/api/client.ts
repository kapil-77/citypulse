/**
 * API Client — Real HTTP implementation using fetch.
 * Connects to the CityPulse Express backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  isFormData = false
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    });

    if (res.status === 204) {
      return { data: null as T, error: null, status: res.status };
    }

    const data = await res.json();

    if (!res.ok) {
      return { data: null as T, error: data?.error || `Request failed with status ${res.status}`, status: res.status };
    }

    return { data: data as T, error: null, status: res.status };
  } catch (err) {
    return {
      data: null as T,
      error: (err as Error).message || 'Network error',
      status: 0,
    };
  }
}

class ApiClient {
  constructor() {}
  async get<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body);
  }

  async upload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
    return request<T>('POST', path, formData, true);
  }

  async patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('PATCH', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path);
  }
}

export const apiClient = new ApiClient();
