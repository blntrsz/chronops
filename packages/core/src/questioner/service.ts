import {
  Actor,
  Base,
  EntityType,
  Event,
  QuestionerInstance,
  QuestionerTemplate,
} from "@chronops/domain";
import { ULID } from "@chronops/domain/src/base";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";
import { TicketService } from "../ticket/service";

const stringifyResponses = (responses: readonly QuestionerInstance.QuestionerResponse[]) =>
  JSON.stringify([...responses]);

const parseResponses = (raw: string) => {
  if (!raw) return [] as QuestionerInstance.QuestionerResponse[];
  const parsed = Schema.decodeUnknownEither(Schema.Array(QuestionerInstance.QuestionerResponse))(
    JSON.parse(raw),
  );
  if (parsed._tag === "Left") {
    throw parsed.left;
  }
  return parsed.right;
};

const stringifyQuestions = (questions: readonly QuestionerTemplate.QuestionerQuestion[]) =>
  JSON.stringify([...questions]);

const parseQuestions = (raw: string) => {
  if (!raw) return [] as QuestionerTemplate.QuestionerQuestion[];
  const parsed = Schema.decodeUnknownEither(Schema.Array(QuestionerTemplate.QuestionerQuestion))(
    JSON.parse(raw),
  );
  if (parsed._tag === "Left") {
    throw parsed.left;
  }
  return parsed.right;
};

