import { RpcMiddleware } from "@effect/rpc";
import { Effect, Layer, Schema } from "effect";
import { Actor, MemberId, OrgId } from "@chronops/domain/actor";
import { auth } from "./server";

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

// --- Auth Middleware ---

export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    provides: Actor,
    failure: AuthError,
    requiredForClient: false,
  },
) {}

export const AuthMiddlewareLive = Layer.effect(
  AuthMiddleware,
  Effect.succeed(
    AuthMiddleware.of(({ headers }) =>
      Effect.gen(function* () {
        // 1. Validate session
        const session = yield* Effect.tryPromise({
          try: () => auth.api.getSession({ headers }),
          catch: () =>
            new Unauthorized({ message: "Failed to validate session" }),
        });

        if (!session) {
          return yield* Effect.fail(
            new Unauthorized({ message: "No valid session" }),
          );
        }

        // 2. Check for active organization
        const activeOrgId = session.session.activeOrganizationId;
        if (!activeOrgId) {
          return yield* new NoActiveOrganization();
        }

        // 3. Get active member
        const member = yield* Effect.tryPromise({
          try: () => auth.api.getActiveMember({ headers }),
          catch: () => new MemberNotFound(),
        });

        if (!member) {
          return yield* new MemberNotFound();
        }

        // 4. Return Actor
        return {
          memberId: MemberId.make(member.id),
          orgId: OrgId.make(activeOrgId),
        };
      }),
    ),
  ),
);
