import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleAuthService } from "./google.service";
import { config } from "@/config/env";
import { InternalServerError, ValidationError } from "@/utils/errors";
import crypto from "crypto";

const stateStore = new Map<string, { createdAt: number }>();
const STATE_TTL = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > STATE_TTL) {
      stateStore.delete(state);
    }
  }
}, 60 * 1000);

export const GoogleAuthController = {
  async initiate(req: FastifyRequest, reply: FastifyReply) {
    try {
      const state = crypto.randomBytes(16).toString("hex");
      stateStore.set(state, { createdAt: Date.now() });

      const authUrl = GoogleAuthService.getAuthUrl(state);
      return reply.redirect(authUrl);
    } catch (err: any) {
      req.log.error(err);
      throw new InternalServerError("Failed to initiate Google authentication");
    }
  },

  async callback(
    req: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        const frontendUrl = new URL("/auth", config.frontendUrl);
        frontendUrl.searchParams.set("error", error);
        return reply.redirect(frontendUrl.toString());
      }

      if (!code || !state) {
        throw new ValidationError("Missing authorization code or state");
      }

      const storedState = stateStore.get(state);
      if (!storedState) {
        throw new ValidationError("Invalid or expired state parameter");
      }
      stateStore.delete(state);

      const tokens = await GoogleAuthService.exchangeCodeForTokens(code);
      const googleUser = await GoogleAuthService.getUserInfo(tokens.access_token);
      const jwtTokens = await GoogleAuthService.findOrCreateUser(googleUser, req.server);

      const frontendUrl = new URL("/auth/callback", config.frontendUrl);
      frontendUrl.hash = `accessToken=${jwtTokens.accessToken}&refreshToken=${jwtTokens.refreshToken}`;
      return reply.redirect(frontendUrl.toString());
    } catch (err: any) {
      req.log.error(err);
      const frontendUrl = new URL("/auth", config.frontendUrl);
      if (err.message?.includes("already exists")) {
        frontendUrl.searchParams.set("error", "account_exists");
      } else {
        frontendUrl.searchParams.set("error", "auth_failed");
      }
      return reply.redirect(frontendUrl.toString());
    }
  },
};
