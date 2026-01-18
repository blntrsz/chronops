import { Actor } from "@chronops/domain";
import { Effect, Layer } from "effect";
import {
  AuthMiddleware,
  MemberNotFound,
  NoActiveOrganization,
  Unauthorized,
} from "./middleware-interface";
import { auth } from "./server";

export const AuthMiddlewareLive = Layer.effect(
  AuthMiddleware,
  Effect.succeed(
    AuthMiddleware.of(({ headers }) =>
      Effect.gen(function* () {
        // 1. Validate session
        const session = yield* Effect.tryPromise({
          try: () => auth.api.getSession({ headers }),
          catch: () => new Unauthorized({ message: "Failed to validate session" }),
        });

        if (!session) {
          return yield* Effect.fail(new Unauthorized({ message: "No valid session" }));
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
          memberId: Actor.MemberId.make(member.id),
          orgId: Actor.OrgId.make(activeOrgId),
        };
      }),
    ),
  ),
);
