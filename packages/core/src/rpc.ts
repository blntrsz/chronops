import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer, Logger } from "effect";
import { FrameworkContract } from "./framework/contract";
import { FrameworkHandler } from "./framework/handler";
import { FrameworkService } from "./framework/service";
import { HttpLayerRouter } from "@effect/platform";
import { ULID, ULIDLayer } from "@chronops/domain";
import { SqlLayer } from "./common/sql";

const RpcRouter = RpcServer.layerHttpRouter({
  group: FrameworkContract,
  path: "/api/rpc",
  protocol: "http",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(FrameworkHandler),
  Layer.provide(FrameworkService.Default),
  Layer.provide(Layer.succeed(ULID, ULIDLayer)),
  Layer.provide(SqlLayer),
  Layer.provide(RpcSerialization.layerNdjson),
);

const AllRoutes = Layer.mergeAll(RpcRouter).pipe(Layer.provide(Logger.pretty));

export const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes);
