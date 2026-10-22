export type UserRole = "LANDLORD" | "TENANT" | "BOTH" | "ADMIN";

/** Mirrors `UserWithRoleResponse` (returned directly by `GET /users/me`). */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

