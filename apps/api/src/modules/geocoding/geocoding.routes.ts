import { FastifyInstance } from "fastify";
import { GeocodingController } from "./geocoding.controller";

export async function geocodingRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/search",
    {
      preValidation: [fastify.authenticate],
    },
    GeocodingController.search as any
  );

  fastify.get(
    "/reverse",
    {
      preValidation: [fastify.authenticate],
    },
    GeocodingController.reverse as any
  );
}
