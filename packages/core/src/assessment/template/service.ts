import { Actor, AssessmentTemplate, Control } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../../common/repository";
import { EventService } from "../../common/service/event-service";
import { Database } from "../../db";

export class AssessmentTemplateService extends Effect.Service<AssessmentTemplateService>()(
  "AssessmentTemplateService",
  {
    effect: Effect.gen(function* () {
      const { use, tables } = yield* Database;
      const eventService = yield* EventService;

      const getById = Effect.fn(function* (
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

      const list = Effect.fn(function* (
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

      const insert = Effect.fn(function* (input: AssessmentTemplate.CreateAssessmentTemplate) {
        const model = yield* AssessmentTemplate.make(input);
        yield* use((db) => db.insert(tables.assessmentTemplate).values(model));
        const event = yield* AssessmentTemplate.makeCreateAssessmentTemplateEvent(null, model);
        yield* eventService.append(event);
        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>;
        data: Schema.Schema.Type<typeof AssessmentTemplate.UpdateAssessmentTemplate>;
      }) {
        const model = yield* getById(id);
        const updatedModel = yield* AssessmentTemplate.update(model, data);
        yield* use((db) => db.insert(tables.assessmentTemplate).values(updatedModel));
        const event = yield* AssessmentTemplate.makeUpdateAssessmentTemplateEvent(
          model,
          updatedModel,
        );
        yield* eventService.append(event);
        return updatedModel;
      });

      const remove = Effect.fn(function* (
        id: Schema.Schema.Type<typeof AssessmentTemplate.AssessmentTemplateId>,
      ) {
        const model = yield* getById(id);
        const removedModel = yield* AssessmentTemplate.remove(model);
        yield* use((db) => db.insert(tables.assessmentTemplate).values(removedModel));
        const event = yield* AssessmentTemplate.makeDeleteAssessmentTemplateEvent(
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
