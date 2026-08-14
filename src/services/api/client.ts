/**
 * API Client — Real HTTP implementation using fetch.
 * Connects to the CityPulse Express backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const REQUEST_TIMEOUT_MS = 15000;

// In-flight GET dedup: collapses simultaneous identical requests into one network call.
const inflight = new Map<string, Promise<ApiResponse<unknown>>>();

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  isFormData = false,
  signal?: AbortSignal
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort);
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
      signal: controller.signal,
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
    if (controller.signal.aborted && !signal?.aborted) {
      return { data: null as T, error: 'Request timed out', status: 0 };
    }
    return {
      data: null as T,
      error: (err as Error).message || 'Network error',
      status: 0,
    };
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}

class ApiClient {
  constructor() {}
  async get<T>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    const existing = inflight.get(path);
    if (existing) return existing as Promise<ApiResponse<T>>;

    const promise = request<T>('GET', path, undefined, false, signal);
    inflight.set(path, promise);
    try {
      return await promise;
    } finally {
      if (inflight.get(path) === promise) inflight.delete(path);
    }
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
