import { Actor, AssessmentTemplate, Audit } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { Database } from "../db";

export class AuditService extends Effect.Service<AuditService>()("AuditService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;

    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Audit.AuditId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.audit.findFirst({
          where: and(
            eq(tables.audit.id, id),
            eq(tables.audit.orgId, actor.orgId),
            isNull(tables.audit.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Audit.AuditNotFoundError.fromId(id);
      }

      return Audit.Audit.make(model);
    });

    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        assessmentMethodId?: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>;
        status?: Schema.Schema.Type<typeof Audit.AuditStatus>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.audit.orgId, actor.orgId), isNull(tables.audit.deletedAt)];

      if (filter?.assessmentMethodId) {
        filters.push(eq(tables.audit.assessmentMethodId, filter.assessmentMethodId));
      }

      if (filter?.status) {
        filters.push(eq(tables.audit.status, filter.status));
      }

      const models = yield* use((db) =>
        db.query.audit.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.audit)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Audit.Audit.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insert = Effect.fn(function* (input: Audit.CreateAudit) {
      const model = yield* Audit.make(input);
      yield* use((db) => db.insert(tables.audit).values(model));
      return model;
    });

    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Audit.AuditId>;
      data: Schema.Schema.Type<typeof Audit.UpdateAudit>;
    }) {
      const model = yield* getById(id);
      const updatedModel = yield* Audit.update(model, data);
      yield* use((db) => db.insert(tables.audit).values(updatedModel));
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Audit.AuditId>) {
      const model = yield* getById(id);
      const removedModel = yield* Audit.remove(model);
      yield* use((db) => db.insert(tables.audit).values(removedModel));
    });

    const getRunById = Effect.fn(function* (id: Schema.Schema.Type<typeof Audit.AuditRunId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.auditRun.findFirst({
          where: and(
            eq(tables.auditRun.id, id),
            eq(tables.auditRun.orgId, actor.orgId),
            isNull(tables.auditRun.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Audit.AuditRunNotFoundError.fromId(id);
      }

      return Audit.AuditRun.make(model);
    });

    const listRuns = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        auditId?: Schema.Schema.Type<typeof Audit.AuditId>;
        assessmentMethodId?: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>;
        status?: Schema.Schema.Type<typeof Audit.AuditRunStatus>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.auditRun.orgId, actor.orgId), isNull(tables.auditRun.deletedAt)];

      if (filter?.auditId) {
        filters.push(eq(tables.auditRun.auditId, filter.auditId));
      }

      if (filter?.assessmentMethodId) {
        filters.push(eq(tables.auditRun.assessmentMethodId, filter.assessmentMethodId));
      }

      if (filter?.status) {
        filters.push(eq(tables.auditRun.status, filter.status));
      }

      const models = yield* use((db) =>
        db.query.auditRun.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
          orderBy: (auditRun, { desc }) => [desc(auditRun.updatedAt)],
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.auditRun)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Audit.AuditRun.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insertRun = Effect.fn(function* (input: Audit.CreateAuditRun) {
      const model = yield* Audit.makeRun(input);
      yield* use((db) => db.insert(tables.auditRun).values(model));
      return model;
    });

    const startRun = Effect.fn(function* (id: Schema.Schema.Type<typeof Audit.AuditRunId>) {
      const model = yield* getRunById(id);
      const updatedModel = yield* Audit.startRun(model);
      yield* use((db) => db.insert(tables.auditRun).values(updatedModel));
      return updatedModel;
    });

    const completeRun = Effect.fn(function* (id: Schema.Schema.Type<typeof Audit.AuditRunId>) {
      const model = yield* getRunById(id);
      const updatedModel = yield* Audit.markRunCompleted(model);
      yield* use((db) => db.insert(tables.auditRun).values(updatedModel));
      return updatedModel;
    });

    const failRun = Effect.fn(function* (id: Schema.Schema.Type<typeof Audit.AuditRunId>) {
      const model = yield* getRunById(id);
      const updatedModel = yield* Audit.markRunFailed(model);
      yield* use((db) => db.insert(tables.auditRun).values(updatedModel));
      return updatedModel;
    });

    return {
      getById,
      list,
      insert,
      update,
      remove,
      getRunById,
      listRuns,
      insertRun,
      startRun,
      completeRun,
      failRun,
    };
  }),
}) {}
