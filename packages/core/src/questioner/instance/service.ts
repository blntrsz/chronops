import { Actor, QuestionerInstance, QuestionerTemplate } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../../common/repository";
import { EventService } from "../../common/service/event-service";
import { Database } from "../../db";

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

export class QuestionerInstanceService extends Effect.Service<QuestionerInstanceService>()(
  "QuestionerInstanceService",
  {
    effect: Effect.gen(function* () {
      const { use, tables } = yield* Database;
      const eventService = yield* EventService;

      const toModel = (model: typeof tables.questionerInstance.$inferSelect) =>
        QuestionerInstance.QuestionerInstance.make({
          ...model,
          responses: parseResponses(model.responses),
        });

      const toInsert = (model: QuestionerInstance.QuestionerInstance) => ({
        ...model,
        responses: stringifyResponses(model.responses),
      });

      const getById = Effect.fn(function* (
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

      const list = Effect.fn(function* (
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

      const insert = Effect.fn(function* (input: QuestionerInstance.CreateQuestionerInstance) {
        const model = yield* QuestionerInstance.make(input);
        yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(model)));
        const event = yield* QuestionerInstance.makeCreateQuestionerInstanceEvent(null, model);
        yield* eventService.append(event);
        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>;
        data: Schema.Schema.Type<typeof QuestionerInstance.UpdateQuestionerInstance>;
      }) {
        const model = yield* getById(id);
        if (model.workflowStatus === "submitted") {
          return model;
        }
        const updatedModel = yield* QuestionerInstance.update(model, data);
        yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(updatedModel)));
        const event = yield* QuestionerInstance.makeUpdateQuestionerInstanceEvent(
          model,
          updatedModel,
        );
        yield* eventService.append(event);
        return updatedModel;
      });

      const submit = Effect.fn(function* (
        id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>,
      ) {
        const model = yield* getById(id);
        if (model.workflowStatus === "submitted") return model;
        const updatedModel = yield* QuestionerInstance.submit(model);
        yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(updatedModel)));
        const event = yield* QuestionerInstance.makeSubmitQuestionerInstanceEvent(
          model,
          updatedModel,
        );
        yield* eventService.append(event);
        return updatedModel;
      });

      const remove = Effect.fn(function* (
        id: Schema.Schema.Type<typeof QuestionerInstance.QuestionerInstanceId>,
      ) {
        const model = yield* getById(id);
        if (model.workflowStatus === "submitted") return;
        const removedModel = yield* QuestionerInstance.remove(model);
        yield* use((db) => db.insert(tables.questionerInstance).values(toInsert(removedModel)));
        const event = yield* QuestionerInstance.makeDeleteQuestionerInstanceEvent(
          model,
          removedModel,
        );
        yield* eventService.append(event);
      });

      return {
        getById,
        list,
        insert,
        update,
        submit,
        remove,
      };
    }),
  },
) {}
