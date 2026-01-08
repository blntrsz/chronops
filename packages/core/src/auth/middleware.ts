import { Effect, Layer } from "effect";
import { MemberId, OrgId } from "@chronops/domain/actor";
import { auth } from "./server";
import {
  AuthMiddleware,
  MemberNotFound,
  NoActiveOrganization,
  Unauthorized,
} from "./middleware-interface";

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
