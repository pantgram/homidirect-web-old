import { FastifyInstance } from "fastify";
import { GoogleAuthController } from "./google.controller";

export async function googleAuthRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15 minutes",
        },
      },
    },
    GoogleAuthController.initiate
  );

  fastify.get(
    "/callback",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "15 minutes",
        },
      },
    },
    GoogleAuthController.callback
  );
}
