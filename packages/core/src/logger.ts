import { RpcMiddleware } from "@effect/rpc";
import { Effect, Exit, Layer } from "effect";

export class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()("RpcLogger", {
  wrap: true,
  optional: true,
}) {}
export const RpcLoggerLayer = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: () => exit,
        onFailure: (cause) =>
          Effect.zipRight(
            Effect.annotateLogs(Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause), {
              "rpc.method": opts.rpc._tag,
              "rpc.clientId": opts.clientId,
            }),
            exit,
          ),
      }),
    ),
  ),
);
