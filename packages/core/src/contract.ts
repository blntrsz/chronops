import { RpcGroup } from "@effect/rpc";
import { FrameworkContract } from "./framework/contract";
import { ComplianceContract } from "./compliance/contract";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ComplianceContract) {}
