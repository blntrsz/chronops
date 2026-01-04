import { Context, Schema } from "effect";
import { ulid } from "ulid";

export class BaseSchema extends Schema.Class<BaseSchema>("BaseSchema")({
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.optional(Schema.Date),

  createdBy: Schema.String,
  updatedBy: Schema.String,
  deletedBy: Schema.optional(Schema.String),

  organizationId: Schema.String,
}) {}

export class ULID extends Context.Tag("ULID")<
  ULID,
  {
    createId: () => string;
  }
>() {}

export const ULIDLayer = ULID.of({
  createId: ulid,
});
