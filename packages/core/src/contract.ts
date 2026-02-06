import { RpcGroup } from "@effect/rpc";
import { CommentContract } from "./comment/contract";
import { ControlContract } from "./control/contract";
import { FrameworkContract } from "./framework/contract";
import { PdfContract } from "./pdf/contract";
import { RpcLogger } from "./logger";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(CommentContract)
  .merge(PdfContract)
  .middleware(RpcLogger) {}
