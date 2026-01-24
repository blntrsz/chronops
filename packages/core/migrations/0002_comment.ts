import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
  CREATE TABLE IF NOT EXISTS comment (
    id VARCHAR(255) PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system'
  );

  CREATE INDEX IF NOT EXISTS comment_target_idx ON comment(org_id, entity_id);
  CREATE INDEX IF NOT EXISTS comment_target_created_idx ON comment(org_id, entity_id, created_at);
`,
);
