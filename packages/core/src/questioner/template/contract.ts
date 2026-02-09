import { QuestionerTemplate, QuestionerErrors } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../../auth/middleware-interface";
import { Pagination } from "../../common/repository";
import { DatabaseError } from "../../db-error";
import { Paginated } from "../../common/pagination";

export class QuestionerTemplateContract extends RpcGroup.make(
  Rpc.make("QuestionerTemplateCreate", {
    success: QuestionerTemplate.QuestionerTemplate,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerErrors.QuestionerInvalidQuestionError,
    ),
    payload: QuestionerTemplate.CreateQuestionerTemplate,
  }),
  Rpc.make("QuestionerTemplateById", {
    success: QuestionerTemplate.QuestionerTemplate,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerTemplate.QuestionerTemplateNotFoundError,
      QuestionerErrors.QuestionerInvalidQuestionError,
    ),
    payload: { id: QuestionerTemplate.QuestionerTemplateId },
  }),
  Rpc.make("QuestionerTemplateList", {
    success: Paginated(QuestionerTemplate.QuestionerTemplate),
    payload: Pagination,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("QuestionerTemplateUpdate", {
    success: QuestionerTemplate.QuestionerTemplate,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerTemplate.QuestionerTemplateNotFoundError,
      QuestionerErrors.QuestionerInvalidQuestionError,
    ),
    payload: {
      id: QuestionerTemplate.QuestionerTemplateId,
      data: QuestionerTemplate.UpdateQuestionerTemplate,
    },
  }),
  Rpc.make("QuestionerTemplateRemove", {
    success: Schema.Void,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      QuestionerTemplate.QuestionerTemplateNotFoundError,
    ),
    payload: { id: QuestionerTemplate.QuestionerTemplateId },
  }),
).middleware(AuthMiddleware) {}
