CREATE TABLE "questioner_template" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "questions" text NOT NULL,
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
CREATE TABLE "questioner_instance" (
  "id" text PRIMARY KEY NOT NULL,
  "template_id" text NOT NULL,
  "name" text NOT NULL,
  "workflow_status" text NOT NULL,
  "responses" text NOT NULL,
  "submitted_at" timestamp with time zone,
  "submitted_by" text,
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
CREATE INDEX "questioner_template_org_id_idx" ON "questioner_template" USING btree ("org_id");
--> statement-breakpoint
CREATE INDEX "questioner_instance_template_id_idx" ON "questioner_instance" USING btree ("template_id");
--> statement-breakpoint
CREATE INDEX "questioner_instance_org_id_idx" ON "questioner_instance" USING btree ("org_id");
