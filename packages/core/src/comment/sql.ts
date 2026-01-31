import { pgTable, text } from "drizzle-orm/pg-core";

import { Actor, Base, Comment } from "@chronops/domain";

import { timestampUtc, timestampUtcNullable } from "../common/db-type";

export const commentTable = pgTable("comment", {
  // Comment fields
  id: text().notNull().$type<Comment.CommentId>().primaryKey(),
  entityId: text().notNull().$type<Comment.CommentEntityId>(),
  body: text().notNull(),

  // Base fields
  createdAt: timestampUtc({ withTimezone: true }).notNull(),
  updatedAt: timestampUtc({ withTimezone: true }).notNull(),
  deletedAt: timestampUtcNullable({ withTimezone: true }),

  createdBy: text().$type<Actor.MemberId>().notNull(),
  updatedBy: text().$type<Actor.MemberId>().notNull(),
  deletedBy: text().$type<Actor.MemberId>(),

  hash: text().$type<Base.Hash>().notNull(),
  orgId: text().$type<Actor.OrgId>().notNull(),
});
