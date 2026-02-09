CREATE TABLE "audit" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "scope" text,
  "assessment_method_id" text NOT NULL,
  "status" text NOT NULL,

  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "deleted_at" timestamptz,

  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "deleted_by" text,

  "revision_id" text NOT NULL,
  "org_id" text NOT NULL
);

CREATE INDEX "audit_org_id_idx" ON "audit" ("org_id");
CREATE INDEX "audit_status_idx" ON "audit" ("status");
CREATE INDEX "audit_assessment_method_id_idx" ON "audit" ("assessment_method_id");

CREATE TABLE "audit_run" (
  "id" text PRIMARY KEY NOT NULL,
  "audit_id" text NOT NULL,
  "assessment_method_id" text NOT NULL,
  "status" text NOT NULL,
  "started_at" timestamptz,
  "finished_at" timestamptz,

  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "deleted_at" timestamptz,

  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "deleted_by" text,

  "revision_id" text NOT NULL,
  "org_id" text NOT NULL
);

CREATE INDEX "audit_run_org_id_idx" ON "audit_run" ("org_id");
CREATE INDEX "audit_run_audit_id_idx" ON "audit_run" ("audit_id");
CREATE INDEX "audit_run_status_idx" ON "audit_run" ("status");
CREATE INDEX "audit_run_assessment_method_id_idx" ON "audit_run" ("assessment_method_id");
