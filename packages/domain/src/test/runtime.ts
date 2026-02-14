import { Clock, ManagedRuntime } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Actor from "../actor";
import * as Base from "../base";

const fixedMillis = Date.parse("2024-01-01T00:00:00.000Z");
const fixedNanos = BigInt(fixedMillis) * BigInt(1_000_000);

const fixedClock: Clock.Clock = {
  [Clock.ClockTypeId]: Clock.ClockTypeId,
  unsafeCurrentTimeMillis: () => fixedMillis,
  currentTimeMillis: Effect.succeed(fixedMillis),
  unsafeCurrentTimeNanos: () => fixedNanos,
  currentTimeNanos: Effect.succeed(fixedNanos),
  sleep: () => Effect.succeed(undefined),
};

export const snapshot = <A>(value: A) => JSON.parse(JSON.stringify(value));

export const makeTestRuntime = () => {
  let sequence = 0;
  const createId = () => `01TEST${String(sequence++).padStart(3, "0")}`;

  const TestRuntime = ManagedRuntime.make(
    Layer.mergeAll(
      Base.ULID.Default,
      Layer.succeed(Actor.Actor, {
        memberId: Actor.MemberId.make("mem_1"),
        orgId: Actor.OrgId.make("org_1"),
      }),
    ),
  );

  const runTest = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.provide(Effect.withClock(effect, fixedClock), TestRuntime);

  return { createId, runTest };
};
