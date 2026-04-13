import { db } from "config/db";
import { users } from "@/modules/users/users.model";
import { eq } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { config } from "@/config/env";
import { ConflictError } from "@/utils/errors";

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export const GoogleAuthService = {
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  async exchangeCodeForTokens(code: string): Promise<{ access_token: string }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.google.callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code: ${error}`);
    }

    return response.json();
  },

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    return response.json();
  },

  async findOrCreateUser(
    googleUser: GoogleUserInfo,
    fastify: FastifyInstance,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [existingByGoogleId] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.id));

    if (existingByGoogleId) {
      return this.generateTokens(existingByGoogleId, fastify);
    }

    const [existingByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email));

    if (existingByEmail) {
      throw new ConflictError(
        "An account with this email already exists. Please log in with your email and password.",
      );
    }

    const firstName =
      googleUser.given_name || googleUser.name?.split(" ")[0] || "User";
    const lastName =
      googleUser.family_name ||
      googleUser.name?.split(" ").slice(1).join(" ") ||
      "";

    const [newUser] = await db
      .insert(users)
      .values({
        email: googleUser.email,
        firstName,
        lastName,
        googleId: googleUser.id,
        authProvider: "GOOGLE",
        emailVerified: googleUser.verified_email,
        role: "TENANT",
        password: null,
      })
      .returning();

    return this.generateTokens(newUser, fastify);
  },

  generateTokens(
    user: { id: number; email: string; role: string },
    fastify: FastifyInstance,
  ): { accessToken: string; refreshToken: string } {
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
};
