CREATE TABLE "evidence" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "control_id" text,
  "source_type" text NOT NULL,
  "pdf_id" text,
  "link_url" text,
  "collected_at" timestamp with time zone,
  "retention_days" integer,
  "retention_ends_at" timestamp with time zone,
  "status" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  "deleted_at" timestamp with time zone,
  "created_by" text NOT NULL,
  "updated_by" text NOT NULL,
  "deleted_by" text,
  "revision_id" text NOT NULL,
  "org_id" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "evidence_control_id_idx" ON "evidence" USING btree ("control_id");
--> statement-breakpoint
CREATE INDEX "evidence_pdf_id_idx" ON "evidence" USING btree ("pdf_id");
--> statement-breakpoint
CREATE INDEX "evidence_org_id_idx" ON "evidence" USING btree ("org_id");
