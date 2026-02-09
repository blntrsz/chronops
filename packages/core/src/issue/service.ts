import {
  Actor,
  AssessmentInstance,
  Control,
  EntityType,
  Event,
  Evidence,
  Issue,
} from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";

export class IssueService extends Effect.Service<IssueService>()("IssueService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;

    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Issue.IssueId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.issue.findFirst({
          where: and(
            eq(tables.issue.id, id),
            eq(tables.issue.orgId, actor.orgId),
            isNull(tables.issue.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Issue.IssueNotFoundError.fromId(id);
      }

      return Issue.Issue.make(model);
    });

    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        controlId?: Schema.Schema.Type<typeof Control.ControlId>;
        assessmentInstanceId?: Schema.Schema.Type<typeof AssessmentInstance.AssessmentInstanceId>;
        evidenceId?: Schema.Schema.Type<typeof Evidence.EvidenceId>;
        status?: Schema.Schema.Type<typeof Issue.IssueStatus>;
        type?: Schema.Schema.Type<typeof Issue.IssueType>;
        severity?: Schema.Schema.Type<typeof Issue.IssueSeverity>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.issue.orgId, actor.orgId), isNull(tables.issue.deletedAt)];

      if (filter?.controlId) {
        filters.push(eq(tables.issue.controlId, filter.controlId));
      }

      if (filter?.assessmentInstanceId) {
        filters.push(eq(tables.issue.assessmentInstanceId, filter.assessmentInstanceId));
      }

      if (filter?.evidenceId) {
        filters.push(eq(tables.issue.evidenceId, filter.evidenceId));
      }

      if (filter?.status) {
        filters.push(eq(tables.issue.status, filter.status));
      }

      if (filter?.type) {
        filters.push(eq(tables.issue.type, filter.type));
      }

      if (filter?.severity) {
        filters.push(eq(tables.issue.severity, filter.severity));
      }

      const models = yield* use((db) =>
        db.query.issue.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.issue)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Issue.Issue.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insert = Effect.fn(function* (input: Issue.CreateIssue) {
      const model = yield* Issue.make(input);
      yield* use((db) => db.insert(tables.issue).values(model));
      const event = yield* Event.make({
        name: Issue.Event.created,
        entityId: model.id,
        entityType: EntityType.Issue,
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
      id: Schema.Schema.Type<typeof Issue.IssueId>;
      data: Schema.Schema.Type<typeof Issue.UpdateIssue>;
    }) {
      const model = yield* getById(id);
      const updatedModel = yield* Issue.update(model, data);
      yield* use((db) => db.insert(tables.issue).values(updatedModel));
      const event = yield* Event.make({
        name: Issue.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Issue,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Issue.IssueId>) {
      const model = yield* getById(id);
      const removedModel = yield* Issue.remove(model);
      yield* use((db) => db.insert(tables.issue).values(removedModel));
      const event = yield* Event.make({
        name: Issue.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Issue,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    return {
      getById,
      list,
      insert,
      update,
      remove,
    };
  }),
}) {}
