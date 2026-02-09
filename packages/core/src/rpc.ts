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
import { EvidenceHandler } from "./evidence/handler";
import { EvidenceService } from "./evidence/service";
import { EventHandler } from "./event/handler";
import { EventService } from "./common/service/event-service";
import { FrameworkHandler } from "./framework/handler";
import { FrameworkService } from "./framework/service";
import { IssueHandler } from "./issue/handler";
import { IssueService } from "./issue/service";
import { PolicyHandler } from "./policy/handler";
import { PolicyService } from "./policy/service";
import { PdfHandler } from "./pdf/handler";
import { PdfService } from "./pdf/service";
import { PdfPageService } from "./pdf-page/service";
import { RiskHandler } from "./risk/handler";
import { RiskService } from "./risk/service";
import { StorageService } from "./storage/service";
import { RpcLoggerLayer } from "./logger";
import { Database } from "./db";
import { AssessmentTemplateHandler } from "./assessment/template/handler";
import { AssessmentTemplateService } from "./assessment/template/service";
import { AssessmentInstanceHandler } from "./assessment/instance/handler";
import { AssessmentInstanceService } from "./assessment/instance/service";
import { AuditHandler } from "./audit/handler";
import { AuditService } from "./audit/service";
// import { S3 } from "@effect-aws/client-s3";

const HandlersLayer = Layer.mergeAll(
  FrameworkHandler,
  ControlHandler,
  EvidenceHandler,
  EventHandler,
  CommentHandler,
  PdfHandler,
  IssueHandler,
  PolicyHandler,
  AssessmentTemplateHandler,
  AssessmentInstanceHandler,
  RiskHandler,
  AuditHandler,
).pipe(
  Layer.provide(FrameworkService.Default),
  Layer.provide(ControlService.Default),
  Layer.provide(EvidenceService.Default),
  Layer.provide(EventService.Default),
  Layer.provide(CommentService.Default),
  Layer.provide(PdfService.Default),
  Layer.provide(IssueService.Default),
  Layer.provide(PolicyService.Default),
  Layer.provide(PdfPageService.Default),
  Layer.provide(AssessmentTemplateService.Default),
  Layer.provide(AssessmentInstanceService.Default),
  Layer.provide(RiskService.Default),
  Layer.provide(AuditService.Default),
  Layer.provide(StorageService.Default),
  Layer.provide(Database.Default),
  // TODO: Configure S3 client
  // Layer.provide(S3.defaultLayer),
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

const AllRoutes = RpcRouter.pipe(Layer.provide(Logger.pretty));

export const { handler, dispose } = HttpLayerRouter.toWebHandler(AllRoutes as any);
