import { apiClient, tokenStorage } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshResponse,
  User,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types";

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    const { token } = response.data;
    tokenStorage.setToken(token.accessToken);
    tokenStorage.setRefreshToken(token.refreshToken);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/register",
      data
    );
    const { token } = response.data;
    tokenStorage.setToken(token.accessToken);
    tokenStorage.setRefreshToken(token.refreshToken);
    return response.data;
  },

  async refresh(data: RefreshTokenRequest): Promise<RefreshResponse> {
    const response = await apiClient.post<RefreshResponse>(
      "/auth/refresh",
      data
    );
    const { tokens } = response.data;
    tokenStorage.setToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  getCurrentUser(): Promise<User> {
    return this.getMe();
  },

  logout(): void {
    tokenStorage.clearTokens();
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getToken();
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },
};
