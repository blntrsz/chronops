import { Actor } from "@chronops/domain";
import { RpcMiddleware } from "@effect/rpc";
import { Schema } from "effect";

// --- Auth Errors ---

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.optionalWith(Schema.String, {
      default: () => "Unauthorized",
    }),
  },
) {}

export class NoActiveOrganization extends Schema.TaggedError<NoActiveOrganization>()(
  "NoActiveOrganization",
  {
    message: Schema.optionalWith(Schema.String, {
      default: () => "No active organization selected",
    }),
  },
) {}

export class MemberNotFound extends Schema.TaggedError<MemberNotFound>()(
  "MemberNotFound",
  {
    message: Schema.optionalWith(Schema.String, {
      default: () => "Member not found in organization",
    }),
  },
) {}

export const AuthError = Schema.Union(
  Unauthorized,
  NoActiveOrganization,
  MemberNotFound,
);
export type AuthError = typeof AuthError.Type;

export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    provides: Actor.Actor,
    failure: AuthError,
    requiredForClient: false,
  },
) {}
