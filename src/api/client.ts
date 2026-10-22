import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { supabase } from "@/lib/supabase";

export const apiClient = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthExpiredHandler = () => void;

let authExpiredHandler: AuthExpiredHandler | null = null;

export function setAuthExpiredHandler(handler: AuthExpiredHandler): void {
  authExpiredHandler = handler;
}

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

function handleAuthExpired(): void {
  if (authExpiredHandler) {
    authExpiredHandler();
  } else {
    window.location.assign("/auth");
  }
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data, error: refreshError } =
          await supabase.auth.refreshSession();
        if (refreshError || !data.session) {
          throw refreshError ?? new Error("No session after refresh");
        }

        const token = data.session.access_token;
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await supabase.auth.signOut();
        handleAuthExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data as Partial<ApiError>;
      if (data.message) {
        return {
          message: data.message,
          statusCode: error.response.status,
          error: data.error,
        };
      }
    }
    return {
      message: error.message || "An unexpected error occurred",
      statusCode: error.response?.status ?? 500,
    };
  }

  if (error instanceof Error && error.message) {
    const status = (error as Error & { status?: number }).status;
    return {
      message: error.message,
      statusCode: typeof status === "number" ? status : 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
  };
};
