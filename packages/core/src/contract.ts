import { RpcGroup } from "@effect/rpc";
import { FrameworkContract } from "./framework/contract";
import { ControlContract } from "./control/contract";
import { DocumentContract } from "./document/contract";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(DocumentContract) {}
