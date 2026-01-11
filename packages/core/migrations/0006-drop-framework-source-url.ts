import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    ALTER TABLE framework
    DROP COLUMN source_url
  `,
);
