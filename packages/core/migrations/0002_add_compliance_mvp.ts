import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    -- Add framework columns
    ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS version VARCHAR(50);
    ALTER TABLE frameworks ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);

    -- Add control columns and FK
    ALTER TABLE controls ADD COLUMN IF NOT EXISTS framework_id VARCHAR(255) REFERENCES frameworks(id);
    ALTER TABLE controls ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE controls ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
    ALTER TABLE controls ADD COLUMN IF NOT EXISTS testing_frequency VARCHAR(50);

    -- Create documents table
    CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      url VARCHAR(500) NOT NULL,
      size BIGINT,
      framework_id VARCHAR(255) REFERENCES frameworks(id),
      control_id VARCHAR(255) REFERENCES controls(id),
      organization_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL,
      created_by VARCHAR(255) NOT NULL
    )
  `,
);
