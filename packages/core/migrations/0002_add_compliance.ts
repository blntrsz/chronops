import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE compliances (
      id varchar(255) PRIMARY KEY,
      name varchar(255) NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      deleted_at TIMESTAMP,
      created_by varchar(255) NOT NULL,
      updated_by varchar(255) NOT NULL,
      deleted_by varchar(255),
      organization_id varchar(255) NOT NULL
    )
  `,
);
