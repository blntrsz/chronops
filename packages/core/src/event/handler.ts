import { Effect, Layer } from "effect";
import { EventContract } from "./contract";
import { EventService } from "../common/service/event-service";

export const EventHandler = EventContract.toLayer(
  Effect.gen(function* () {
    const service = yield* EventService;

    return {
      EventList: ({ page, size, name, actorId, entityType, entityId }) =>
        service.list({ page, size }, { name, actorId, entityType, entityId }),
    };
  }),
).pipe(Layer.provide(EventService.Default));
