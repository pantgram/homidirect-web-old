import { supabase } from "@/lib/supabase";
import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, User } from "@/types";

/** Mirrors `UserDetailResponse`. */
interface UserDetailResponse {
  user: User;
}

export const authApi = {
  /**
   * Mirrors the app profile row into the backend (`POST /auth/sync`).
   *
   * The backend reads profile claims from the token's `user_metadata`
   * (snake_case keys), so this must be called after `signUp` and after
   * every `supabase.auth.updateUser` that changes names, email or role.
   */
  async syncProfile(): Promise<User> {
    const response = await apiClient.post<UserDetailResponse>("/auth/sync");
    return response.data.user;
  },

  async login(data: LoginRequest): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw error;
  },

  /**
   * Signs the user up. Returns `true` when the user got a session right away
   * (email confirmation disabled) and `false` when a verification email was
   * sent and the user must confirm their address first.
   */
  async register(data: RegisterRequest): Promise<boolean> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
        },
      },
    });
    if (error) throw error;
    return !!authData.session;
  },

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw error;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  getCurrentUser(): Promise<User> {
    return this.getMe();
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async isAuthenticated(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  async getDisplayName(): Promise<{ firstName: string; lastName: string } | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata as Record<string, string | undefined>;
    return {
      firstName: meta.given_name ?? meta.first_name ?? meta.name ?? "",
      lastName: meta.family_name ?? meta.last_name ?? "",
    };
  },

  async forgotPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async resetPassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
};
