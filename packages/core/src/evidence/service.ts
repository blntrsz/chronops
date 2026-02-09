import { Actor, Control, EntityType, Event, Evidence, Pdf } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";

export class EvidenceService extends Effect.Service<EvidenceService>()("EvidenceService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;

    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Evidence.EvidenceId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.evidence.findFirst({
          where: and(
            eq(tables.evidence.id, id),
            eq(tables.evidence.orgId, actor.orgId),
            isNull(tables.evidence.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Evidence.EvidenceNotFoundError.fromId(id);
      }

      return Evidence.Evidence.make(model);
    });

    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        controlId?: Schema.Schema.Type<typeof Control.ControlId>;
        pdfId?: Schema.Schema.Type<typeof Pdf.PdfId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.evidence.orgId, actor.orgId), isNull(tables.evidence.deletedAt)];

      if (filter?.controlId) {
        filters.push(eq(tables.evidence.controlId, filter.controlId));
      }

      if (filter?.pdfId) {
        filters.push(eq(tables.evidence.pdfId, filter.pdfId));
      }

      const models = yield* use((db) =>
        db.query.evidence.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.evidence)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Evidence.Evidence.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    const insert = Effect.fn(function* (input: Evidence.CreateEvidence) {
      const model = yield* Evidence.make(input);
      yield* use((db) => db.insert(tables.evidence).values(model));
      const event = yield* Event.make({
        name: Evidence.Event.created,
        entityId: model.id,
        entityType: EntityType.Evidence,
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
      id: Schema.Schema.Type<typeof Evidence.EvidenceId>;
      data: Schema.Schema.Type<typeof Evidence.UpdateEvidence>;
    }) {
      const model = yield* getById(id);
      const updatedModel = yield* Evidence.update(model, data);
      yield* use((db) => db.insert(tables.evidence).values(updatedModel));
      const event = yield* Event.make({
        name: Evidence.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Evidence,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Evidence.EvidenceId>) {
      const model = yield* getById(id);
      const removedModel = yield* Evidence.remove(model);
      yield* use((db) => db.insert(tables.evidence).values(removedModel));
      const event = yield* Event.make({
        name: Evidence.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Evidence,
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
