import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer, Logger } from "effect";
import { FrameworkHandler } from "./framework/handler";
import { FrameworkService } from "./framework/service";
import { ComplianceHandler } from "./compliance/handler";
import { ComplianceService } from "./compliance/service";
import { HttpLayerRouter } from "@effect/platform";
import { Base } from "@chronops/domain";
import { SqlLayer } from "./common/sql";
import { RpcContract } from "./contract";

const RpcRouter = RpcServer.layerHttpRouter({
  group: RpcContract,
  path: "/api/rpc",
  protocol: "http",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(FrameworkHandler),
  Layer.provide(ComplianceHandler),
  Layer.provide(FrameworkService.Default),
  Layer.provide(ComplianceService.Default),
  Layer.provide(Layer.succeed(Base.ULID, Base.ULIDLayer)),
  Layer.provide(SqlLayer),
  Layer.provide(RpcSerialization.layerNdjson),
);

const AllRoutes = Layer.mergeAll(RpcRouter).pipe(Layer.provide(Logger.pretty));

export const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes);
