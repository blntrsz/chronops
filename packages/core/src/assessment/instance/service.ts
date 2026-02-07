import { Actor, AssessmentInstance, AssessmentTemplate, Control } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../../common/repository";
import { Database } from "../../db";

export class AssessmentInstanceService extends Effect.Service<AssessmentInstanceService>()(
  "AssessmentInstanceService",
  {
    effect: Effect.gen(function* () {
      const { use, tables } = yield* Database;

      const getById = Effect.fn(function* (
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

      const list = Effect.fn(function* (
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

      const insert = Effect.fn(function* (input: AssessmentInstance.CreateAssessmentInstance) {
        const model = yield* AssessmentInstance.make(input);
        yield* use((db) => db.insert(tables.assessmentInstance).values(model));
        return model;
      });

      const update = Effect.fn(function* ({
        id,
        data,
      }: {
        id: Schema.Schema.Type<typeof AssessmentInstance.AssessmentInstanceId>;
        data: Schema.Schema.Type<typeof AssessmentInstance.UpdateAssessmentInstance>;
      }) {
        const model = yield* getById(id);
        const updatedModel = yield* AssessmentInstance.update(model, data);
        yield* use((db) => db.insert(tables.assessmentInstance).values(updatedModel));
        return updatedModel;
      });

      const remove = Effect.fn(function* (
        id: Schema.Schema.Type<typeof AssessmentInstance.AssessmentInstanceId>,
      ) {
        const model = yield* getById(id);
        const removedModel = yield* AssessmentInstance.remove(model);
        yield* use((db) => db.insert(tables.assessmentInstance).values(removedModel));
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
