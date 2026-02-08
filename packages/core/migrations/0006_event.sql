CREATE TABLE "event" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "actor_id" text NOT NULL,
  "org_id" text NOT NULL,
  "type_stamp" timestamptz NOT NULL,
  "revision_id_before" text,
  "revision_id" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL
);

CREATE INDEX "event_org_id_idx" ON "event" ("org_id");
CREATE INDEX "event_type_stamp_idx" ON "event" ("type_stamp");
CREATE INDEX "event_actor_id_idx" ON "event" ("actor_id");
CREATE INDEX "event_entity_idx" ON "event" ("entity_type", "entity_id");
