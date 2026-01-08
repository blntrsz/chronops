import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Workflow } from "@chronops/domain";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";

import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";

export class WorkflowContract extends RpcGroup.make(
  Rpc.make("WorkflowById", {
    success: Schema.Option(Workflow.Workflow),
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Workflow.WorkflowId,
  }),
  Rpc.make("WorkflowList", {
    success: Schema.Array(Workflow.Workflow),
    payload: Pagination,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
  }),
  Rpc.make("WorkflowTransition", {
    success: Workflow.Workflow,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Workflow.WorkflowNotFoundError,
      Workflow.WorkflowInvalidTransitionError,
    ),
    payload: {
      id: Workflow.WorkflowId,
      event: Schema.String,
    },
  }),
).middleware(AuthMiddleware) {}
