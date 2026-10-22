import { z } from "zod";

const envSchema = z.object({
  apiUrl: z.string().url().default("http://localhost:5000"),
  supabaseUrl: z.string().url(),
  supabasePublishableKey: z.string().min(1),
});

const parsed = envSchema.parse({
  apiUrl: import.meta.env.VITE_API_URL || undefined,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || undefined,
  supabasePublishableKey:
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || undefined,
});

export const env = {
  apiUrl: parsed.apiUrl,
  supabaseUrl: parsed.supabaseUrl,
  supabasePublishableKey: parsed.supabasePublishableKey,
  isDev: import.meta.env.DEV,
} as const;
