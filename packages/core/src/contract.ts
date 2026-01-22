import { RpcGroup } from "@effect/rpc";
import { ControlContract } from "./control/contract";
import { DocumentContract } from "./document/contract";
import { FrameworkContract } from "./framework/contract";
import { RpcLogger } from "./logger";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(DocumentContract)
  .middleware(RpcLogger) {}
