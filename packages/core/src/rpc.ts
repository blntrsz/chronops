import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer, Logger } from "effect";
import { FrameworkHandler } from "./framework/handler";
import { FrameworkService } from "./framework/service";
import { ControlHandler } from "./control/handler";
import { ControlService } from "./control/service";
import { DocumentHandler } from "./document/handler";
import { DocumentService } from "./document/service";
import { WorkflowHandler } from "./workflow/handler";
import { HttpLayerRouter } from "@effect/platform";
import { Base } from "@chronops/domain";
import { SqlLayer } from "./common/sql";
import { RpcContract } from "./contract";
import { AuthMiddlewareLive } from "./auth/middleware";

const HandlersLayer = Layer.mergeAll(
  FrameworkHandler,
  ControlHandler,
  DocumentHandler,
  WorkflowHandler,
).pipe(
  Layer.provide(FrameworkService.Default),
  Layer.provide(ControlService.Default),
  Layer.provide(DocumentService.Default),
  Layer.provide(SqlLayer),
  Layer.provide(Layer.succeed(Base.ULID, Base.ULIDLayer)),
);

const RpcRouter = RpcServer.layerHttpRouter({
  group: RpcContract,
  path: "/api/rpc",
  protocol: "http",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(AuthMiddlewareLive),
  Layer.provide(RpcSerialization.layerNdjson),
);

const AllRoutes = Layer.mergeAll(RpcRouter).pipe(Layer.provide(Logger.pretty));

export const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes);
