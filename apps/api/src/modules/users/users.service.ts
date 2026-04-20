import { eq, ne } from "drizzle-orm";
import { db } from "config/db";
import { users, NewUser } from "./users.model";
import { UpdateUser, UserResponse, UserWithRole } from "./users.types";
import { ConflictError } from "utils/errors";

export const UserService = {
  async getAllUsers(): Promise<UserResponse[]> {
    const allUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users);

    return allUsers;
  },

  async getUserById(id: number): Promise<UserResponse | null> {
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  },

  async getUserWithRole(id: number): Promise<UserWithRole | null> {
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  },

  async createUser(data: NewUser): Promise<UserResponse> {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const [newUser] = await db.insert(users).values(data).returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt,
    });

    return newUser;
  },

  async updateUser(id: number, data: UpdateUser): Promise<UserWithRole | null> {
    if (data.email) {
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictError("Email already exists");
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return updatedUser || null;
  },

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  },
};
