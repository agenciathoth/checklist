import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "production", "test"]).default("dev"),
  DATABASE_URL: z.string().url(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASS: z.string(),
  POSTGRES_DB: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (parsedEnv.success === false) {
  // eslint-disable-next-line no-console
  console.error(
    "⚠️ Environment variables are not valid: ",
    parsedEnv.error.format()
  );

  throw new Error("Environment variables are not valid"); // This will stop the app
}

export const env = parsedEnv.data;
