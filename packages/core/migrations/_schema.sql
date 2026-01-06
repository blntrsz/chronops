-- Framework table
CREATE TABLE framework (
  id varchar(255) PRIMARY KEY,
  name varchar(255) NOT NULL,
  description TEXT,
  version varchar(50),
  source_url varchar(500)
);

-- Control table
CREATE TABLE control (
  id varchar(255) PRIMARY KEY,
  name varchar(255) NOT NULL,
  description TEXT,
  framework_id varchar(255) NOT NULL REFERENCES framework(id),
  status varchar(50) NOT NULL DEFAULT 'draft',
  testing_frequency varchar(50)
);

-- Document table
CREATE TABLE document (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  size BIGINT,
  framework_id VARCHAR(255) REFERENCES framework(id),
  control_id VARCHAR(255) REFERENCES control(id)
);
