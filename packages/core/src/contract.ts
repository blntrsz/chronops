import { RpcGroup } from "@effect/rpc";
import { CommentContract } from "./comment/contract";
import { ControlContract } from "./control/contract";
import { EvidenceContract } from "./evidence/contract";
import { EventContract } from "./event/contract";
import { FrameworkContract } from "./framework/contract";
import { IssueContract } from "./issue/contract";
import { PolicyContract } from "./policy/contract";
import { PdfContract } from "./pdf/contract";
import { AssessmentTemplateContract } from "./assessment/template/contract";
import { AssessmentInstanceContract } from "./assessment/instance/contract";
import { RiskContract } from "./risk/contract";
import { AuditContract } from "./audit/contract";
import { QuestionerTemplateContract } from "./questioner/template/contract";
import { QuestionerInstanceContract } from "./questioner/instance/contract";
import { RpcLogger } from "./logger";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(EvidenceContract)
  .merge(EventContract)
  .merge(CommentContract)
  .merge(PdfContract)
  .merge(IssueContract)
  .merge(PolicyContract)
  .merge(AssessmentTemplateContract)
  .merge(AssessmentInstanceContract)
  .merge(RiskContract)
  .merge(AuditContract)
  .merge(QuestionerTemplateContract)
  .merge(QuestionerInstanceContract)
  .middleware(RpcLogger) {}
