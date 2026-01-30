import { RpcGroup } from "@effect/rpc";
import { CommentContract } from "./comment/contract";
import { ControlContract } from "./control/contract";
import { DocumentContract } from "./document/contract";
import { FrameworkContract } from "./framework/contract";
import { QuestionerContract } from "./questioner/contract";
import { RpcLogger } from "./logger";
import { TagContract } from "./tag/contract";

export class RpcContract extends RpcGroup.make()
  .merge(FrameworkContract)
  .merge(ControlContract)
  .merge(DocumentContract)
  .merge(CommentContract)
  .merge(TagContract)
  .merge(QuestionerContract)
  .middleware(RpcLogger) {}
