import { Base } from "@chronops/domain";
import { HttpLayerRouter } from "@effect/platform";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer, Logger } from "effect";
import { AuthMiddlewareLive } from "./auth/middleware";
import { CommentHandler } from "./comment/handler";
import { CommentService } from "./comment/service";
import { RpcContract } from "./contract";
import { ControlHandler } from "./control/handler";
import { ControlService } from "./control/service";
import { FrameworkHandler } from "./framework/handler";
import { FrameworkService } from "./framework/service";
import { PdfHandler } from "./pdf/handler";
import { PdfService } from "./pdf/service";
import { PdfPageService } from "./pdf-page/service";
import { StorageService } from "./storage/service";
import { RpcLoggerLayer } from "./logger";
import { Database } from "./db";
import { S3 } from "@effect-aws/client-s3";

const HandlersLayer = Layer.mergeAll(FrameworkHandler, ControlHandler, CommentHandler, PdfHandler).pipe(
  Layer.provide(FrameworkService.Default),
  Layer.provide(ControlService.Default),
  Layer.provide(CommentService.Default),
  Layer.provide(PdfService.Default),
  Layer.provide(PdfPageService.Default),
  Layer.provide(StorageService.Default),
  Layer.provide(Database.Default),
  Layer.provide(S3.defaultLayer),
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
