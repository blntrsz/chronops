import { Context, Schema } from "effect";

export const MemberId = Schema.String.pipe(Schema.brand("MemberId"));
export type MemberId = typeof MemberId.Type;

export const OrgId = Schema.String.pipe(Schema.brand("OrgId"));
export type OrgId = typeof OrgId.Type;

export const OrgSlug = Schema.String.pipe(
  Schema.minLength(3),
  Schema.pattern(/[a-z0-9-]+$/),
  Schema.brand("OrgSlug"),
);
export type OrgSlug = typeof OrgSlug.Type;

export class Actor extends Context.Tag("Actor")<
  Actor,
  {
    memberId: MemberId;
    orgId: OrgId;
  }
>() {}
