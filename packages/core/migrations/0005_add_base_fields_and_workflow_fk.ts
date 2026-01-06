import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    ALTER TABLE framework
      ADD COLUMN workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),
      ADD COLUMN org_id VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN deleted_at TIMESTAMPTZ,
      ADD COLUMN created_by VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN deleted_by VARCHAR(255),
      ADD COLUMN hash VARCHAR(255) NOT NULL DEFAULT 'system';

    ALTER TABLE control
      ADD COLUMN workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),
      ADD COLUMN org_id VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN deleted_at TIMESTAMPTZ,
      ADD COLUMN created_by VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN deleted_by VARCHAR(255),
      ADD COLUMN hash VARCHAR(255) NOT NULL DEFAULT 'system';

    ALTER TABLE document
      ADD COLUMN workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),
      ADD COLUMN org_id VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN deleted_at TIMESTAMPTZ,
      ADD COLUMN created_by VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
      ADD COLUMN deleted_by VARCHAR(255),
      ADD COLUMN hash VARCHAR(255) NOT NULL DEFAULT 'system'
  `,
);
