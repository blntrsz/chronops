CREATE TABLE "issue" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "type" text NOT NULL,
  "status" text NOT NULL,
  "severity" text,
  "control_id" text NOT NULL,
  "assessment_instance_id" text,
  "evidence_id" text,
  "due_at" timestamptz,
  "resolved_at" timestamptz,

  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "deleted_at" timestamptz,

  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "deleted_by" text,

  "revision_id" text NOT NULL,
  "org_id" text NOT NULL
);

CREATE INDEX "issue_org_id_idx" ON "issue" ("org_id");
CREATE INDEX "issue_control_id_idx" ON "issue" ("control_id");
CREATE INDEX "issue_assessment_instance_id_idx" ON "issue" ("assessment_instance_id");
CREATE INDEX "issue_evidence_id_idx" ON "issue" ("evidence_id");
CREATE INDEX "issue_status_idx" ON "issue" ("status");
CREATE INDEX "issue_type_idx" ON "issue" ("type");
