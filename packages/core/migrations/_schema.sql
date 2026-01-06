-- Workflow table
CREATE TABLE workflow (
  id VARCHAR(255) PRIMARY KEY,
  workflow_id VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  status VARCHAR(100) NOT NULL,

  org_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  deleted_by VARCHAR(255),
  hash VARCHAR(255) NOT NULL,

  CONSTRAINT workflow_self_ref CHECK (workflow_id = id)
);

-- Framework table
CREATE TABLE framework (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50),
  source_url VARCHAR(500),

  workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),

  org_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  deleted_by VARCHAR(255),
  hash VARCHAR(255) NOT NULL
);

-- Control table
CREATE TABLE control (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  framework_id VARCHAR(255) NOT NULL REFERENCES framework(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  testing_frequency VARCHAR(50),

  workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),

  org_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  deleted_by VARCHAR(255),
  hash VARCHAR(255) NOT NULL
);

-- Document table
CREATE TABLE document (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  size BIGINT,
  framework_id VARCHAR(255) REFERENCES framework(id),
  control_id VARCHAR(255) REFERENCES control(id),

  workflow_id VARCHAR(255) NOT NULL REFERENCES workflow(id),

  org_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  deleted_by VARCHAR(255),
  hash VARCHAR(255) NOT NULL
);
