import { RpcGroup } from "@effect/rpc";
import { FrameworkContract } from "./framework/contract";
import { ControlContract } from "./control/contract";

export class RpcContract extends RpcGroup.make().merge(FrameworkContract).merge(ControlContract) {}
