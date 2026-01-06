import { RpcGroup } from "@effect/rpc";
import { FrameworkContract } from "./framework/contract";
import { ControlContract } from "./control/contract";
import { DocumentContract } from "./document/contract";
import { WorkflowContract } from "./workflow/contract";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(DocumentContract)
  .merge(WorkflowContract) {}