export class QuestionerService extends Effect.Service<QuestionerService>()("QuestionerService", {
  dependencies: [ULID.Default, Database.Default, EventService.Default, TicketService.Default],
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    const toModel = (model: typeof tables.questionerInstance.$inferSelect) =>
      QuestionerInstance.QuestionerInstance.make({
        ...model,
        responses: parseResponses(model.responses),
      });

    const toInsert = (model: QuestionerInstance.QuestionerInstance) => ({
      ...model,
      responses: stringifyResponses(model.responses),
    });

    const getByIdInstance = Effect.fn(function* (
      id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>,
    ) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.questionerInstance.findFirst({
          where: and(
            eq(tables.questionerInstance.id, id),
            eq(tables.questionerInstance.orgId, actor.orgId),
            isNull(tables.questionerInstance.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* QuestionerInstance.QuestionerInstanceNotFoundError.fromId(id);
      }

      return toModel(model);
    });

    const listInstance = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        templateId?: Schema.Schema.Type<typeof QuestionerTemplate.QuestionerTemplateId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [
        eq(tables.questionerInstance.orgId, actor.orgId),
        isNull(tables.questionerInstance.deletedAt),
      ];

      if (filter?.templateId) {
        filters.push(eq(tables.questionerInstance.templateId, filter.templateId));
      }

      const models = yield* use((db) =>
        db.query.questionerInstance.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.questionerInstance)
          .where(and(...filters)),
      );

      return {
        data: models.map(toModel),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insertInstance = Effect.fn(function* (
      input: QuestionerInstance.CreateQuestionerInstance,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("QSI"));
      const model = yield* QuestionerInstance.make({
        ...input,
        ticket,
      } as QuestionerInstance.CreateQuestionerInstanceInput);
      yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(model)));
      const event = yield* Event.make({
        name: QuestionerInstance.Event.created,
        entityId: model.id,
        entityType: EntityType.QuestionerInstance,
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
      id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>;
      data: Schema.Schema.Type<typeof QuestionerInstance.UpdateQuestionerInstance>;
    }) {
      const model = yield* getByIdInstance(id);
      if (model.workflowStatus === "submitted") {
        return model;
      }
      const updatedModel = yield* QuestionerInstance.update(model, data);
      yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(updatedModel)));
      const event = yield* Event.make({
        name: QuestionerInstance.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.QuestionerInstance,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const submitInstance = Effect.fn(function* (
      id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>,
    ) {
      const model = yield* getByIdInstance(id);
      if (model.workflowStatus === "submitted") return model;
      const updatedModel = yield* QuestionerInstance.submit(model);
      yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(updatedModel)));
      const event = yield* Event.make({
        name: QuestionerInstance.Event.submitted,
        entityId: updatedModel.id,
        entityType: EntityType.QuestionerInstance,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const removeInstance = Effect.fn(function* (
      id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>,
    ) {
      const model = yield* getByIdInstance(id);
      if (model.workflowStatus === "submitted") return;
      const removedModel = yield* QuestionerInstance.remove(model);
      yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(removedModel)));
      const event = yield* Event.make({
        name: QuestionerInstance.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.QuestionerInstance,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    const toModelTemplate = (model: typeof tables.questionerTemplate.$inferSelect) =>
      QuestionerTemplate.QuestionerTemplate.make({
        ...model,
        questions: parseQuestions(model.questions),
      });

    const toInsertTemplate = (model: QuestionerTemplate.QuestionerTemplate) => ({
      ...model,
      questions: stringifyQuestions(model.questions),
    });

    const getByIdTemplate = Effect.fn(function* (
      id: Schema.Schema.Type<typeof QuestionerTemplate.QuestionerTemplateId>,
    ) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.questionerTemplate.findFirst({
          where: and(
            eq(tables.questionerTemplate.id, id),
            eq(tables.questionerTemplate.orgId, actor.orgId),
            isNull(tables.questionerTemplate.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* QuestionerTemplate.QuestionerTemplateNotFoundError.fromId(id);
      }

      return toModelTemplate(model);
    });

    const listTemplate = Effect.fn(function* (pagination: Schema.Schema.Type<typeof Pagination>) {
      const actor = yield* Actor.Actor;
      const filters = [
        eq(tables.questionerTemplate.orgId, actor.orgId),
        isNull(tables.questionerTemplate.deletedAt),
      ];

      const models = yield* use((db) =>
        db.query.questionerTemplate.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.questionerTemplate)
          .where(and(...filters)),
      );

      return {
        data: models.map(toModelTemplate),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insertTemplate = Effect.fn(function* (
      input: QuestionerTemplate.CreateQuestionerTemplate,
    ) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("QST"));
      const model = yield* QuestionerTemplate.make({
        ...input,
        ticket,
      } as QuestionerTemplate.CreateQuestionerTemplateInput);
      yield* use((db) => db.insert(tables.questionerTemplate).values(toInsertTemplate(model)));
      const event = yield* Event.make({
        name: QuestionerTemplate.Event.created,
        entityId: model.id,
        entityType: EntityType.QuestionerTemplate,
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
      id: Schema.Schema.Type<typeof QuestionerTemplate.QuestionerTemplateId>;
      data: Schema.Schema.Type<typeof QuestionerTemplate.UpdateQuestionerTemplate>;
    }) {
      const model = yield* getByIdTemplate(id);
      const updatedModel = yield* QuestionerTemplate.update(model, data);
      yield* use((db) =>
        db.insert(tables.questionerTemplate).values(toInsertTemplate(updatedModel)),
      );
      const event = yield* Event.make({
        name: QuestionerTemplate.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.QuestionerTemplate,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const removeTemplate = Effect.fn(function* (
      id: Schema.Schema.Type<typeof QuestionerTemplate.QuestionerTemplateId>,
    ) {
      const model = yield* getByIdTemplate(id);
      const removedModel = yield* QuestionerTemplate.remove(model);
      yield* use((db) =>
        db.insert(tables.questionerTemplate).values(toInsertTemplate(removedModel)),
      );
      const event = yield* Event.make({
        name: QuestionerTemplate.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.QuestionerTemplate,
        revisionId: removedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
    });

    return {
      getByIdInstance,
      listInstance,
      insertInstance,
      updateInstance,
      submitInstance,
      removeInstance,

      getByIdTemplate,
      listTemplate,
      insertTemplate,
      updateTemplate,
      removeTemplate,
    };
  }),
}) {}
