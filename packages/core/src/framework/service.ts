import {
  Actor,
  Audit,
  Base,
  EntityType,
  Event,
  Framework,
  FrameworkSummary,
} from "@chronops/domain";
import { ULID } from "@chronops/domain/src/base";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { DateTime, Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";
import { TicketService } from "../ticket/service";

export class FrameworkService extends Effect.Service<FrameworkService>()("FrameworkService", {
  dependencies: [ULID.Default, Database.Default, EventService.Default, TicketService.Default],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    const normalizeVersion = (version: unknown): Framework.SemVer | null => {
      if (typeof version !== "string") {
        return null;
      }
      const trimmed = version.trim();
      if (!trimmed) {
        return null;
      }
      const candidate = /^\d+$/.test(trimmed)
        ? `${trimmed}.0.0`
        : /^\d+\.\d+$/.test(trimmed)
          ? `${trimmed}.0`
          : trimmed;
      const parsed = Schema.decodeUnknownEither(Framework.SemVer)(candidate);
      if (parsed._tag === "Left") {
        return null;
      }
      return parsed.right;
    };

    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Framework.FrameworkId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.framework.findFirst({
          where: and(
            eq(tables.framework.id, id),
            eq(tables.framework.orgId, actor.orgId),
            isNull(tables.framework.deletedAt),
          ),
        }),
      );
      if (!model) {
        throw yield* Framework.FrameworkNotFoundError.fromId(id);
      }

      return Framework.Framework.make({
        ...model,
        version: normalizeVersion(model.version),
      });
    });

    const list = Effect.fn(function* (pagination: Schema.Schema.Type<typeof Pagination>) {
      const actor = yield* Actor.Actor;
      const models = yield* use((db) =>
        db.query.framework.findMany({
          where: and(eq(tables.framework.orgId, actor.orgId), isNull(tables.framework.deletedAt)),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.framework)
          .where(and(eq(tables.framework.orgId, actor.orgId), isNull(tables.framework.deletedAt))),
      );

      return {
        data: models.map((model) =>
          Framework.Framework.make({
            ...model,
            version: normalizeVersion(model.version),
          }),
        ),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insert = Effect.fn(function* (
      input: Schema.Schema.Type<typeof Framework.CreateFramework>,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("FWK"));
      const model = yield* Framework.make({ ...input, ticket } as Framework.CreateFrameworkInput);
      yield* use((db) => db.insert(tables.framework).values(model));
      const event = yield* Event.make({
        name: Framework.Event.created,
        entityId: model.id,
        entityType: EntityType.Framework,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Framework.FrameworkId>;
      data: Schema.Schema.Type<typeof Framework.UpdateFramework>;
    }) {
      const model = yield* getById(id);

      const updatedModel = yield* Framework.update(model, data);
      yield* use((db) => db.insert(tables.framework).values(updatedModel));
      const event = yield* Event.make({
        name: Framework.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Framework,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Framework.FrameworkId>) {
      const model = yield* getById(id);

      const removedModel = yield* Framework.remove(model);
      yield* use((db) => db.insert(tables.framework).values(removedModel));
      const event = yield* Event.make({
        name: Framework.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Framework,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    const summaryList = Effect.fn(function* () {
      const actor = yield* Actor.Actor;
      const orgId = actor.orgId;

      const result = yield* use((db) =>
        db.execute<{
          id: string;
          name: string;
          version: string | null;
          status: string;
          description: string | null;
          total_controls: string;
          active_controls: string;
          completion_pct: string;
          unmanaged_risks: string;
          open_issues: string;
          linked_audits: string;
          has_upcoming_audit: boolean;
        }>(sql`
          SELECT
            f.id,
            f.name,
            f.version,
            f.status,
            f.description,
            COALESCE(cs.total, 0) AS total_controls,
            COALESCE(cs.active, 0) AS active_controls,
            CASE
              WHEN COALESCE(cs.total - cs.archived, 0) = 0 THEN 0
              ELSE ROUND(COALESCE(cs.active, 0)::numeric / (cs.total - cs.archived) * 100)
            END AS completion_pct,
            COALESCE(rs.unmanaged, 0) AS unmanaged_risks,
            COALESCE(is_agg.open_count, 0) AS open_issues,
            COALESCE(af.audit_count, 0) AS linked_audits,
            COALESCE(af.has_upcoming, false) AS has_upcoming_audit
          FROM framework f
          LEFT JOIN (
            SELECT
              framework_id,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'active')::int AS active,
              COUNT(*) FILTER (WHERE status = 'archived')::int AS archived
            FROM control
            WHERE deleted_at IS NULL AND org_id = ${orgId}
            GROUP BY framework_id
          ) cs ON cs.framework_id = f.id
          LEFT JOIN (
            SELECT
              c.framework_id,
              COUNT(*)::int AS unmanaged
            FROM risk r
            JOIN control c ON r.control_id = c.id AND c.deleted_at IS NULL
            WHERE r.status = 'open' AND r.treatment IS NULL
              AND r.deleted_at IS NULL AND r.org_id = ${orgId}
            GROUP BY c.framework_id
          ) rs ON rs.framework_id = f.id
          LEFT JOIN (
            SELECT
              c.framework_id,
              COUNT(*)::int AS open_count
            FROM issue i
            JOIN control c ON i.control_id = c.id AND c.deleted_at IS NULL
            WHERE i.status IN ('open', 'in_progress')
              AND i.deleted_at IS NULL AND i.org_id = ${orgId}
            GROUP BY c.framework_id
          ) is_agg ON is_agg.framework_id = f.id
          LEFT JOIN (
            SELECT
              af.framework_id,
              COUNT(DISTINCT af.audit_id)::int AS audit_count,
              BOOL_OR(ar.id IS NOT NULL) AS has_upcoming
            FROM audit_framework af
            LEFT JOIN audit_run ar ON ar.audit_id = af.audit_id
              AND ar.status IN ('planned', 'in_progress')
              AND ar.deleted_at IS NULL
            WHERE af.org_id = ${orgId}
            GROUP BY af.framework_id
          ) af ON af.framework_id = f.id
          WHERE f.deleted_at IS NULL AND f.org_id = ${orgId}
          ORDER BY f.name
        `),
      );

      return result.rows.map((row) =>
        FrameworkSummary.FrameworkSummary.make({
          id: Framework.FrameworkId.make(row.id),
          name: row.name,
          version: normalizeVersion(row.version),
          status: row.status as Framework.WorkflowStatus,
          description: row.description,
          totalControls: Number(row.total_controls),
          activeControls: Number(row.active_controls),
          completionPct: Number(row.completion_pct),
          unmanagedRisks: Number(row.unmanaged_risks),
          openIssues: Number(row.open_issues),
          linkedAudits: Number(row.linked_audits),
          hasUpcomingAudit: row.has_upcoming_audit,
        }),
      );
    });

    const linkAudit = Effect.fn(function* ({
      auditId,
      frameworkId,
    }: {
      auditId: Schema.Schema.Type<typeof Audit.AuditId>;
      frameworkId: Schema.Schema.Type<typeof Framework.FrameworkId>;
    }) {
      const actor = yield* Actor.Actor;
      const now = yield* DateTime.now;

      yield* use((db) =>
        db
          .insert(tables.auditFramework)
          .values({
            auditId,
            frameworkId,
            orgId: actor.orgId,
            createdAt: now,
          })
          .onConflictDoNothing(),
      );
    });

    const unlinkAudit = Effect.fn(function* ({
      auditId,
      frameworkId,
    }: {
      auditId: Schema.Schema.Type<typeof Audit.AuditId>;
      frameworkId: Schema.Schema.Type<typeof Framework.FrameworkId>;
    }) {
      const actor = yield* Actor.Actor;

      yield* use((db) =>
        db
          .delete(tables.auditFramework)
          .where(
            and(
              eq(tables.auditFramework.auditId, auditId),
              eq(tables.auditFramework.frameworkId, frameworkId),
              eq(tables.auditFramework.orgId, actor.orgId),
            ),
          ),
      );
    });

    const listAuditLinks = Effect.fn(function* (filter?: {
      frameworkId?: Schema.Schema.Type<typeof Framework.FrameworkId>;
      auditId?: Schema.Schema.Type<typeof Audit.AuditId>;
    }) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.auditFramework.orgId, actor.orgId)];

      if (filter?.frameworkId) {
        filters.push(eq(tables.auditFramework.frameworkId, filter.frameworkId));
      }
      if (filter?.auditId) {
        filters.push(eq(tables.auditFramework.auditId, filter.auditId));
      }

      const rows = yield* use((db) =>
        db.query.auditFramework.findMany({
          where: and(...filters),
        }),
      );

      return rows.map((row) => ({
        auditId: row.auditId,
        frameworkId: row.frameworkId,
        createdAt: row.createdAt,
      }));
    });

    return {
      getById,
      list,
      remove,
      insert,
      update,
      summaryList,
      linkAudit,
      unlinkAudit,
      listAuditLinks,
    };
  }),
}) {}
