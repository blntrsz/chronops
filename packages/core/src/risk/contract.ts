import { Control, Risk } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";
import { DatabaseError } from "../db-error";
import { Paginated } from "../common/pagination";

export class RiskContract extends RpcGroup.make(
  Rpc.make("RiskCreate", {
    success: Risk.Risk,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: Risk.CreateRisk,
  }),
  Rpc.make("RiskById", {
    success: Risk.Risk,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Risk.RiskNotFoundError),
    payload: { id: Risk.RiskId },
  }),
  Rpc.make("RiskList", {
    success: Paginated(Risk.Risk),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          controlId: Schema.optional(Control.ControlId),
          status: Schema.optional(Risk.RiskStatus),
          likelihood: Schema.optional(Risk.RiskLikelihood),
          impact: Schema.optional(Risk.RiskImpact),
          treatment: Schema.optional(Risk.RiskTreatment),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("RiskUpdate", {
    success: Risk.Risk,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Risk.RiskNotFoundError),
    payload: {
      id: Risk.RiskId,
      data: Risk.UpdateRisk,
    },
  }),
  Rpc.make("RiskRemove", {
    success: Schema.Void,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError), Risk.RiskNotFoundError),
    payload: { id: Risk.RiskId },
  }),
).middleware(AuthMiddleware) {}
