import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE workflow (
      id VARCHAR(255) PRIMARY KEY,
      workflow_id VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      status VARCHAR(100) NOT NULL,

      org_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ,
      created_by VARCHAR(255) NOT NULL DEFAULT 'system',
      updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
      deleted_by VARCHAR(255),
      hash VARCHAR(255) NOT NULL DEFAULT 'system',

      CONSTRAINT workflow_self_ref CHECK (workflow_id = id)
    )
  `,
);
