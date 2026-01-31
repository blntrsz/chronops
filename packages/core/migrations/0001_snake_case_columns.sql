-- Rename camelCase columns to snake_case for consistency with drizzle casing config

-- comment table
ALTER TABLE "comment" RENAME COLUMN "entityId" TO "entity_id";
ALTER TABLE "comment" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "comment" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "comment" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "comment" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "comment" RENAME COLUMN "updatedBy" TO "updated_by";
ALTER TABLE "comment" RENAME COLUMN "deletedBy" TO "deleted_by";
ALTER TABLE "comment" RENAME COLUMN "orgId" TO "org_id";

-- control table
ALTER TABLE "control" RENAME COLUMN "frameworkId" TO "framework_id";
ALTER TABLE "control" RENAME COLUMN "testingFrequency" TO "testing_frequency";
ALTER TABLE "control" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "control" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "control" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "control" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "control" RENAME COLUMN "updatedBy" TO "updated_by";
ALTER TABLE "control" RENAME COLUMN "deletedBy" TO "deleted_by";
ALTER TABLE "control" RENAME COLUMN "orgId" TO "org_id";

-- framework table
ALTER TABLE "framework" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "framework" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "framework" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "framework" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "framework" RENAME COLUMN "updatedBy" TO "updated_by";
ALTER TABLE "framework" RENAME COLUMN "deletedBy" TO "deleted_by";
ALTER TABLE "framework" RENAME COLUMN "orgId" TO "org_id";
