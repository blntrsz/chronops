import {
  Actor,
  AssessmentInstance,
  AssessmentTemplate,
  Base,
  Control,
  EntityType,
  Event,
} from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";
import { TicketService } from "../ticket/service";
import { ULID } from "@chronops/domain/src/base";

export class AssessmentService extends Effect.Service<AssessmentService>()("AssessmentService", {
  dependencies: [ULID.Default, Database.Default, EventService.Default, TicketService.Default],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    const getByIdInstance = Effect.fn(function* (
      id: Schema.Schema.Type<typeof AssessmentInstance.AssessmentInstanceId>,
    ) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.assessmentInstance.findFirst({
          where: and(
            eq(tables.assessmentInstance.id, id),
            eq(tables.assessmentInstance.orgId, actor.orgId),
            isNull(tables.assessmentInstance.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* AssessmentInstance.AssessmentInstanceNotFoundError.fromId(id);
      }

      return AssessmentInstance.AssessmentInstance.make(model);
    });

    const listInstance = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        controlId?: Schema.Schema.Type<typeof Control.ControlId>;
        templateId?: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [
        eq(tables.assessmentInstance.orgId, actor.orgId),
        isNull(tables.assessmentInstance.deletedAt),
      ];

      if (filter?.controlId) {
        filters.push(eq(tables.assessmentInstance.controlId, filter.controlId));
      }

      if (filter?.templateId) {
        filters.push(eq(tables.assessmentInstance.templateId, filter.templateId));
      }

      const models = yield* use((db) =>
        db.query.assessmentInstance.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.assessmentInstance)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => AssessmentInstance.AssessmentInstance.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insertInstance = Effect.fn(function* (
      input: AssessmentInstance.CreateAssessmentInstance,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("ASI"));
      const model = yield* AssessmentInstance.make({
        ...input,
        ticket,
      } as AssessmentInstance.CreateAssessmentInstanceInput);
      yield* use((db) => db.insert(tables.assessmentInstance).values(model));
      const event = yield* Event.make({
        name: AssessmentInstance.Event.created,
        entityId: model.id,
        entityType: EntityType.AssessmentInstance,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    const updateInstance = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof AssessmentInstance.AssessmentInstanceId>;
      data: Schema.Schema.Type<typeof AssessmentInstance.UpdateAssessmentInstance>;
    }) {
      const model = yield* getByIdInstance(id);
      const updatedModel = yield* AssessmentInstance.update(model, data);
      yield* use((db) => db.insert(tables.assessmentInstance).values(updatedModel));
      const event = yield* Event.make({
        name: AssessmentInstance.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.AssessmentInstance,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const removeInstance = Effect.fn(function* (
      id: Schema.Schema.Type<typeof AssessmentInstance.AssessmentInstanceId>,
    ) {
      const model = yield* getByIdInstance(id);
      const removedModel = yield* AssessmentInstance.remove(model);
      yield* use((db) => db.insert(tables.assessmentInstance).values(removedModel));
      const event = yield* Event.make({
        name: AssessmentInstance.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.AssessmentInstance,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    const getByIdTemplate = Effect.fn(function* (
      id: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>,
    ) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.assessmentTemplate.findFirst({
          where: and(
            eq(tables.assessmentTemplate.id, id),
            eq(tables.assessmentTemplate.orgId, actor.orgId),
            isNull(tables.assessmentTemplate.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* AssessmentTemplate.AssessmentTemplateNotFoundError.fromId(id);
      }

      return AssessmentTemplate.AssessmentTemplate.make(model);
    });

    const listTemplate = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        controlId?: Schema.Schema.Type<typeof Control.ControlId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [
        eq(tables.assessmentTemplate.orgId, actor.orgId),
        isNull(tables.assessmentTemplate.deletedAt),
      ];

      if (filter?.controlId) {
        filters.push(eq(tables.assessmentTemplate.controlId, filter.controlId));
      }

      const models = yield* use((db) =>
        db.query.assessmentTemplate.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.assessmentTemplate)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => AssessmentTemplate.AssessmentTemplate.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insertTemplate = Effect.fn(function* (
      input: AssessmentTemplate.CreateAssessmentTemplate,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("AST"));
      const model = yield* AssessmentTemplate.make({
        ...input,
        ticket,
      } as AssessmentTemplate.CreateAssessmentTemplateInput);
      yield* use((db) => db.insert(tables.assessmentTemplate).values(model));
      const event = yield* Event.make({
        name: AssessmentTemplate.Event.created,
        entityId: model.id,
        entityType: EntityType.AssessmentTemplate,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    const updateTemplate = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>;
      data: Schema.Schema.Type<typeof AssessmentTemplate.UpdateAssessmentTemplate>;
    }) {
      const model = yield* getByIdTemplate(id);
      const updatedModel = yield* AssessmentTemplate.update(model, data);
      yield* use((db) => db.insert(tables.assessmentTemplate).values(updatedModel));
      const event = yield* Event.make({
        name: AssessmentTemplate.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.AssessmentTemplate,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const removeTemplate = Effect.fn(function* (
      id: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>,
    ) {
      const model = yield* getByIdTemplate(id);
      const removedModel = yield* AssessmentTemplate.remove(model);
      yield* use((db) => db.insert(tables.assessmentTemplate).values(removedModel));
      const event = yield* Event.make({
        name: AssessmentTemplate.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.AssessmentTemplate,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    return {
      getByIdInstance,
      getByIdTemplate,
      listInstance,
      listTemplate,
      insertInstance,
      insertTemplate,
      updateInstance,
      updateTemplate,
      removeInstance,
      removeTemplate,
    };
  }),
}) {}
