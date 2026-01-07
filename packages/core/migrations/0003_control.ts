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
      testing_frequency varchar(50),

      workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),
      org_id VARCHAR(255) NOT NULL DEFAULT 'system',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ,
      created_by VARCHAR(255) NOT NULL DEFAULT 'system',
      updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
      deleted_by VARCHAR(255),
      hash VARCHAR(255) NOT NULL DEFAULT 'system'
    )
  `,
);
