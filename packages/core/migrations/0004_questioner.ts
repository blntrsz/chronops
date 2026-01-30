import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
  CREATE TABLE IF NOT EXISTS questioner (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]',
    scoring_config JSONB NOT NULL DEFAULT '{"passingScore": 70, "autoScore": true}',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system'
  );

  CREATE INDEX IF NOT EXISTS questioner_org_status_idx ON questioner(org_id, status);
  CREATE INDEX IF NOT EXISTS questioner_org_name_idx ON questioner(org_id, name);

  CREATE TABLE IF NOT EXISTS questioner_response (
    id VARCHAR(255) PRIMARY KEY,
    questioner_id VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    answers JSONB NOT NULL DEFAULT '[]',
    score INTEGER,
    submitted_at TIMESTAMPTZ,
    submitted_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255),
    review_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system',
    FOREIGN KEY (questioner_id) REFERENCES questioner(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS questioner_response_questioner_idx ON questioner_response(org_id, questioner_id);
  CREATE INDEX IF NOT EXISTS questioner_response_entity_idx ON questioner_response(org_id, entity_id, entity_type);
  CREATE INDEX IF NOT EXISTS questioner_response_status_idx ON questioner_response(org_id, status);
`,
);
