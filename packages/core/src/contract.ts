import { RpcGroup } from "@effect/rpc";
import { FrameworkContract } from "./framework/contract";
import { ControlContract } from "./control/contract";
import { DocumentContract } from "./document/contract";
import { WorkflowContract } from "./workflow/contract";
import { RpcLogger } from "./logger";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(DocumentContract)
  .merge(WorkflowContract)
  .middleware(RpcLogger) {}
