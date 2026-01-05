import { Rpc, RpcGroup } from "@effect/rpc";
import { Compliance } from "@chronops/domain";
import { Schema } from "effect";
import { SqlError } from "@effect/sql";
import { ParseError } from "effect/ParseResult";
import { Pagination } from "../common/repository";

export class ComplianceContract extends RpcGroup.make(
  Rpc.make("ComplianceCreate", {
    success: Compliance.Compliance,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Compliance.CreateCompliance,
  }),
  Rpc.make("ComplianceById", {
    success: Schema.Option(Compliance.Compliance),
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Compliance.ComplianceId,
  }),
  Rpc.make("ComplianceList", {
    success: Schema.Array(Compliance.Compliance),
    payload: Pagination,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
  }),
  Rpc.make("ComplianceUpdate", {
    success: Schema.Option(Compliance.Compliance),
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: {
      id: Compliance.ComplianceId,
      data: Compliance.UpdateCompliance,
    },
  }),
  Rpc.make("ComplianceDestroy", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
    ),
    payload: Compliance.ComplianceId,
  }),
) {}
