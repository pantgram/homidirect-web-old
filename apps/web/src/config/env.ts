import { z } from "zod";

const envSchema = z.object({
  apiUrl: z.string().url().default("http://localhost:5000"),
});

const parsed = envSchema.parse({
  apiUrl: import.meta.env.VITE_API_URL || undefined,
});

export const env = {
  apiUrl: parsed.apiUrl,
  isDev: import.meta.env.DEV,
} as const;
