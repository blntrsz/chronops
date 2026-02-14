import { RpcGroup } from "@effect/rpc";
import { CommentContract } from "./comment/contract";
import { ControlContract } from "./control/contract";
import { EvidenceContract } from "./evidence/contract";
import { EventContract } from "./event/contract";
import { FrameworkContract } from "./framework/contract";
import { IssueContract } from "./issue/contract";
import { PdfContract } from "./pdf/contract";
import { PolicyContract } from "./policy/contract";
import { AssessmentContract } from "./assessment/contract";
import { RiskContract } from "./risk/contract";
import { AuditContract } from "./audit/contract";
import { QuestionerContract } from "./questioner/contract";
import { RpcLogger } from "./logger";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(EvidenceContract)
  .merge(EventContract)
  .merge(CommentContract)
  // .merge(PdfContract)
  .merge(IssueContract)
  .merge(PolicyContract)
  .merge(AssessmentContract)
  .merge(RiskContract)
  .merge(AuditContract)
  .merge(QuestionerContract)
  .middleware(RpcLogger) {}
