import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { config } from "./config/env";
import { apiRoutes } from "./modules/index";
import jwtPlugin from "./plugins/jwt";
import { errorHandler } from "./middleware/errorHandler";
import { MAX_FILE_SIZE } from "./modules/listingImages/listingImages.types";
import { MAX_DOCUMENT_SIZE } from "./modules/verificationDocuments/verificationDocuments.types";

export function buildApp() {
  const fastify = Fastify({
    routerOptions: { caseSensitive: false, ignoreTrailingSlash: true },
    logger: {
      level: config.nodeEnv === "development" ? "info" : "error",
    },
  });

  // Register security plugins
  fastify.register(cors, {
    origin: config.nodeEnv === "development" ? true : config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  fastify.register(helmet);

  // Register multipart for file uploads
  // Configure to parse only multipart/form-data content types
  fastify.register(multipart, {
    limits: {
      fileSize: Math.max(MAX_FILE_SIZE, MAX_DOCUMENT_SIZE),
      fields: 20,
      files: 10,
    },
    attachFieldsToBody: false,
    throwFileSizeLimit: false,
  });

  // Register rate limiting (global defaults)
  fastify.register(rateLimit, {
    max: 100, // max requests per time window
    timeWindow: "15 minutes", // time window
    cache: 10000, // cache size for tracking IPs
    allowList: config.nodeEnv === "development" ? ["127.0.0.1"] : [], // whitelist localhost in development
    skipOnError: false,
  });

  // Register JWT plugin
  fastify.register(jwtPlugin);

  // Register global error handler
  fastify.setErrorHandler(errorHandler);

  // Health check
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register routes
  fastify.register(apiRoutes, { prefix: "/api/v1" });

  return fastify;
}
