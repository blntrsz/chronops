import { Rpc, RpcGroup } from "@effect/rpc";
import { Document } from "@chronops/domain";
import { Schema } from "effect";
import { SqlError } from "@effect/sql";
import { ParseError } from "effect/ParseResult";
import { Pagination } from "../common/repository";
import { AuthMiddleware } from "../auth/middleware";

export class DocumentContract extends RpcGroup.make(
  Rpc.make("DocumentCreate", {
    success: Document.Document,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Document.CreateDocument,
  }),
  Rpc.make("DocumentById", {
    success: Schema.Option(Document.Document),
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Document.DocumentId,
  }),
  Rpc.make("DocumentList", {
    success: Schema.Array(Document.Document),
    payload: Pagination,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
  }),
  Rpc.make("DocumentUpdate", {
    success: Document.Document,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Document.DocumentNotFoundError,
    ),
    payload: {
      id: Document.DocumentId,
      data: Document.UpdateDocument,
    },
  }),
  Rpc.make("DocumentRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Document.DocumentNotFoundError,
    ),
    payload: Document.DocumentId,
  }),
  Rpc.make("DocumentCount", {
    success: Schema.Number,
    payload: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
  }),
).middleware(AuthMiddleware) {}
