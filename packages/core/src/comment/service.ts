import { Actor, Base, Comment, EntityType, Event } from "@chronops/domain";
import { and, count, eq, isNull } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { Pagination } from "../common/repository";
import { EventService } from "../common/service/event-service";
import { Database } from "../db";
import { TicketService } from "../ticket/service";

export class CommentService extends Effect.Service<CommentService>()("CommentService", {
  effect: Effect.gen(function* () {
    const { use, tables } = yield* Database;
    const eventService = yield* EventService;
    const ticketService = yield* TicketService;

    /**
     * Get a comment by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const getById = Effect.fn(function* (id: Schema.Schema.Type<typeof Comment.CommentId>) {
      const actor = yield* Actor.Actor;
      const model = yield* use((db) =>
        db.query.comment.findFirst({
          where: and(
            eq(tables.comment.id, id),
            eq(tables.comment.orgId, actor.orgId),
            isNull(tables.comment.deletedAt),
          ),
        }),
      );

      if (!model) {
        throw yield* Comment.CommentNotFoundError.fromId(id);
      }

      return Comment.Comment.make(model);
    });

    /**
     * List comments with pagination.
     * @since 1.0.0
     * @category service-method
     */
    const list = Effect.fn(function* (
      pagination: Schema.Schema.Type<typeof Pagination>,
      filter?: {
        entityId?: Schema.Schema.Type<typeof Comment.CommentEntityId>;
      },
    ) {
      const actor = yield* Actor.Actor;
      const filters = [eq(tables.comment.orgId, actor.orgId), isNull(tables.comment.deletedAt)];

      if (filter?.entityId) {
        filters.push(eq(tables.comment.entityId, filter.entityId));
      }

      const models = yield* use((db) =>
        db.query.comment.findMany({
          where: and(...filters),
          offset: (pagination.page - 1) * pagination.size,
          limit: pagination.size,
        }),
      );

      const [total] = yield* use((db) =>
        db
          .select({ count: count() })
          .from(tables.comment)
          .where(and(...filters)),
      );

      return {
        data: models.map((model) => Comment.Comment.make(model)),
        total: total?.count ?? 0,
        page: pagination.page,
        size: pagination.size,
      };
    });

    /**
     * Insert a new comment.
     * @since 1.0.0
     * @category service-method
     */
    const insert = Effect.fn(function* (input: Comment.CreateComment) {
      const actor = yield* Actor.Actor;
      const ticket = yield* ticketService.next(actor.orgId, Base.TicketPrefix.make("CMT"));
      const model = yield* Comment.make({ ...input, ticket } as Comment.CreateCommentInput);
      yield* use((db) => db.insert(tables.comment).values(model));
      const event = yield* Event.make({
        name: Comment.Event.created,
        entityId: model.id,
        entityType: EntityType.Comment,
        revisionId: model.revisionId,
        revisionIdBefore: null,
      });
      yield* eventService.append(event);
      return model;
    });

    /**
     * Update an existing comment.
     * @since 1.0.0
     * @category service-method
     */
    const update = Effect.fn(function* ({
      id,
      data,
    }: {
      id: Schema.Schema.Type<typeof Comment.CommentId>;
      data: Schema.Schema.Type<typeof Comment.UpdateComment>;
    }) {
      const model = yield* getById(id);

      const updatedModel = yield* Comment.update(model, data);
      yield* use((db) => db.insert(tables.comment).values(updatedModel));
      const event = yield* Event.make({
        name: Comment.Event.updated,
        entityId: updatedModel.id,
        entityType: EntityType.Comment,
        revisionId: updatedModel.revisionId,
        revisionIdBefore: model.revisionId,
      });
      yield* eventService.append(event);
      return updatedModel;
    });

    /**
     * Remove a comment by its ID.
     * @since 1.0.0
     * @category service-method
     */
    const remove = Effect.fn(function* (id: Schema.Schema.Type<typeof Comment.CommentId>) {
      const model = yield* getById(id);
      const removedModel = yield* Comment.remove(model);
      yield* use((db) => db.insert(tables.comment).values(removedModel));
      const event = yield* Event.make({
        name: Comment.Event.deleted,
        entityId: removedModel.id,
        entityType: EntityType.Comment,
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
