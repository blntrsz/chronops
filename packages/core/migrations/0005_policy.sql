CREATE TABLE "policy" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text NOT NULL,
  "version" text,
  "effective_at" timestamptz,
  "review_due_at" timestamptz,
  "review_frequency" text,
  "owner_id" text,
  "control_id" text,

  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "deleted_at" timestamptz,

  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "deleted_by" text,

  "revision_id" text NOT NULL,
  "org_id" text NOT NULL
);

CREATE INDEX "policy_org_id_idx" ON "policy" ("org_id");
CREATE INDEX "policy_status_idx" ON "policy" ("status");
CREATE INDEX "policy_owner_id_idx" ON "policy" ("owner_id");
CREATE INDEX "policy_control_id_idx" ON "policy" ("control_id");
CREATE INDEX "policy_review_due_at_idx" ON "policy" ("review_due_at");
