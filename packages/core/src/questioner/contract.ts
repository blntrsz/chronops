import { Questioner } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";

export const EntityId = Schema.String.pipe(Schema.brand("EntityId"));
export type EntityId = typeof EntityId.Type;

export const EntityType = Schema.String.pipe(Schema.brand("EntityType"));
export type EntityType = typeof EntityType.Type;

export class QuestionerContract extends RpcGroup.make(
  // Questioner CRUD
  Rpc.make("QuestionerCreate", {
    success: Questioner.Questioner,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: Questioner.CreateQuestioner,
  }),
  Rpc.make("QuestionerById", {
    success: Schema.Option(Questioner.Questioner),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Questioner.QuestionerId },
  }),
  Rpc.make("QuestionerList", {
    success: Schema.Array(Questioner.Questioner),
    payload: Pagination,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("QuestionerUpdate", {
    success: Questioner.Questioner,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Questioner.QuestionerNotFoundError,
    ),
    payload: {
      id: Questioner.QuestionerId,
      data: Questioner.UpdateQuestioner,
    },
  }),
  Rpc.make("QuestionerRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Questioner.QuestionerNotFoundError,
    ),
    payload: { id: Questioner.QuestionerId },
  }),

  // Questioner Response operations
  Rpc.make("QuestionerResponseCreate", {
    success: Questioner.QuestionerResponse,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: Questioner.CreateQuestionerResponse,
  }),
  Rpc.make("QuestionerResponseById", {
    success: Schema.Option(Questioner.QuestionerResponse),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Questioner.QuestionerResponseId },
  }),
  Rpc.make("QuestionerResponseList", {
    success: Schema.Array(Questioner.QuestionerResponse),
    payload: Schema.Struct({
      questionerId: Schema.optional(Questioner.QuestionerId),
      entityId: Schema.optional(EntityId),
      status: Schema.optional(Questioner.ResponseStatus),
      ...Pagination.fields,
    }),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("QuestionerResponseUpdate", {
    success: Questioner.QuestionerResponse,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Questioner.QuestionerResponseNotFoundError,
    ),
    payload: {
      id: Questioner.QuestionerResponseId,
      data: Questioner.UpdateQuestionerResponse,
    },
  }),
  Rpc.make("QuestionerResponseSubmit", {
    success: Questioner.QuestionerResponse,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Questioner.QuestionerResponseNotFoundError,
    ),
    payload: { id: Questioner.QuestionerResponseId },
  }),
  Rpc.make("QuestionerResponseReview", {
    success: Questioner.QuestionerResponse,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Questioner.QuestionerResponseNotFoundError,
    ),
    payload: {
      id: Questioner.QuestionerResponseId,
      score: Schema.Number,
      reviewNotes: Schema.optional(Schema.NullOr(Schema.String)),
    },
  }),
  Rpc.make("QuestionerResponseRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Questioner.QuestionerResponseNotFoundError,
    ),
    payload: { id: Questioner.QuestionerResponseId },
  }),
).middleware(AuthMiddleware) {}
