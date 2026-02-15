import * as Schema from "effect/Schema";
import { FrameworkId, SemVer, WorkflowStatus } from "./framework";

/**
 * Framework summary with aggregated stats
 * @since 1.0.0
 * @category models
 */
export class FrameworkSummary extends Schema.Class<FrameworkSummary>("FrameworkSummary")({
  id: FrameworkId,
  name: Schema.String,
  version: Schema.NullOr(SemVer),
  status: WorkflowStatus,
  description: Schema.NullOr(Schema.String),
  totalControls: Schema.Number,
  activeControls: Schema.Number,
  completionPct: Schema.Number,
  unmanagedRisks: Schema.Number,
  openIssues: Schema.Number,
  linkedAudits: Schema.Number,
  hasUpcomingAudit: Schema.Boolean,
}) {}
