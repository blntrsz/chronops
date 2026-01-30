import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
  CREATE TABLE IF NOT EXISTS tag (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system'
  );

  CREATE INDEX IF NOT EXISTS tag_org_name_idx ON tag(org_id, name);

  CREATE TABLE IF NOT EXISTS entity_tag (
    entity_id VARCHAR(255) NOT NULL,
    tag_id VARCHAR(255) NOT NULL,
    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    PRIMARY KEY (entity_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS entity_tag_entity_idx ON entity_tag(org_id, entity_id);
  CREATE INDEX IF NOT EXISTS entity_tag_tag_idx ON entity_tag(tag_id);
`,
);
