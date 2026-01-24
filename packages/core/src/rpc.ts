import { Base } from "@chronops/domain";
import { HttpLayerRouter } from "@effect/platform";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer, Logger } from "effect";
import { AuthMiddlewareLive } from "./auth/middleware";
import { CommentHandler } from "./comment/handler";
import { CommentService } from "./comment/service";
import { SqlLayer } from "./common/sql";
import { RpcContract } from "./contract";
import { ControlHandler } from "./control/handler";
import { ControlService } from "./control/service";
import { DocumentHandler } from "./document/handler";
import { DocumentService } from "./document/service";
import { FrameworkHandler } from "./framework/handler";
import { FrameworkService } from "./framework/service";
import { RpcLoggerLayer } from "./logger";

const HandlersLayer = Layer.mergeAll(
  FrameworkHandler,
  ControlHandler,
  DocumentHandler,
  CommentHandler,
).pipe(
  Layer.provide(FrameworkService.Default),
  Layer.provide(ControlService.Default),
  Layer.provide(DocumentService.Default),
  Layer.provide(CommentService.Default),
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
  Layer.provide(RpcLoggerLayer),
  Layer.provide(RpcSerialization.layerNdjson),
);

const AllRoutes = Layer.mergeAll(RpcRouter).pipe(Layer.provide(Logger.pretty));

export const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes);
