import { Actor, QuestionerTemplate } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../../common/repository";
import { EventService } from "../../common/service/event-service";
import { Database } from "../../db";

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

export class QuestionerTemplateService extends Effect.Service<QuestionerTemplateService>()(
  "QuestionerTemplateService",
  {
    effect: Effect.gen(function* () {
      const { use, tables } = yield* Database;
      const eventService = yield* EventService;

      const toModel = (model: typeof tables.questionerTemplate.$inferSelect) =>
        QuestionerTemplate.QuestionerTemplate.make({
          ...model,
          questions: parseQuestions(model.questions),
        });

      const toInsert = (model: QuestionerTemplate.QuestionerTemplate) => ({
        ...model,
        questions: stringifyQuestions(model.questions),
      });

      const getById = Effect.fn(function* (
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

        return toModel(model);
      });

      const list = Effect.fn(function* (pagination: Schema.Schema.Type<typeof Pagination>) {
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
          data: models.map(toModel),
          total: total?.count ?? 0,
          page: pagination.page,
          size: pagination.size,
        };
      });

      const insert = Effect.fn(function* (input: QuestionerTemplate.CreateQuestionerTemplate) {
        const model = yield* QuestionerTemplate.make(input);
        yield* use((db) => db.insert(tables.questionerTemplate).values(toInsert(model)));
        const event = yield* QuestionerTemplate.makeCreateQuestionerTemplateEvent(null, model);
        yield* eventService.append(event);
        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Schema.Schema.Type<typeof QuestionerTemplate.QuestionerTemplateId>;
        data: Schema.Schema.Type<typeof QuestionerTemplate.UpdateQuestionerTemplate>;
      }) {
        const model = yield* getById(id);
        const updatedModel = yield* QuestionerTemplate.update(model, data);
        yield* use((db) => db.insert(tables.questionerTemplate).values(toInsert(updatedModel)));
        const event = yield* QuestionerTemplate.makeUpdateQuestionerTemplateEvent(
          model,
          updatedModel,
        );
        yield* eventService.append(event);
        return updatedModel;
      });

      const remove = Effect.fn(function* (
        id: Schema.Schema.Type<typeof QuestionerTemplate.QuestionerTemplateId>,
      ) {
        const model = yield* getById(id);
        const removedModel = yield* QuestionerTemplate.remove(model);
        yield* use((db) => db.insert(tables.questionerTemplate).values(toInsert(removedModel)));
        const event = yield* QuestionerTemplate.makeDeleteQuestionerTemplateEvent(
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
        remove,
      };
    }),
  },
) {}
