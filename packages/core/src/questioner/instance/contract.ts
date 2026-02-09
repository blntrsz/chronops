import { QuestionerInstance, QuestionerTemplate, Workflow } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../../auth/middleware-interface";
import { Pagination } from "../../common/repository";
import { DatabaseError } from "../../db-error";
import { Paginated } from "../../common/pagination";

export class QuestionerInstanceContract extends RpcGroup.make(
  Rpc.make("QuestionerInstanceCreate", {
    success: QuestionerInstance.QuestionerInstance,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: QuestionerInstance.CreateQuestionerInstance,
  }),
  Rpc.make("QuestionerInstanceById", {
    success: QuestionerInstance.QuestionerInstance,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerInstance.QuestionerInstanceNotFoundError,
    ),
    payload: { id: QuestionerInstance.QuestionerInstanceId },
  }),
  Rpc.make("QuestionerInstanceList", {
    success: Paginated(QuestionerInstance.QuestionerInstance),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          templateId: Schema.optional(QuestionerTemplate.QuestionerTemplateId),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("QuestionerInstanceUpdate", {
    success: QuestionerInstance.QuestionerInstance,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerInstance.QuestionerInstanceNotFoundError,
      Workflow.InvalidState,
      Workflow.InvalidEvent,
      Workflow.InvalidTemplate,
    ),
    payload: {
      id: QuestionerInstance.QuestionerInstanceId,
      data: QuestionerInstance.UpdateQuestionerInstance,
    },
  }),
  Rpc.make("QuestionerInstanceRemove", {
    success: Schema.Void,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerInstance.QuestionerInstanceNotFoundError,
    ),
    payload: { id: QuestionerInstance.QuestionerInstanceId },
  }),
  Rpc.make("QuestionerInstanceSubmit", {
    success: QuestionerInstance.QuestionerInstance,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerInstance.QuestionerInstanceNotFoundError,
      Workflow.InvalidState,
      Workflow.InvalidEvent,
      Workflow.InvalidTemplate,
    ),
    payload: { id: QuestionerInstance.QuestionerInstanceId },
  }),
).middleware(AuthMiddleware) {}
