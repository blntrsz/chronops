import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
  CREATE TABLE IF NOT EXISTS schedule (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cron_expression VARCHAR(255) NOT NULL,
    time_zone VARCHAR(255) NOT NULL DEFAULT 'UTC',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    run_policy JSONB NOT NULL DEFAULT '{"maxRetries": 3, "retryDelayMinutes": 5, "concurrency": "skip", "timeoutMinutes": 30}',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    run_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system'
  );

  CREATE INDEX IF NOT EXISTS schedule_org_idx ON schedule(org_id);
  CREATE INDEX IF NOT EXISTS schedule_status_next_run_idx ON schedule(status, next_run_at);
  CREATE INDEX IF NOT EXISTS schedule_trigger_type_idx ON schedule(org_id, trigger_type);

  CREATE TABLE IF NOT EXISTS schedule_history (
    id VARCHAR(255) PRIMARY KEY,
    schedule_id VARCHAR(255) NOT NULL,
    triggered_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    result TEXT,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    org_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    deleted_by VARCHAR(255),
    hash VARCHAR(255) NOT NULL DEFAULT 'system',
    FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS schedule_history_schedule_idx ON schedule_history(org_id, schedule_id);
  CREATE INDEX IF NOT EXISTS schedule_history_status_idx ON schedule_history(org_id, status);
  CREATE INDEX IF NOT EXISTS schedule_history_triggered_idx ON schedule_history(org_id, triggered_at);
`,
);
