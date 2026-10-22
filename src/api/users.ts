import { apiClient } from "./client";
import type { User } from "@/types";

export const usersApi = {
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<{ user: User }>(`/users/${id}`);
    return response.data.user;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
