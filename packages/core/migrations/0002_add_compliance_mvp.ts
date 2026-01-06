import { Effect } from "effect";
import { SqlClient } from "@effect/sql";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE document (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      url VARCHAR(500) NOT NULL,
      size BIGINT,
      document_id VARCHAR(255) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id VARCHAR(255),
      CONSTRAINT idx_document_polymorphic UNIQUE (documentable_type, documentable_id, document_id)
    );
    CREATE INDEX idx_document_documentable ON document (documentable_type, documentable_id)
  `,
);
