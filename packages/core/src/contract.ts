import { RpcGroup } from "@effect/rpc";
import { FrameworkContract } from "./framework/contract";

export class RpcContract extends RpcGroup.make().merge(FrameworkContract) {}
