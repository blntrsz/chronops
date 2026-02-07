CREATE TABLE "assessment_template" (
  "id" text PRIMARY KEY NOT NULL,
  "control_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
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
CREATE TABLE "assessment_instance" (
  "id" text PRIMARY KEY NOT NULL,
  "template_id" text NOT NULL,
  "control_id" text NOT NULL,
  "name" text NOT NULL,
  "status" text NOT NULL,
  "workflow_status" text NOT NULL,
  "due_date" timestamp with time zone,
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
CREATE INDEX "assessment_template_control_id_idx" ON "assessment_template" USING btree ("control_id");
--> statement-breakpoint
CREATE INDEX "assessment_template_org_id_idx" ON "assessment_template" USING btree ("org_id");
--> statement-breakpoint
CREATE INDEX "assessment_instance_control_id_idx" ON "assessment_instance" USING btree ("control_id");
--> statement-breakpoint
CREATE INDEX "assessment_instance_template_id_idx" ON "assessment_instance" USING btree ("template_id");
--> statement-breakpoint
CREATE INDEX "assessment_instance_org_id_idx" ON "assessment_instance" USING btree ("org_id");
