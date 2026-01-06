import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE control (
      id varchar(255) PRIMARY KEY,
      name varchar(255) NOT NULL,
      description TEXT,
      framework_id varchar(255) NOT NULL REFERENCES framework(id),
      status varchar(50) NOT NULL DEFAULT 'draft',
      testing_frequency varchar(50)
    )
  `,
);
