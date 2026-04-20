import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "utils/errors";
import { ZodError } from "zod";

/**
 * Global error handler middleware
 */
export async function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Log error for debugging (in production, use proper logging service)
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: "Validation Error",
      message: "Invalid request data",
      details: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
  }

  // Handle Fastify errors (includes rate limiting)
  if ("statusCode" in error && error.statusCode) {
    return reply.code(error.statusCode).send({
      error: error.name || "Error",
      message: error.message,
    });
  }

  // Handle unknown errors
  return reply.code(500).send({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message,
  });
}
