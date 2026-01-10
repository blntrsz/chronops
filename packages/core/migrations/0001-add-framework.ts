import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE framework (
      id varchar(255) PRIMARY KEY,
      name varchar(255) NOT NULL,
      description TEXT,
      version varchar(50),
      source_url varchar(500)
    )
  `,
);
