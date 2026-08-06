export interface HttpClientOptions extends RequestInit {
  timeoutMs?: number;
}

export class HttpClientError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = "HttpClientError";
  }
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: HttpClientOptions = {}): Promise<T> {
    const { timeoutMs = 15000, headers, ...customConfig } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
      ...customConfig,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      clearTimeout(id);

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new HttpClientError(
          response.status,
          `HTTP Error ${response.status}: ${response.statusText}`,
          errorData
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      clearTimeout(id);
      if (error instanceof HttpClientError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new HttpClientError(408, "Request Timeout");
      }
      throw new HttpClientError(500, error instanceof Error ? error.message : "Network Request Failed");
    }
  }

  async get<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpClient = new HttpClient();
