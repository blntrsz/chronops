CREATE TABLE "risk" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text NOT NULL,
  "likelihood" text NOT NULL,
  "impact" text NOT NULL,
  "score" integer,
  "treatment" text,
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

CREATE INDEX "risk_org_id_idx" ON "risk" ("org_id");
CREATE INDEX "risk_control_id_idx" ON "risk" ("control_id");
CREATE INDEX "risk_status_idx" ON "risk" ("status");
CREATE INDEX "risk_likelihood_idx" ON "risk" ("likelihood");
CREATE INDEX "risk_impact_idx" ON "risk" ("impact");
