import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || 'postgres://dashevolutia:@Ev0luTi42025@easypanel.evolutionmanagerevolutia.space:5502/dashevolutia?sslmode=disable';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});