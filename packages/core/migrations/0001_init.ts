import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(SqlClient.SqlClient, (sql) => sql`
  CREATE TABLE IF NOT EXISTS framework (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50),

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

  CREATE TABLE IF NOT EXISTS control (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework_id VARCHAR(255) NOT NULL REFERENCES framework(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    testing_frequency VARCHAR(50),

    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system'
  );

  CREATE TABLE IF NOT EXISTS document (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    size BIGINT,
    framework_id VARCHAR(255) REFERENCES framework(id),
    control_id VARCHAR(255) REFERENCES control(id),

    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system'
  );
`);
