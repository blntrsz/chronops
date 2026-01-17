import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(SqlClient.SqlClient, (sql) => sql`
  ALTER TABLE framework
  ADD COLUMN IF NOT EXISTS owner VARCHAR(255),
  ADD COLUMN IF NOT EXISTS scope VARCHAR(255);
`);
