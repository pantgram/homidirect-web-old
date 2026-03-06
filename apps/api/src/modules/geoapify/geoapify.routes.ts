import { FastifyInstance } from "fastify";
import { GeoapifyController } from "./geoapify.controller";

export async function geoapifyRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/search",
    {
      preValidation: [fastify.authenticate],
    },
    GeoapifyController.search as any
  );
}
