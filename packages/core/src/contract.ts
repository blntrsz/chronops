import { RpcGroup } from "@effect/rpc";
import { CommentContract } from "./comment/contract";
import { ControlContract } from "./control/contract";
import { EvidenceContract } from "./evidence/contract";
import { FrameworkContract } from "./framework/contract";
import { IssueContract } from "./issue/contract";
import { PdfContract } from "./pdf/contract";
import { AssessmentTemplateContract } from "./assessment/template/contract";
import { AssessmentInstanceContract } from "./assessment/instance/contract";
import { RiskContract } from "./risk/contract";
import { RpcLogger } from "./logger";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(EvidenceContract)
  .merge(CommentContract)
  .merge(PdfContract)
  .merge(IssueContract)
  .merge(AssessmentTemplateContract)
  .merge(AssessmentInstanceContract)
  .merge(RiskContract)
  .middleware(RpcLogger) {}
