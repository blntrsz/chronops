import { getMigrations } from "better-auth/db";
import { auth } from "./src/server";

getMigrations(auth.options)
  .then((migrations) => {
    migrations.runMigrations().catch(console.error);
  })
  .catch(console.error);
