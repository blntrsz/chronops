import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE document (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      url VARCHAR(500) NOT NULL,
      size BIGINT,
      framework_id VARCHAR(255) REFERENCES framework(id),
      control_id VARCHAR(255) REFERENCES control(id),

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
