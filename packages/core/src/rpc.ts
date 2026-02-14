import { HttpLayerRouter } from "@effect/platform";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Layer, Logger } from "effect";
import { AuthMiddlewareLive } from "./auth/middleware";
import { CommentHandler } from "./comment";
import { RpcContract } from "./contract";
import { ControlHandler } from "./control";
import { EvidenceHandler } from "./evidence";
import { EventHandler } from "./event";
import { FrameworkHandler } from "./framework";
import { IssueHandler } from "./issue";
import { PolicyHandler } from "./policy";
import { PdfHandler } from "./pdf";
import { RiskHandler } from "./risk";
import { RpcLoggerLayer } from "./logger";
import { AssessmentHandler } from "./assessment";
import { AuditHandler } from "./audit";
import { QuestionerHandler } from "./questioner";
import { Base } from "@chronops/domain";

const HandlersLayer = Layer.mergeAll(
  FrameworkHandler,
  ControlHandler,
  EvidenceHandler,
  EventHandler,
  CommentHandler,
  // PdfHandler,
  IssueHandler,
  PolicyHandler,
  AssessmentHandler,
  RiskHandler,
  AuditHandler,
  QuestionerHandler,
).pipe(Layer.provide(Base.ULID.Default));

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

const AllRoutes = Logger.pretty.pipe(Layer.provideMerge(RpcRouter));

export const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes);
