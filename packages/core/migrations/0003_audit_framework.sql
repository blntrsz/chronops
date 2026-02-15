CREATE TABLE "audit_framework" (
	"audit_id" text NOT NULL,
	"framework_id" text NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "audit_framework_audit_id_framework_id_pk" PRIMARY KEY("audit_id","framework_id")
);
--> statement-breakpoint
CREATE INDEX "audit_framework_framework_id_idx" ON "audit_framework" USING btree ("framework_id");
--> statement-breakpoint
CREATE INDEX "audit_framework_org_id_idx" ON "audit_framework" USING btree ("org_id");
