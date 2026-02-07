import { AssessmentTemplate, Control } from "@chronops/domain";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";
import { AuthMiddleware } from "../../auth/middleware-interface";
import { Pagination } from "../../common/repository";
import { DatabaseError } from "../../db-error";
import { Paginated } from "../../common/pagination";

export class AssessmentTemplateContract extends RpcGroup.make(
  Rpc.make("AssessmentTemplateCreate", {
    success: AssessmentTemplate.AssessmentTemplate,
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
    payload: AssessmentTemplate.CreateAssessmentTemplate,
  }),
  Rpc.make("AssessmentTemplateById", {
    success: AssessmentTemplate.AssessmentTemplate,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      AssessmentTemplate.AssessmentTemplateNotFoundError,
    ),
    payload: { id: AssessmentTemplate.AssessmentTemplateId },
  }),
  Rpc.make("AssessmentTemplateList", {
    success: Paginated(AssessmentTemplate.AssessmentTemplate),
    payload: Pagination.pipe(
      Schema.extend(
        Schema.Struct({
          controlId: Schema.optional(Control.ControlId),
        }),
      ),
    ),
    error: Schema.Union(DatabaseError, Schema.instanceOf(ParseError)),
  }),
  Rpc.make("AssessmentTemplateUpdate", {
    success: AssessmentTemplate.AssessmentTemplate,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      AssessmentTemplate.AssessmentTemplateNotFoundError,
    ),
    payload: {
      id: AssessmentTemplate.AssessmentTemplateId,
      data: AssessmentTemplate.UpdateAssessmentTemplate,
    },
  }),
  Rpc.make("AssessmentTemplateRemove", {
    success: Schema.Void,
    error: Schema.Union(
      DatabaseError,
      Schema.instanceOf(ParseError),
      AssessmentTemplate.AssessmentTemplateNotFoundError,
    ),
    payload: { id: AssessmentTemplate.AssessmentTemplateId },
  }),
).middleware(AuthMiddleware) {}
