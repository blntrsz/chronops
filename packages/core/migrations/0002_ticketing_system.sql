CREATE TABLE "ticket_counter" (
	"org_id" text NOT NULL,
	"prefix" text NOT NULL,
	"serial" integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_counter_org_prefix_uidx" ON "ticket_counter" USING btree ("org_id","prefix");
--> statement-breakpoint
ALTER TABLE "framework" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "framework"
)
UPDATE "framework" AS target
SET "ticket" = 'FWK-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "framework" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "framework_org_ticket_uidx" ON "framework" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "control" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "control"
)
UPDATE "control" AS target
SET "ticket" = 'CTR-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "control" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "control_org_ticket_uidx" ON "control" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "policy" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "policy"
)
UPDATE "policy" AS target
SET "ticket" = 'POL-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "policy" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "policy_org_ticket_uidx" ON "policy" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "risk" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "risk"
)
UPDATE "risk" AS target
SET "ticket" = 'RSK-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "risk" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "risk_org_ticket_uidx" ON "risk" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "issue"
)
UPDATE "issue" AS target
SET "ticket" = 'ISS-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "issue" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "issue_org_ticket_uidx" ON "issue" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "audit" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "audit"
)
UPDATE "audit" AS target
SET "ticket" = 'AUD-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "audit" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "audit_org_ticket_uidx" ON "audit" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "audit_run" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "audit_run"
)
UPDATE "audit_run" AS target
SET "ticket" = 'ADR-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "audit_run" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "audit_run_org_ticket_uidx" ON "audit_run" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "assessment_template" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "assessment_template"
)
UPDATE "assessment_template" AS target
SET "ticket" = 'AST-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "assessment_template" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "assessment_template_org_ticket_uidx" ON "assessment_template" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "assessment_instance" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "assessment_instance"
)
UPDATE "assessment_instance" AS target
SET "ticket" = 'ASI-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "assessment_instance" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "assessment_instance_org_ticket_uidx" ON "assessment_instance" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "evidence" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "evidence"
)
UPDATE "evidence" AS target
SET "ticket" = 'EVD-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "evidence" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "evidence_org_ticket_uidx" ON "evidence" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "comment"
)
UPDATE "comment" AS target
SET "ticket" = 'CMT-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "comment" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "comment_org_ticket_uidx" ON "comment" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "schedule" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "schedule"
)
UPDATE "schedule" AS target
SET "ticket" = 'SCH-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "schedule" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "schedule_org_ticket_uidx" ON "schedule" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "schedule_run" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "schedule_run"
)
UPDATE "schedule_run" AS target
SET "ticket" = 'SRN-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "schedule_run" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "schedule_run_org_ticket_uidx" ON "schedule_run" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "pdf" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "pdf"
)
UPDATE "pdf" AS target
SET "ticket" = 'PDF-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "pdf" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "pdf_org_ticket_uidx" ON "pdf" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "pdf_page" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "pdf_page"
)
UPDATE "pdf_page" AS target
SET "ticket" = 'PG-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "pdf_page" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "pdf_page_org_ticket_uidx" ON "pdf_page" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "questioner_template" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "questioner_template"
)
UPDATE "questioner_template" AS target
SET "ticket" = 'QST-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "questioner_template" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "questioner_template_org_ticket_uidx" ON "questioner_template" USING btree ("org_id","ticket");
--> statement-breakpoint
ALTER TABLE "questioner_instance" ADD COLUMN "ticket" text;
WITH ranked AS (
	SELECT id, org_id, row_number() OVER (PARTITION BY org_id ORDER BY created_at) AS rn
	FROM "questioner_instance"
)
UPDATE "questioner_instance" AS target
SET "ticket" = 'QSI-' || ranked.rn
FROM ranked
WHERE target.id = ranked.id;
ALTER TABLE "questioner_instance" ALTER COLUMN "ticket" SET NOT NULL;
CREATE UNIQUE INDEX "questioner_instance_org_ticket_uidx" ON "questioner_instance" USING btree ("org_id","ticket");
--> statement-breakpoint
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'FWK', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "framework" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'CTR', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "control" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'POL', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "policy" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'RSK', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "risk" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'ISS', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "issue" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'AUD', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "audit" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'ADR', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "audit_run" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'AST', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "assessment_template" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'ASI', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "assessment_instance" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'EVD', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "evidence" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'CMT', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "comment" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'SCH', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "schedule" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'SRN', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "schedule_run" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'PDF', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "pdf" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'PG', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "pdf_page" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'QST', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "questioner_template" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
INSERT INTO "ticket_counter" ("org_id", "prefix", "serial")
SELECT org_id, 'QSI', COALESCE(MAX(split_part(ticket, '-', 2)::int), 0) + 1 FROM "questioner_instance" GROUP BY org_id
ON CONFLICT ("org_id", "prefix") DO UPDATE SET "serial" = GREATEST("ticket_counter"."serial", EXCLUDED."serial");
