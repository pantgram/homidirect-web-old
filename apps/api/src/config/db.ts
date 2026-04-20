// src/config/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "./env";
import { schema } from "@/db";

const client = postgres(config.databaseUrl);

export const db = drizzle(client, { schema });
