import { db } from "config/db";
import { NewUser, users } from "modules/users/users.model";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, comparePasswords } from "utils/hash";
import { sendPasswordResetEmail } from "utils/email";
import { FastifyInstance } from "fastify";
import crypto from "crypto";

import {
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.types";
export const AuthService = {
  async register(
    { email, password, firstName, lastName, role }: NewUser,
    fastify: FastifyInstance,
  ) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) throw new Error("Email already registered");

    const hashed = await hashPassword(password!);
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashed,
        firstName,
        lastName,
        role,
        authProvider: "EMAIL",
      })
      .returning();

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: "15m" },
    );
    const refreshToken = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: "7d" },
    );
    return { token: { accessToken, refreshToken } };
  },

  async login({ email, password }: LoginInput, fastify: FastifyInstance) {
    const [user] = await db
      .select({
        email: users.email,
        id: users.id,
        role: users.role,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email));
    if (!user) throw new Error("No account found with this email address");

    if (!user.password) {
      throw new Error(
        "This account uses Google sign-in. Please use Google to log in.",
      );
    }

    const valid = await comparePasswords(password, user.password);
    if (!valid) throw new Error("Incorrect password");

    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: "15m" },
    );
    const refreshToken = fastify.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: "7d" },
    );
    return { accessToken, refreshToken };
  },

  async refresh({ refreshToken }: RefreshInput, fastify: FastifyInstance) {
    const payload = fastify.jwt.verify(refreshToken) as any;
    const newAccessToken = fastify.jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      { expiresIn: "15m" },
    );
    const newRefreshToken = fastify.jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      { expiresIn: "7d" },
    );
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async forgotPassword({ email }: ForgotPasswordInput) {
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return {
        message:
          "If an account exists with this email, a reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await db
      .update(users)
      .set({
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        "If an account exists with this email, a reset link has been sent",
    };
  },

  async resetPassword({ token, password }: ResetPasswordInput) {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, hashedToken),
          gt(users.passwordResetExpires, new Date()),
        ),
      );

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password and clear reset token
    const hashedPassword = await hashPassword(password);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { message: "Password has been reset successfully" };
  },
};
