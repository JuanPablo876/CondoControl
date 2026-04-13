import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  DB_PROVIDER: z.enum(["memory", "sqlite", "postgres"]).default("memory"),
  SQLITE_FILE_PATH: z.string().default("./data/condocontrol.sqlite"),
  DATABASE_URL: z.string().optional(),
  SUPABASE_DB_URL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(), // For Conversational AI
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  TWILIO_VOICE_FROM: z.string().optional(),
  BAILEYS_SESSION_PATH: z.string().default("./data/baileys-session"),
  SENDGRID_API_KEY: z.string().optional(),
  BANK_WEBHOOK_SECRET: z.string().optional()
});

export const env = schema.parse(process.env);
