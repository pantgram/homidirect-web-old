import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "./users.service";
import { UpdateUser } from "./users.types";
import { NotFoundError, UnauthorizedError } from "utils/errors";
import { AuthenticatedRequest } from "middleware/authorization";

export const UserController = {
  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
    const user = await UserService.getUserById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return reply.code(200).send({ user: user });
  },

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUser }>,
    reply: FastifyReply,
  ) {
    const currentUser = (request as AuthenticatedRequest).user;
    const id = parseInt(request.params.id);

    const body = { ...request.body };

    if (body.role === "ADMIN" && currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can assign the ADMIN role");
    }

    const updated = await UserService.updateUser(id, body);

    if (!updated) {
      throw new NotFoundError("User not found");
    }

    return reply.code(200).send({ user: updated });
  },

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      throw new NotFoundError("User not found");
    }

    return reply.code(204).send();
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const req = request as AuthenticatedRequest;
    if (!req.user) {
      throw new UnauthorizedError("Not authenticated");
    }

    // Fetch full user data from database instead of just JWT payload
    const user = await UserService.getUserWithRole(req.user.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return reply.send(user);
  },
};
