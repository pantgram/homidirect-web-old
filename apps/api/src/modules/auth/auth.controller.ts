import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { NewUser } from "modules/users/users.model";
import {
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.types";
import {
  ConflictError,
  UnauthorizedError,
  InternalServerError,
  ValidationError,
} from "utils/errors";

export const AuthController = {
  async register(req: FastifyRequest<{ Body: NewUser }>, reply: FastifyReply) {
    try {
      const data = await AuthService.register(req.body, req.server);
      return reply.status(201).send(data);
    } catch (err: any) {
      req.log.error(err);
      if (err.message === "Email already registered") {
        throw new ConflictError("Email already registered");
      }
      throw new InternalServerError("Registration failed");
    }
  },

  async login(req: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const token = await AuthService.login(req.body, req.server);
      return reply.send({ token });
    } catch (err: any) {
      req.log.error(err);
      if (err.message === "No account found with this email address") {
        throw new UnauthorizedError("No account found with this email address");
      }
      if (err.message === "Incorrect password") {
        throw new UnauthorizedError("Incorrect password");
      }
      throw new InternalServerError("Login failed");
    }
  },

  async refresh(
    req: FastifyRequest<{ Body: RefreshInput }>,
    reply: FastifyReply,
  ) {
    try {
      const tokens = await AuthService.refresh(req.body, req.server);
      return reply.send({ tokens });
    } catch (err: any) {
      req.log.error(err);
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  },

  async forgotPassword(
    req: FastifyRequest<{ Body: ForgotPasswordInput }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await AuthService.forgotPassword(req.body);
      return reply.send(result);
    } catch (err: any) {
      req.log.error(err);
      throw new InternalServerError("Failed to process password reset request");
    }
  },

  async resetPassword(
    req: FastifyRequest<{ Body: ResetPasswordInput }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return reply.send(result);
    } catch (err: any) {
      req.log.error(err);
      if (err.message === "Invalid or expired reset token") {
        throw new ValidationError("Invalid or expired reset token");
      }
      throw new InternalServerError("Failed to reset password");
    }
  },
};
