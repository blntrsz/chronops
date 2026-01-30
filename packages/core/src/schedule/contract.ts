import { Schedule } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { SqlError } from "@effect/sql";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../auth/middleware-interface";
import { Pagination } from "../common/repository";

export class ScheduleContract extends RpcGroup.make(
  // Schedule CRUD
  Rpc.make("ScheduleCreate", {
    success: Schedule.Schedule,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.InvalidCronError,
    ),
    payload: Schedule.CreateSchedule,
  }),
  Rpc.make("ScheduleById", {
    success: Schema.Option(Schedule.Schedule),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Schedule.ScheduleId },
  }),
  Rpc.make("ScheduleList", {
    success: Schema.Array(Schedule.Schedule),
    payload: Pagination,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("ScheduleUpdate", {
    success: Schedule.Schedule,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleNotFoundError,
      Schedule.InvalidCronError,
    ),
    payload: {
      id: Schedule.ScheduleId,
      data: Schedule.UpdateSchedule,
    },
  }),
  Rpc.make("ScheduleRemove", {
    success: Schema.Void,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleNotFoundError,
    ),
    payload: { id: Schedule.ScheduleId },
  }),

  // Schedule lifecycle
  Rpc.make("SchedulePause", {
    success: Schedule.Schedule,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleNotFoundError,
    ),
    payload: { id: Schedule.ScheduleId },
  }),
  Rpc.make("ScheduleResume", {
    success: Schedule.Schedule,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleNotFoundError,
    ),
    payload: { id: Schedule.ScheduleId },
  }),
  Rpc.make("ScheduleListReadyToRun", {
    success: Schema.Array(Schedule.Schedule),
    payload: Schema.Struct({}),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),

  // Schedule History
  Rpc.make("ScheduleHistoryCreate", {
    success: Schedule.ScheduleHistory,
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: Schedule.CreateScheduleHistory,
  }),
  Rpc.make("ScheduleHistoryById", {
    success: Schema.Option(Schedule.ScheduleHistory),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
    payload: { id: Schedule.ScheduleHistoryId },
  }),
  Rpc.make("ScheduleHistoryList", {
    success: Schema.Array(Schedule.ScheduleHistory),
    payload: Schema.Struct({
      scheduleId: Schema.optional(Schedule.ScheduleId),
      status: Schema.optional(Schedule.HistoryStatus),
      ...Pagination.fields,
    }),
    error: Schema.Union(Schema.instanceOf(SqlError.SqlError), Schema.instanceOf(ParseError)),
  }),
  Rpc.make("ScheduleHistoryUpdate", {
    success: Schedule.ScheduleHistory,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleHistoryNotFoundError,
    ),
    payload: {
      id: Schedule.ScheduleHistoryId,
      data: Schedule.UpdateScheduleHistory,
    },
  }),
  Rpc.make("ScheduleHistoryComplete", {
    success: Schedule.ScheduleHistory,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleHistoryNotFoundError,
    ),
    payload: {
      id: Schedule.ScheduleHistoryId,
      result: Schema.optional(Schema.String),
    },
  }),
  Rpc.make("ScheduleHistoryFail", {
    success: Schedule.ScheduleHistory,
    error: Schema.Union(
      Schema.instanceOf(SqlError.SqlError),
      Schema.instanceOf(ParseError),
      Schedule.ScheduleHistoryNotFoundError,
    ),
    payload: {
      id: Schedule.ScheduleHistoryId,
      errorMessage: Schema.String,
    },
  }),
).middleware(AuthMiddleware) {}
