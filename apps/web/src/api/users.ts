import { apiClient } from "./client";
import type { User, UpdateUserRequest } from "@/types";

export type { UpdateUserRequest };

export const usersApi = {
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<{ user: User }>(`/users/${id}`);
    return response.data.user;
  },

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<{ user: User }>(`/users/${id}`, data);
    return response.data.user;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
